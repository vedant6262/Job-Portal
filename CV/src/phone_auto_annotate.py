"""Content-based auto-annotation for the mobile-phone dataset.

This uses actual image content (the distinctive blue phone region), not the
folder name, to propose one bounding box per phone image. It writes the same
JSON annotation format the manual OpenCV tool (src.phone_annotation) reads and
writes, so every box can still be reviewed and corrected by hand.

Run with:  python -m src.phone_auto_annotate [--overwrite] [--preview N]

Only images whose content contains the phone are annotated. Images without a
reliable detection are reported and left unannotated instead of receiving a
fake box. No-phone images always receive an empty annotation file.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np

from config import (
    PHONE_ANNOTATIONS_DIR,
    PHONE_IMAGES_DIR,
    PHONE_POSITIVE_IMAGES_DIR,
    PHONE_NEGATIVE_IMAGES_DIR,
    ensure_directories,
)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
# Blue phone-case signature measured from the captured frames (OpenCV HSV).
BLUE_LOWER = (95, 45, 35)
BLUE_UPPER = (140, 255, 210)
SEARCH_TOP_FRACTION = 0.30
MIN_AREA_FRACTION = 0.008
MIN_SIDE = 20


def detect_phone_box(image: np.ndarray) -> tuple[int, int, int, int] | None:
    """Return the largest blue phone-like region as an (x, y, w, h) pixel box."""
    height, width = image.shape[:2]
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, BLUE_LOWER, BLUE_UPPER)
    mask[: int(SEARCH_TOP_FRACTION * height), :] = 0
    kernel = np.ones((7, 7), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    x, y, bw, bh = cv2.boundingRect(max(contours, key=cv2.contourArea))
    if bw < MIN_SIDE or bh < MIN_SIDE or bw * bh < MIN_AREA_FRACTION * width * height:
        return None
    x = max(0, x)
    y = max(0, y)
    bw = min(bw, width - x)
    bh = min(bh, height - y)
    return (x, y, bw, bh)


def _annotation_path(image_path: Path) -> Path:
    return PHONE_ANNOTATIONS_DIR / f"{image_path.stem}.json"


def _to_normalized(box: tuple[int, int, int, int], width: int, height: int) -> list[float]:
    x, y, w, h = box
    cx = (x + w / 2) / width
    cy = (y + h / 2) / height
    nw, nh = w / width, h / height
    if not (0 < cx < 1 and 0 < cy < 1 and 0 < nw <= 1 and 0 < nh <= 1
            and 0 <= cx - nw / 2 and cx + nw / 2 <= 1
            and 0 <= cy - nh / 2 and cy + nh / 2 <= 1):
        raise ValueError("detected box is not fully inside the image")
    return [0, cx, cy, nw, nh]


def _write(image_path: Path, boxes: list[list[float]]) -> None:
    _annotation_path(image_path).write_text(
        json.dumps({"image": image_path.name, "boxes": boxes}, indent=2), encoding="utf-8")


def _has_valid_boxes(image_path: Path) -> bool:
    path = _annotation_path(image_path)
    if not path.exists():
        return False
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    return bool(payload.get("boxes"))


def annotate(overwrite: bool = False) -> dict[str, object]:
    ensure_directories()
    phone_images = sorted(path for path in PHONE_POSITIVE_IMAGES_DIR.rglob("*")
                          if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS)
    nophone_images = sorted(path for path in PHONE_NEGATIVE_IMAGES_DIR.rglob("*")
                            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS)
    if not phone_images:
        raise RuntimeError("No phone images found. Capture images first with "
                           "python -m src.phone_dataset_capture.")

    annotated = skipped = 0
    failed: list[str] = []
    for image_path in phone_images:
        if not overwrite and _has_valid_boxes(image_path):
            skipped += 1
            continue
        image = cv2.imread(str(image_path))
        if image is None:
            failed.append(image_path.name)
            continue
        box = detect_phone_box(image)
        if box is None:
            failed.append(image_path.name)
            continue
        try:
            normalized = _to_normalized(box, image.shape[1], image.shape[0])
        except ValueError:
            failed.append(image_path.name)
            continue
        _write(image_path, [normalized])
        annotated += 1

    empty = 0
    for image_path in nophone_images:
        if overwrite or not _annotation_path(image_path).exists():
            _write(image_path, [])
            empty += 1

    result = {
        "phone_images": len(phone_images),
        "annotated": annotated,
        "skipped_existing": skipped,
        "unannotated": failed,
        "nophone_empty_annotations": len(nophone_images),
        "nophone_empty_written": empty,
    }
    print("Phone Auto-Annotation")
    print(f"Phone images: {len(phone_images)}")
    print(f"Annotated now: {annotated}")
    print(f"Skipped (already annotated): {skipped}")
    print(f"Could not annotate: {len(failed)}")
    print(f"No-phone images (empty annotations): {len(nophone_images)}")
    if failed:
        print("Images needing manual annotation with python -m src.phone_annotation:")
        for name in failed:
            print(f"  - {name}")
    return result


def write_preview(count: int, output: Path) -> None:
    phone_images = sorted(path for path in PHONE_POSITIVE_IMAGES_DIR.rglob("*")
                          if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS)
    sample = phone_images[:: max(1, len(phone_images) // max(1, count))][:count]
    tiles = []
    for image_path in sample:
        image = cv2.imread(str(image_path))
        box = detect_phone_box(image)
        if box:
            x, y, w, h = box
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 255), 2)
        tiles.append(cv2.resize(image, (320, 240)))
    if not tiles:
        return
    while len(tiles) % 5:
        tiles.append(np.zeros((240, 320, 3), np.uint8))
    rows = [np.hstack(tiles[i:i + 5]) for i in range(0, len(tiles), 5)]
    output.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(output), np.vstack(rows))
    print(f"Preview written to {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Auto-annotate phone images from image content.")
    parser.add_argument("--overwrite", action="store_true",
                        help="recompute boxes even where a valid annotation already exists")
    parser.add_argument("--preview", type=int, default=0,
                        help="write a preview montage of N sampled boxes")
    arguments = parser.parse_args()
    summary = annotate(overwrite=arguments.overwrite)
    if arguments.preview:
        write_preview(arguments.preview, PHONE_ANNOTATIONS_DIR.parent / "auto_annotation_preview.jpg")
    raise SystemExit(0 if not summary["unannotated"] else 1)
