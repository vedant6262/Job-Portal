"""Import user-provided phone and hard-negative images without overwriting files."""
from __future__ import annotations

import hashlib
import shutil
from pathlib import Path

import cv2

from config import PHONE_IMAGES_DIR, ensure_directories


def import_images(paths: list[str | Path], category: str) -> dict[str, int]:
    """Copy images into phone/no_phone folders and report skipped files."""
    if category == "no_phone":
        category = "nophone"
    if category not in {"phone", "nophone"}:
        raise ValueError("category must be 'phone' or 'nophone'")
    ensure_directories()
    target = PHONE_IMAGES_DIR / category
    target.mkdir(parents=True, exist_ok=True)
    (PHONE_IMAGES_DIR / "phone").mkdir(parents=True, exist_ok=True)
    (PHONE_IMAGES_DIR / "nophone").mkdir(parents=True, exist_ok=True)
    copied = skipped = 0
    all_image_dirs = (PHONE_IMAGES_DIR / "phone", PHONE_IMAGES_DIR / "nophone")
    existing_hashes = {
        hashlib.sha256(image.tobytes()).hexdigest()
        for directory in all_image_dirs
        for path in directory.iterdir()
        if path.is_file() and (image := cv2.imread(str(path))) is not None
    }
    for source_value in paths:
        source = Path(source_value)
        if source.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            skipped += 1
            continue
        image = cv2.imread(str(source))
        if image is None:
            skipped += 1
            continue
        digest = hashlib.sha256(image.tobytes()).hexdigest()
        if digest in existing_hashes:
            skipped += 1
            continue
        destination = target / source.name
        counter = 1
        while any((directory / destination.name).exists() for directory in all_image_dirs):
            destination = target / f"{source.stem}_{counter}{source.suffix.lower()}"
            counter += 1
        shutil.copy2(source, destination)
        existing_hashes.add(digest)
        copied += 1
    return {"copied": copied, "skipped": skipped, "phone": len(list((PHONE_IMAGES_DIR / "phone").glob("*"))),
            "nophone": len(list((PHONE_IMAGES_DIR / "nophone").glob("*")))}


def import_with_file_dialog(category: str) -> dict[str, int]:
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()
    try:
        paths = filedialog.askopenfilenames(
            title=f"Select {category} images",
            filetypes=[("Images", "*.jpg *.jpeg *.png")],
        )
    finally:
        root.destroy()
    return import_images(list(paths), category)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("category", choices=("phone", "nophone", "no_phone"))
    parser.add_argument("--train", action="store_true",
                        help="run the validated training pipeline after importing")
    args = parser.parse_args()
    print(import_with_file_dialog(args.category))
    if args.train:
        from src.phone_training_pipeline import run
        raise SystemExit(run())
