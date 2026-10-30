"""Validate phone annotations and create deterministic, leakage-resistant splits.

The folder name alone is never trusted: a "phone" image must carry at least one
valid normalized phone box and a "nophone" image must carry an empty annotation.
"""
from __future__ import annotations

import hashlib
import json
import random
from pathlib import Path
from typing import Any

import cv2

from config import (
    PHONE_ANNOTATIONS_DIR,
    PHONE_DATASET_SUMMARY,
    PHONE_IMAGES_DIR,
    PHONE_MIN_NEGATIVE_SAMPLES,
    PHONE_MIN_POSITIVE_SAMPLES,
    PHONE_RANDOM_SEED,
    PHONE_SPLITS_DIR,
    PHONE_SPLIT_RATIOS,
    ensure_directories,
)

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def _annotation_path(image_path: Path) -> Path:
    return PHONE_ANNOTATIONS_DIR / f"{image_path.stem}.json"


def _load_boxes(path: Path) -> list[list[float]]:
    if not path.exists():
        raise ValueError(f"missing annotation file: {path.name}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    raw_boxes = payload.get("boxes", [])
    if not isinstance(raw_boxes, list):
        raise ValueError("boxes must be a list")
    boxes: list[list[float]] = []
    for box in raw_boxes:
        if not isinstance(box, list) or len(box) != 5:
            raise ValueError("each box must contain class_id, x_center, y_center, width, height")
        values = [float(value) for value in box]
        class_id, cx, cy, width, height = values
        if class_id != 0:
            raise ValueError("class_id must be 0 (mobile_phone)")
        if width <= 0 or height <= 0:
            raise ValueError("box width and height must be positive")
        if not (0 < cx < 1 and 0 < cy < 1 and 0 < width <= 1 and 0 < height <= 1):
            raise ValueError("box centre and size must be normalized inside (0, 1)")
        left, top = cx - width / 2, cy - height / 2
        right, bottom = cx + width / 2, cy + height / 2
        if not (0 <= left and 0 <= top and right <= 1 and bottom <= 1):
            raise ValueError("box must be fully inside the normalized image")
        boxes.append(values)
    return boxes


def validate_and_split(seed: int = PHONE_RANDOM_SEED,
                       split_ratios: tuple[float, float, float] = PHONE_SPLIT_RATIOS) -> dict[str, Any]:
    if any(value <= 0 for value in split_ratios) or abs(sum(split_ratios) - 1.0) > 1e-6:
        raise ValueError("split_ratios must be positive and sum to 1.0")
    ensure_directories()
    images = sorted(path for path in PHONE_IMAGES_DIR.rglob("*")
                    if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS)
    records: list[dict[str, Any]] = []
    invalid: list[dict[str, str]] = []
    hashes: dict[str, str] = {}
    duplicates: list[str] = []
    for image_path in images:
        image = cv2.imread(str(image_path))
        if image is None:
            invalid.append({"image": image_path.name, "reason": "unreadable image"})
            continue
        digest = hashlib.sha256(image.tobytes()).hexdigest()
        if digest in hashes:
            duplicates.append(f"{image_path.name} duplicates {hashes[digest]}")
            continue
        hashes[digest] = image_path.name
        folder = image_path.parent.name
        try:
            boxes = _load_boxes(_annotation_path(image_path))
        except (OSError, ValueError, json.JSONDecodeError) as error:
            invalid.append({"image": image_path.name, "reason": str(error)})
            continue
        if folder == "phone" and not boxes:
            invalid.append({"image": image_path.name,
                            "reason": "phone image has no bounding boxes"})
            continue
        if folder == "nophone" and boxes:
            invalid.append({"image": image_path.name,
                            "reason": "nophone image must have an empty annotation"})
            continue
        records.append({"image": image_path.name, "boxes": boxes, "folder": folder})

    positives = [record for record in records if record["boxes"]]
    negatives = [record for record in records if not record["boxes"]]
    if not positives:
        raise RuntimeError(
            "No valid positive annotations were found. Capture phone images, draw at least one "
            "phone box in each with python -m src.phone_annotation, then run training again."
        )
    if not negatives:
        print("WARNING: no valid no-phone images were found; false-positive control will be limited.")
    if len(positives) < PHONE_MIN_POSITIVE_SAMPLES:
        print(f"WARNING: only {len(positives)} phone image(s); at least "
              f"{PHONE_MIN_POSITIVE_SAMPLES} are recommended.")
    if len(negatives) < PHONE_MIN_NEGATIVE_SAMPLES:
        print(f"WARNING: only {len(negatives)} no-phone image(s); at least "
              f"{PHONE_MIN_NEGATIVE_SAMPLES} are recommended.")

    rng = random.Random(seed)
    rng.shuffle(positives)
    rng.shuffle(negatives)
    shuffled = positives + negatives
    rng.shuffle(shuffled)
    n = len(shuffled)
    train_ratio, val_ratio, _ = split_ratios
    train_end = max(1, int(round(n * train_ratio)))
    val_end = train_end + int(round(n * val_ratio))
    val_end = min(max(train_end, val_end), n - 1) if n > 1 else n
    split_records = {
        "train": shuffled[:train_end],
        "val": shuffled[train_end:val_end],
        "test": shuffled[val_end:],
    }
    for name, split in split_records.items():
        (PHONE_SPLITS_DIR / f"{name}.txt").write_text(
            "\n".join(record["image"] for record in split) + "\n", encoding="utf-8"
        )
    summary = {
        "total_images": len(images),
        "valid_images": len(records),
        "valid_phone_images": len(positives),
        "valid_no_phone_images": len(negatives),
        "annotated_phone_objects": sum(len(record["boxes"]) for record in positives),
        "invalid_images": invalid,
        "invalid_count": len(invalid),
        "duplicates": duplicates,
        "duplicate_count": len(duplicates),
        "splits": {name: len(items) for name, items in split_records.items()},
        "split_ratios": list(split_ratios),
        "seed": seed,
        "ready": bool(positives) and len(split_records["train"]) > 0,
    }
    PHONE_DATASET_SUMMARY.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print("\nMobile Phone Dataset Validation")
    print(f"Total images: {summary['total_images']}")
    print(f"Valid phone images: {summary['valid_phone_images']}")
    print(f"Valid no-phone images: {summary['valid_no_phone_images']}")
    print(f"Annotated phone objects: {summary['annotated_phone_objects']}")
    print(f"Invalid images: {len(invalid)}")
    print(f"Duplicate images: {len(duplicates)}")
    print(f"Training images: {len(split_records['train'])}")
    print(f"Validation images: {len(split_records['val'])}")
    print(f"Test images: {len(split_records['test'])}")
    print("Dataset status: READY" if summary["ready"] else "Dataset status: NOT READY")
    if invalid:
        print("Invalid entries (not silently skipped):")
        for item in invalid:
            print(f"  - {item['image']}: {item['reason']}")
    return {"summary": summary, "records": split_records}


if __name__ == "__main__":
    try:
        validate_and_split()
    except RuntimeError as error:
        print(f"Dataset status: NOT READY\n{error}")
        raise SystemExit(1)
