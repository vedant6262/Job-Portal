"""Validate locally captured face and phone datasets."""
from pathlib import Path
import hashlib
import cv2
from config import FACE_CLASSES, FACE_DATASET_DIR


def validate_face_dataset(minimum_samples: int = 20) -> dict:
    result = {"classes": {}, "duplicates": 0, "ready": True}
    hashes = set()
    for class_name in FACE_CLASSES:
        directory = FACE_DATASET_DIR / class_name
        files = sorted(directory.glob("*")) if directory.exists() else []
        valid, unreadable = 0, 0
        for path in files:
            image = cv2.imread(str(path))
            if image is None:
                unreadable += 1
                continue
            valid += 1
            digest = hashlib.sha256(image.tobytes()).hexdigest()
            if digest in hashes:
                result["duplicates"] += 1
            hashes.add(digest)
        result["classes"][class_name] = {"valid": valid, "unreadable": unreadable}
        if valid < minimum_samples or unreadable:
            result["ready"] = False
    return result


if __name__ == "__main__":
    summary = validate_face_dataset()
    for name, counts in summary["classes"].items():
        print(f"{name}: {counts['valid']} valid, {counts['unreadable']} unreadable")
    print(f"Exact duplicate images: {summary['duplicates']}")
    print("Dataset ready for training." if summary["ready"] else "Dataset is not ready; fix warnings first.")
