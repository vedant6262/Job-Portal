"""Desktop OpenCV examination monitor. Start with: python main.py"""
import time
import uuid
from datetime import datetime, timezone
import cv2
from config import (
    CAMERA_HEIGHT, CAMERA_WIDTH, DIRECTION_EVENT_SECONDS, FACE_ABSENCE_SECONDS, MIRROR_PREVIEW,
    PERSON_CONFIDENCE_THRESHOLD, PHONE_CONFIRMATION_FRAMES, PHONE_TRACK_IOU_THRESHOLD,
    SCORE_RULES, WEBCAM_INDEX, validate_config,
)
from src.database import Database
from src.event_tracker import EventTracker
from src.face_detection import FaceDetector
from src.face_direction import FaceDirectionClassifier
from src.person_detection import PersonDetector
from src.phone_detection import MISSING_MODEL_MESSAGE, PhoneDetector
from src.report_generator import generate_report
from src.suspicion_engine import SuspicionEngine


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def box_iou(first, second):
    first_x, first_y, first_width, first_height = first
    second_x, second_y, second_width, second_height = second
    left, top = max(first_x, second_x), max(first_y, second_y)
    right = min(first_x + first_width, second_x + second_width)
    bottom = min(first_y + first_height, second_y + second_height)
    intersection = max(0, right - left) * max(0, bottom - top)
    union = first_width * first_height + second_width * second_height - intersection
    return intersection / union if union else 0.0


def run():
    validate_config()
    try:
        classifier = FaceDirectionClassifier()
    except FileNotFoundError as error:
        print(error); return
    camera = cv2.VideoCapture(WEBCAM_INDEX)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH); camera.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
    if not camera.isOpened():
        print("Unable to open webcam. Check camera permissions and config.py."); return
    detector, people = FaceDetector(), PersonDetector(PERSON_CONFIDENCE_THRESHOLD)
    try:
        phone_detector = PhoneDetector()
    except (FileNotFoundError, ValueError, OSError) as error:
        print(error)
        phone_detector = None
    database, tracker, engine = Database(), EventTracker(), SuspicionEngine()
    session_id = None; started = None; paused = False; monitoring = False; help_visible = True
    phone_candidate = None; phone_candidate_frames = 0
    try:
        while True:
            ok, frame = camera.read()
            if not ok: print("Webcam frame read failed."); break
            if MIRROR_PREVIEW: frame = cv2.flip(frame, 1)
            if not paused:
                faces = detector.detect(frame); person_boxes = people.detect(frame)
            else:
                faces, person_boxes = [], []
            if not faces:
                classifier.reset()
            now = time.time()
            if monitoring:
                if session_id is None:
                    session_id, started = uuid.uuid4().hex, now
                    database.session(session_id, datetime.fromtimestamp(now, timezone.utc).isoformat())
                absent = not faces and now - started > FACE_ABSENCE_SECONDS
                contribution = engine.add("face_absent") if absent else 0
                if absent and contribution:
                    database.event(session_id, {"type": "face_absent", "start": timestamp(), "end": timestamp(),
                                                "duration": 0, "contribution": contribution, "description": "Face absent"})
                if len(person_boxes) > 1 and engine.add("multiple_people"):
                    database.event(session_id, {"type": "multiple_people", "start": timestamp(), "end": timestamp(),
                                                "duration": 0, "contribution": SCORE_RULES["multiple_people"],
                                                "description": "More than one person detected"})
                raw_phone_boxes = phone_detector.detect(frame) if phone_detector else []
                if raw_phone_boxes:
                    candidate = max(raw_phone_boxes, key=lambda detection: detection[1])
                    if phone_candidate and box_iou(candidate[0], phone_candidate[0]) >= PHONE_TRACK_IOU_THRESHOLD:
                        phone_candidate = candidate
                        phone_candidate_frames += 1
                    else:
                        phone_candidate = candidate
                        phone_candidate_frames = 1
                else:
                    phone_candidate = None
                    phone_candidate_frames = 0
                phone_boxes = (
                    [phone_candidate]
                    if phone_candidate and phone_candidate_frames >= PHONE_CONFIRMATION_FRAMES
                    else []
                )
                for box, confidence in phone_boxes:
                    x, y, w, h = box
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)
                    cv2.putText(frame, f"MOBILE PHONE | {confidence:.1%}", (x, max(20, y-8)),
                                cv2.FONT_HERSHEY_SIMPLEX, .55, (0, 0, 255), 2)
                    contribution = engine.add("phone_detected")
                    if contribution:
                        database.event(session_id, {"type": "phone_detected", "start": timestamp(), "end": timestamp(),
                                                    "duration": 0, "confidence": confidence,
                                                    "contribution": contribution, "description": "Custom phone detector"})
            display = frame.copy()
            if monitoring:
                phone_status = MISSING_MODEL_MESSAGE if phone_detector is None else (
                    "NO PHONE DETECTED" if not phone_boxes else "")
                if phone_status:
                    cv2.putText(display, phone_status, (10, 95), cv2.FONT_HERSHEY_SIMPLEX,
                                .65, (0, 0, 255) if phone_detector is None else (0, 255, 255), 2)
            for box in faces:
                x, y, w, h = box; crop = detector.crop(frame, box)
                label, confidence = classifier.predict(crop, tracking_box=box)
                cv2.rectangle(display, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(display, f"{label} {confidence:.0%}", (x, max(20, y-8)), cv2.FONT_HERSHEY_SIMPLEX, .55, (0,255,0), 2)
                if monitoring and label in {"looking_left", "looking_right", "looking_up", "looking_down"}:
                    event = tracker.update(label, True, confidence, DIRECTION_EVENT_SECONDS)
                    if event:
                        event["type"] = label; event["contribution"] = engine.add(label); database.event(session_id, event)
            status = "PAUSED" if paused else ("MONITORING" if monitoring else "READY")
            cv2.putText(display, f"{status} | people: {len(person_boxes)} faces: {len(faces)} | score: {engine.score} ({engine.level()})",
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, .58, (0, 255, 255), 2)
            if monitoring and not faces: cv2.putText(display, "WARNING: FACE NOT DETECTED", (10, 65), cv2.FONT_HERSHEY_SIMPLEX, .7, (0,0,255), 2)
            if help_visible: cv2.putText(display, "S start/stop | P pause | R reset | H help | Q quit", (10, display.shape[0]-18), cv2.FONT_HERSHEY_SIMPLEX, .55, (255,255,255), 1)
            cv2.imshow("Exam Cheating Detection", display)
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"): break
            if key == ord("h"): help_visible = not help_visible
            elif key == ord("p"): paused = not paused
            elif key == ord("r"): engine.reset(); tracker = EventTracker()
            elif key == ord("s"):
                monitoring = not monitoring
                if not monitoring and session_id:
                    end = time.time(); events = []
                    for event_type, event in tracker.finish():
                        event["type"] = event_type; event["contribution"] = 0; database.event(session_id, event); events.append(event)
                    start_text = datetime.fromtimestamp(started, timezone.utc).isoformat()
                    end_text = datetime.fromtimestamp(end, timezone.utc).isoformat()
                    generate_report(session_id, start_text, end_text, end-started, engine.score, engine.level(), events)
                    database.finish(session_id, end_text, end-started, engine.score, engine.level())
                    session_id, started = None, None
    finally:
        camera.release(); database.close(); cv2.destroyAllWindows()


if __name__ == "__main__":
    run()
