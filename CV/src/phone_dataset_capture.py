"""Capture phone and no-phone images from the webcam with the Space key.

Run with:  python -m src.phone_dataset_capture

Controls:
    SPACE  capture the current frame into the active mode folder
    M      switch between "phone" and "nophone"
    Q      quit

Phone frames are saved to dataset/mobile_phone/images/phone.
No-phone frames (including hard negatives such as calculators, remotes,
books, wallets, laptops, hand-only and empty desks) are saved to
dataset/mobile_phone/images/nophone and receive an empty annotation file.
"""
from __future__ import annotations

import time
from pathlib import Path

import cv2

from config import (
    CAMERA_HEIGHT,
    CAMERA_WIDTH,
    PHONE_ANNOTATIONS_DIR,
    PHONE_NEGATIVE_IMAGES_DIR,
    PHONE_POSITIVE_IMAGES_DIR,
    WEBCAM_INDEX,
    ensure_directories,
)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def _unique_path(directory: Path, stem: str) -> Path:
    """Return a .jpg path that does not yet exist, never overwriting files."""
    candidate = directory / f"{stem}.jpg"
    counter = 1
    while candidate.exists():
        candidate = directory / f"{stem}_{counter}.jpg"
        counter += 1
    return candidate


def _count_images(directory: Path) -> int:
    if not directory.exists():
        return 0
    return sum(1 for path in directory.iterdir()
               if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS)


def capture_phone_images() -> None:
    ensure_directories()
    PHONE_POSITIVE_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    PHONE_NEGATIVE_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    PHONE_ANNOTATIONS_DIR.mkdir(parents=True, exist_ok=True)

    camera = cv2.VideoCapture(WEBCAM_INDEX)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
    if not camera.isOpened():
        raise RuntimeError("Unable to open webcam. Check permissions and WEBCAM_INDEX in config.py.")

    mode = "phone"
    print("Webcam capture started in 'phone' mode.")
    print("SPACE capture | M switch mode | Q quit")
    try:
        while True:
            ok, frame = camera.read()
            if not ok or frame is None or frame.size == 0:
                raise RuntimeError("Invalid webcam frame read.")
            phone_count = _count_images(PHONE_POSITIVE_IMAGES_DIR)
            nophone_count = _count_images(PHONE_NEGATIVE_IMAGES_DIR)
            preview = frame.copy()
            cv2.putText(preview, f"Mode: {mode} | SPACE capture | M change mode | Q quit",
                        (15, 30), cv2.FONT_HERSHEY_SIMPLEX, .65, (0, 255, 255), 2)
            cv2.putText(preview, f"phone: {phone_count} | nophone: {nophone_count}",
                        (15, 58), cv2.FONT_HERSHEY_SIMPLEX, .6, (0, 255, 255), 2)
            cv2.imshow("Phone Dataset Capture", preview)
            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break
            if key == ord("m"):
                mode = "nophone" if mode == "phone" else "phone"
                print(f"Mode switched to '{mode}'.")
            if key == 32:
                directory = PHONE_POSITIVE_IMAGES_DIR if mode == "phone" else PHONE_NEGATIVE_IMAGES_DIR
                path = _unique_path(directory, f"{mode}_{time.time_ns()}")
                if frame is None or frame.size == 0:
                    print("Refused to save: frame is not a readable image.")
                    continue
                if not cv2.imwrite(str(path), frame):
                    raise RuntimeError(f"Could not save captured image: {path}")
                check = cv2.imread(str(path))
                if check is None or check.size == 0:
                    path.unlink(missing_ok=True)
                    raise RuntimeError(f"Saved image could not be re-read: {path}")
                if mode == "nophone":
                    (PHONE_ANNOTATIONS_DIR / f"{path.stem}.json").write_text(
                        f'{{"image": "{path.name}", "boxes": []}}', encoding="utf-8"
                    )
                print(f"Saved {mode} image: {path.name}")
    finally:
        camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    capture_phone_images()
