"""Capture the six face-direction classes directly from a webcam."""
import time
from pathlib import Path
import cv2
from config import (
    AUTO_CAPTURE_INTERVAL_SECONDS, CAMERA_HEIGHT, CAMERA_WIDTH,
    CAPTURE_TARGET_PER_CLASS, FACE_CLASSES, FACE_DATASET_DIR, MIRROR_PREVIEW,
    WEBCAM_INDEX, ensure_directories, validate_config,
)
from .face_detection import FaceDetector

INSTRUCTIONS = {
    "normal": "Face the camera naturally",
    "looking_left": "Turn your head naturally to your left",
    "looking_right": "Turn your head naturally to your right",
    "looking_up": "Tilt your head naturally upward",
    "looking_down": "Tilt your head naturally downward",
    "eyes_closed": "Close your eyes naturally",
}


def count_images(directory: Path) -> int:
    return sum(1 for path in directory.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png"})


def capture_dataset() -> None:
    validate_config()
    detector = FaceDetector()
    camera = cv2.VideoCapture(WEBCAM_INDEX)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
    if not camera.isOpened():
        raise RuntimeError("Unable to open webcam. Check permissions and WEBCAM_INDEX in config.py.")
    class_index, auto_capture_until, last_capture = 0, 0.0, 0.0
    mouse_state = {"capture_requested": False}

    def handle_mouse(event, _x, _y, _flags, _param):
        if event == cv2.EVENT_LBUTTONDOWN:
            mouse_state["capture_requested"] = True

    window_name = "Face Dataset Capture"
    cv2.namedWindow(window_name)
    cv2.setMouseCallback(window_name, handle_mouse)
    try:
        while 0 <= class_index < len(FACE_CLASSES):
            class_name = FACE_CLASSES[class_index]
            directory = FACE_DATASET_DIR / class_name
            captured = count_images(directory)
            ok, frame = camera.read()
            if not ok:
                raise RuntimeError("The webcam returned an invalid frame.")
            if MIRROR_PREVIEW:
                frame = cv2.flip(frame, 1)
            faces = detector.detect(frame)
            display = frame.copy()
            cv2.putText(display, f"Class: {class_name} - {INSTRUCTIONS[class_name]}",
                        (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 255), 2)
            cv2.putText(display, f"Images: {captured}/{CAPTURE_TARGET_PER_CLASS} | detected faces: {len(faces)}",
                        (15, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(display, "LEFT CLICK/SPACE capture | A auto | N/P next/previous | R reset | Q quit",
                        (15, display.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            for face in faces:
                x, y, w, h = face
                cv2.rectangle(display, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.imshow(window_name, display)
            key = cv2.waitKey(1) & 0xFF
            now = time.monotonic()
            clicked_capture = mouse_state["capture_requested"]
            mouse_state["capture_requested"] = False
            if key == ord("q"):
                break
            if key == ord("n") or captured >= CAPTURE_TARGET_PER_CLASS:
                class_index += 1
                auto_capture_until = 0
                continue
            if key == ord("p"):
                class_index = max(0, class_index - 1)
                continue
            if key == ord("r"):
                captured = count_images(directory)
                continue
            if key == ord("a"):
                auto_capture_until = now + max(10, CAPTURE_TARGET_PER_CLASS * AUTO_CAPTURE_INTERVAL_SECONDS)
            should_capture = clicked_capture or key == 32 or (auto_capture_until and now <= auto_capture_until and
                                           now - last_capture >= AUTO_CAPTURE_INTERVAL_SECONDS)
            if (clicked_capture or key == 32) and not faces:
                cv2.putText(display, "FACE NOT DETECTED - move closer or turn less sharply",
                            (15, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)
            if should_capture and faces and now - last_capture >= 0.05:
                crop = detector.crop(frame, faces[0])
                if crop.size:
                    filename = directory / f"{class_name}_{time.time_ns()}.jpg"
                    cv2.imwrite(str(filename), cv2.resize(crop, (128, 128)))
                    last_capture = now
                    if count_images(directory) >= CAPTURE_TARGET_PER_CLASS:
                        auto_capture_until = 0
    finally:
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    ensure_directories()
    capture_dataset()
