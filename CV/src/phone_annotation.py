"""Manual OpenCV annotation tool for mobile-phone bounding boxes.

Run with:  python -m src.phone_annotation

Controls:
    LEFT drag        draw a phone bounding box
    RIGHT click      delete the box under the cursor (correct a mistake)
    D                delete the last box
    S                save the drawn boxes (phone image)
    X                mark the image as containing no phone
    N                skip this image for now
    B                go back to the previous image
    Q                quit

Annotations are stored as JSON with YOLO-normalized values:
    {"image": "<name>", "boxes": [[0, x_center, y_center, width, height], ...]}
All coordinates are normalized to (0, 1). Invalid boxes (outside the image
or zero width/height) are rejected instead of being saved.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2

from config import PHONE_ANNOTATIONS_DIR, PHONE_IMAGES_DIR, ensure_directories

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def _annotation_path(image_path: Path) -> Path:
    return PHONE_ANNOTATIONS_DIR / f"{image_path.stem}.json"


def _load_existing(image_path: Path) -> list[tuple[int, int, int, int]]:
    """Load any previous boxes for this image so the user can correct them."""
    path = _annotation_path(image_path)
    if not path.exists():
        return []
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    image = cv2.imread(str(image_path))
    if image is None:
        return []
    height, width = image.shape[:2]
    boxes: list[tuple[int, int, int, int]] = []
    for box in payload.get("boxes", []):
        if not isinstance(box, list) or len(box) != 5:
            continue
        _, cx, cy, w, h = (float(value) for value in box)
        x1 = int(round((cx - w / 2) * width))
        y1 = int(round((cy - h / 2) * height))
        x2 = int(round((cx + w / 2) * width))
        y2 = int(round((cy + h / 2) * height))
        boxes.append((x1, y1, x2, y2))
    return boxes


class Annotator:
    def __init__(self):
        self.files: list[Path] = sorted(
            path for path in PHONE_IMAGES_DIR.rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )
        self.index = 0
        self.loaded_index = -1
        self.boxes: list[tuple[int, int, int, int]] = []
        self.start: tuple[int, int] | None = None
        self.current: tuple[int, int] | None = None
        self.image_size: tuple[int, int] = (0, 0)

    def mouse(self, event, x, y, _flags, _param):
        width, height = self.image_size
        x = max(0, min(width - 1, x))
        y = max(0, min(height - 1, y))
        if event == cv2.EVENT_LBUTTONDOWN:
            self.start, self.current = (x, y), (x, y)
        elif event == cv2.EVENT_MOUSEMOVE and self.start:
            self.current = (x, y)
        elif event == cv2.EVENT_LBUTTONUP and self.start:
            x1, x2 = sorted((self.start[0], x))
            y1, y2 = sorted((self.start[1], y))
            if x2 > x1 and y2 > y1:
                self.boxes.append((x1, y1, x2, y2))
            self.start = self.current = None
        elif event == cv2.EVENT_RBUTTONDOWN:
            self._delete_box_at(x, y)

    def _delete_box_at(self, x: int, y: int) -> None:
        for i in range(len(self.boxes) - 1, -1, -1):
            bx1, by1, bx2, by2 = self.boxes[i]
            if bx1 <= x <= bx2 and by1 <= y <= by2:
                self.boxes.pop(i)
                break

    def _validate_boxes(self, width: int, height: int) -> list[list[float]]:
        values: list[list[float]] = []
        for x1, y1, x2, y2 in self.boxes:
            if x2 <= x1 or y2 <= y1:
                raise ValueError(f"Box {(x1, y1, x2, y2)} has zero or negative width/height.")
            if not (0 <= x1 and 0 <= y1 and x2 <= width and y2 <= height):
                raise ValueError(f"Box {(x1, y1, x2, y2)} is outside the image bounds {width}x{height}.")
            normalized = [0, (x1 + x2) / (2 * width), (y1 + y2) / (2 * height),
                          (x2 - x1) / width, (y2 - y1) / height]
            _, cx, cy, w, h = normalized
            if not (0 < cx < 1 and 0 < cy < 1 and 0 < w <= 1 and 0 < h <= 1
                    and 0 <= cx - w / 2 and cx + w / 2 <= 1
                    and 0 <= cy - h / 2 and cy + h / 2 <= 1):
                raise ValueError("Normalized box must be fully inside the image.")
            values.append(normalized)
        return values

    def save_current(self, has_phone: bool) -> None:
        image_path = self.files[self.index]
        image = cv2.imread(str(image_path))
        if image is None:
            raise RuntimeError(f"Cannot read {image_path}")
        height, width = image.shape[:2]
        if image_path.parent.name == "nophone":
            if self.boxes:
                print(f"Note: {image_path.name} is in nophone; saved as an empty annotation.")
            has_phone = False
        values = self._validate_boxes(width, height) if has_phone else []
        output = _annotation_path(image_path)
        output.write_text(
            json.dumps({"image": image_path.name, "boxes": values}, indent=2), encoding="utf-8"
        )
        print(f"Saved annotation for {image_path.name} ({len(values)} box(es)).")

    def run(self) -> None:
        if not self.files:
            print("No phone/nophone images found. Capture images first with "
                  "python -m src.phone_dataset_capture.")
            return
        print(f"Found {len(self.files)} image(s) to annotate.")
        cv2.namedWindow("Phone Annotation")
        cv2.setMouseCallback("Phone Annotation", self.mouse)
        try:
            while 0 <= self.index < len(self.files):
                image_path = self.files[self.index]
                image = cv2.imread(str(image_path))
                if image is None:
                    print(f"Skipping unreadable image: {image_path}")
                    self.index += 1
                    continue
                self.image_size = (image.shape[1], image.shape[0])
                if self.loaded_index != self.index:
                    self.boxes = _load_existing(image_path)
                    self.start = self.current = None
                    self.loaded_index = self.index
                display = image.copy()
                for box in self.boxes:
                    cv2.rectangle(display, box[:2], box[2:], (0, 255, 0), 2)
                if self.start and self.current:
                    cv2.rectangle(display, self.start, self.current, (255, 255, 0), 2)
                folder = image_path.parent.name
                header = (f"{self.index + 1}/{len(self.files)} | {image_path.name} | folder: {folder} | "
                          f"boxes: {len(self.boxes)}")
                help_text = ("drag box | right-click delete | D delete last | S save | X no phone | "
                             "N skip | B back | Q quit")
                cv2.putText(display, header, (10, 25), cv2.FONT_HERSHEY_SIMPLEX, .55, (0, 255, 255), 2)
                cv2.putText(display, help_text, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, .45, (255, 255, 255), 1)
                cv2.imshow("Phone Annotation", display)
                key = cv2.waitKey(20) & 0xFF
                if key == ord("q"):
                    break
                if key in (ord("s"), ord("x")):
                    try:
                        self.save_current(key == ord("s"))
                    except ValueError as error:
                        print(f"REJECTED: {error}")
                        continue
                    self.index += 1
                    self.boxes = []
                elif key == ord("d") and self.boxes:
                    self.boxes.pop()
                elif key == ord("n"):
                    self.index += 1
                    self.boxes = []
                elif key == ord("b"):
                    self.index = max(0, self.index - 1)
                    self.boxes = []
        finally:
            cv2.destroyAllWindows()
            self._report_remaining()

    def _report_remaining(self) -> None:
        pending = []
        for path in (
            path for path in PHONE_IMAGES_DIR.rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        ):
            annotation = _annotation_path(path)
            if not annotation.exists():
                pending.append(path.name)
                continue
            try:
                payload = json.loads(annotation.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                pending.append(path.name)
                continue
            if path.parent.name == "phone" and not payload.get("boxes"):
                pending.append(path.name)
        if pending:
            print(f"\n{len(pending)} image(s) still need annotation "
                  "(missing file, or a phone image with no boxes):")
            for name in pending:
                print(f"  - {name}")
        else:
            print("\nAll phone images have at least one box and all nophone images are empty.")


if __name__ == "__main__":
    ensure_directories()
    Annotator().run()
