"""Evaluate the phone detector on the held-out test set.

Metrics are computed from actual model predictions. The final confidence
threshold is selected using validation data only; the test split is used once,
after the threshold is frozen. Sample prediction images (correct detections,
missed detections, false positives, ground-truth and predicted boxes) are saved
under training_results/phone_detector/.
"""
from __future__ import annotations

import json
from typing import Any

import cv2
import numpy as np

from config import (
    PHONE_IMAGES_DIR,
    PHONE_MODEL_DIR,
    PHONE_RESULTS_DIR,
    PHONE_SAMPLES_DIR,
    PHONE_THRESHOLD_CANDIDATES,
)
from src.phone_detection import PhoneDetector
from src.prepare_phone_dataset import validate_and_split

IOU_MATCH = 0.5
MAP_THRESHOLDS = [0.50, 0.55, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95]


def _iou(left: tuple[int, int, int, int], right: tuple[int, int, int, int]) -> float:
    ax, ay, aw, ah = left
    bx, by, bw, bh = right
    x1, y1 = max(ax, bx), max(ay, by)
    x2, y2 = min(ax + aw, bx + bw), min(ay + ah, by + bh)
    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    union = aw * ah + bw * bh - intersection
    return intersection / union if union else 0.0


def _ground_truth(width: int, height: int, boxes: list[list[float]]) -> list[tuple[int, int, int, int]]:
    return [(int((cx - w / 2) * width), int((cy - h / 2) * height), int(w * width), int(h * height))
            for _, cx, cy, w, h in boxes]


def _match(detections: list[tuple[tuple[int, int, int, int], float]],
           truth: list[tuple[int, int, int, int]],
           iou_threshold: float) -> tuple[int, int, int, set[int], set[int]]:
    order = sorted(range(len(detections)), key=lambda index: detections[index][1], reverse=True)
    matched_truth: set[int] = set()
    matched_detections: set[int] = set()
    for detection_index in order:
        box, _confidence = detections[detection_index]
        best_index, best_iou = None, iou_threshold
        for truth_index, target in enumerate(truth):
            if truth_index in matched_truth:
                continue
            overlap = _iou(box, target)
            if overlap >= best_iou:
                best_index, best_iou = truth_index, overlap
        if best_index is None:
            continue
        matched_truth.add(best_index)
        matched_detections.add(detection_index)
    true_positive = len(matched_detections)
    false_positive = len(detections) - true_positive
    false_negative = len(truth) - len(matched_truth)
    return true_positive, false_positive, false_negative, matched_truth, matched_detections


def _average_precision(true_flags: list[int], confidences: list[float], total_truth: int) -> float:
    if total_truth == 0 or not confidences:
        return 0.0
    order = np.argsort(-np.asarray(confidences))
    flags = np.asarray(true_flags, dtype=np.float64)[order]
    true_positive = np.cumsum(flags)
    false_positive = np.cumsum(1 - flags)
    recall = true_positive / total_truth
    precision = true_positive / np.maximum(true_positive + false_positive, 1e-9)
    mrec = np.concatenate(([0.0], recall, [1.0]))
    mpre = np.concatenate(([0.0], precision, [0.0]))
    for index in range(len(mpre) - 1, 0, -1):
        mpre[index - 1] = max(mpre[index - 1], mpre[index])
    indices = np.where(mrec[1:] != mrec[:-1])[0]
    return float(np.sum((mrec[indices + 1] - mrec[indices]) * mpre[indices + 1]))


def _collect(detector: PhoneDetector, records: list[dict[str, Any]],
             paths: dict[str, Any], iou_threshold: float = IOU_MATCH) -> dict[str, Any]:
    per_image: list[dict[str, Any]] = []
    all_flags: list[int] = []
    all_confidences: list[float] = []
    total_truth = 0
    totals = {"true_positives": 0, "false_positives": 0, "missed_phones": 0,
              "false_positives_on_nophone": 0}
    true_confidences: list[float] = []
    false_confidences: list[float] = []
    for record in records:
        path = paths.get(record["image"])
        image = cv2.imread(str(path)) if path is not None else None
        if image is None:
            raise RuntimeError(f"Unable to read evaluation image: {record['image']}")
        height, width = image.shape[:2]
        truth = _ground_truth(width, height, record["boxes"])
        detections = detector.detect(image)
        true_positive, false_positive, false_negative, matched_truth, matched_detections = _match(
            detections, truth, iou_threshold)
        total_truth += len(truth)
        totals["true_positives"] += true_positive
        totals["false_positives"] += false_positive
        totals["missed_phones"] += false_negative
        if record["folder"] == "nophone":
            totals["false_positives_on_nophone"] += false_positive
        for index, (box, confidence) in enumerate(detections):
            flag = 1 if index in matched_detections else 0
            all_flags.append(flag)
            all_confidences.append(confidence)
            (true_confidences if flag else false_confidences).append(confidence)
        per_image.append({
            "image": record["image"],
            "folder": record["folder"],
            "ground_truth": truth,
            "detections": [{"box": list(box), "confidence": confidence} for box, confidence in detections],
            "matched_detections": sorted(matched_detections),
            "true_positives": true_positive,
            "false_positives": false_positive,
            "missed_phones": false_negative,
        })
    precision = totals["true_positives"] / (totals["true_positives"] + totals["false_positives"]) \
        if totals["true_positives"] + totals["false_positives"] else 0.0
    recall = totals["true_positives"] / total_truth if total_truth else 0.0
    result = {
        **totals,
        "ground_truth_objects": total_truth,
        "precision": precision,
        "recall": recall,
        "f1": 2 * precision * recall / (precision + recall) if precision + recall else 0.0,
        "mean_true_positive_confidence": float(np.mean(true_confidences)) if true_confidences else 0.0,
        "mean_false_positive_confidence": float(np.mean(false_confidences)) if false_confidences else 0.0,
        "average_precision_0.5": _average_precision(all_flags, all_confidences, total_truth),
        "per_image": per_image,
    }
    return result


def _mean_average_precision(detector: PhoneDetector, records: list[dict[str, Any]],
                            paths: dict[str, Any]) -> float:
    scores = []
    for iou_threshold in MAP_THRESHOLDS:
        collected = _collect(detector, records, paths, iou_threshold)
        scores.append(collected["average_precision_0.5"])
    return float(np.mean(scores)) if scores else 0.0


def _draw_samples(collected: dict[str, Any], paths: dict[str, Any]) -> dict[str, int]:
    PHONE_SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    for stale in PHONE_SAMPLES_DIR.glob("*.jpg"):
        stale.unlink(missing_ok=True)
    counters = {"correct": 0, "missed": 0, "false_positive": 0}
    limits = {"correct": 6, "missed": 6, "false_positive": 6}
    for item in collected["per_image"]:
        category = None
        if item["false_positives"]:
            category = "false_positive"
        elif item["missed_phones"]:
            category = "missed"
        elif item["true_positives"]:
            category = "correct"
        if category is None or counters[category] >= limits[category]:
            continue
        image = cv2.imread(str(paths[item["image"]]))
        if image is None:
            continue
        for target in item["ground_truth"]:
            x, y, w, h = target
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(image, "GT", (x, max(15, y - 6)), cv2.FONT_HERSHEY_SIMPLEX, .5, (0, 255, 0), 1)
        for detection in item["detections"]:
            x, y, w, h = detection["box"]
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 0, 255), 3)
            cv2.putText(image, f"PHONE {detection['confidence']:.0%}", (x, max(15, y - 6)),
                        cv2.FONT_HERSHEY_SIMPLEX, .5, (0, 0, 255), 2)
        counters[category] += 1
        cv2.imwrite(str(PHONE_SAMPLES_DIR / f"{category}_{counters[category]}_{item['image']}"), image)
    return counters


def evaluate_phone_detector() -> dict[str, Any]:
    prepared = validate_and_split()
    PHONE_RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    paths = {path.name: path for path in PHONE_IMAGES_DIR.rglob("*") if path.is_file()}
    validation_records = prepared["records"]["val"]
    test_records = prepared["records"]["test"]

    detector = PhoneDetector()
    validation = []
    for threshold in PHONE_THRESHOLD_CANDIDATES:
        detector.threshold = float(threshold)
        scored = _collect(detector, validation_records, paths)
        validation.append({"threshold": threshold, "precision": scored["precision"],
                           "recall": scored["recall"], "f1": scored["f1"],
                           "true_positives": scored["true_positives"],
                           "false_positives": scored["false_positives"],
                           "missed_phones": scored["missed_phones"]})
    eligible = [
        item for item in validation
        if item["threshold"] >= PHONE_CONFIDENCE_THRESHOLD
    ]
    selected = max(eligible, key=lambda item: (item["f1"], item["precision"])) \
        if eligible else {"threshold": PHONE_CONFIDENCE_THRESHOLD}

    detector.threshold = float(selected["threshold"])
    test = _collect(detector, test_records, paths)
    test["mean_average_precision"] = _mean_average_precision(detector, test_records, paths)
    samples = _draw_samples(test, paths)

    report = {
        "selected_threshold": float(selected["threshold"]),
        "selection_basis": "validation split only",
        "validation_threshold_sweep": validation,
        "test": {key: value for key, value in test.items() if key != "per_image"},
        "sample_images": samples,
        "sample_directory": str(PHONE_SAMPLES_DIR),
        "map_iou_thresholds": MAP_THRESHOLDS,
    }
    (PHONE_RESULTS_DIR / "metrics.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    lines = [
        "Mobile Phone Detector Evaluation",
        f"Selected threshold (validation only): {selected['threshold']:.2f}",
        f"Test ground-truth objects: {test['ground_truth_objects']}",
        f"Test precision: {test['precision']:.3f}",
        f"Test recall: {test['recall']:.3f}",
        f"Test F1: {test['f1']:.3f}",
        f"Test AP@0.5: {test['average_precision_0.5']:.3f}",
        f"Test mAP@0.5:0.95: {test['mean_average_precision']:.3f}",
        f"False positives on no-phone images: {test['false_positives_on_nophone']}",
        f"Missed phone detections: {test['missed_phones']}",
        f"Mean true-positive confidence: {test['mean_true_positive_confidence']:.3f}",
        f"Mean false-positive confidence: {test['mean_false_positive_confidence']:.3f}",
        f"Sample images written: {samples}",
    ]
    (PHONE_RESULTS_DIR / "evaluation_report.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    config_path = PHONE_MODEL_DIR / "training_config.json"
    if config_path.exists():
        config = json.loads(config_path.read_text(encoding="utf-8"))
        config["confidence_threshold"] = float(selected["threshold"])
        config_path.write_text(json.dumps(config, indent=2), encoding="utf-8")

    print(f"Selected confidence threshold from validation: {selected['threshold']:.2f}")
    print(f"Test precision: {test['precision']:.3f}; recall: {test['recall']:.3f}; F1: {test['f1']:.3f}")
    return report


if __name__ == "__main__":
    evaluate_phone_detector()
