"""Inference for the locally trained custom phone object detector.

The detector only ever reports boxes that the trained model actually produced.
It never fabricates, randomizes, or falls back to guessed detections, and it is
never trained during webcam inference. When no trained model exists it raises a
clear ``PHONE DETECTOR NOT TRAINED`` error so the application can keep the
face-direction system running.
"""
from __future__ import annotations

import json

import cv2
import numpy as np
import tensorflow as tf

from config import (
    PHONE_CONFIDENCE_THRESHOLD,
    PHONE_IMAGE_SIZE,
    PHONE_IOU_THRESHOLD,
    PHONE_MODEL_PATH,
)

MISSING_MODEL_MESSAGE = "PHONE DETECTOR NOT TRAINED"


class PhoneDetector:
    def __init__(self, threshold: float | None = None):
        if not PHONE_MODEL_PATH.exists():
            raise FileNotFoundError(
                f"{MISSING_MODEL_MESSAGE}: run python -m src.phone_training_pipeline "
                "after capturing and annotating phone images."
            )
        self.model = tf.keras.models.load_model(str(PHONE_MODEL_PATH), compile=False)
        self.threshold = threshold if threshold is not None else self._configured_threshold()
        if not 0 < self.threshold <= 1:
            raise ValueError("Phone confidence threshold must be in (0, 1].")

    @staticmethod
    def is_available() -> bool:
        return PHONE_MODEL_PATH.exists()

    @staticmethod
    def _configured_threshold() -> float:
        path = PHONE_MODEL_PATH.parent / "training_config.json"
        if not path.exists():
            return PHONE_CONFIDENCE_THRESHOLD
        payload = json.loads(path.read_text(encoding="utf-8"))
        value = max(
            float(payload.get("confidence_threshold", PHONE_CONFIDENCE_THRESHOLD)),
            PHONE_CONFIDENCE_THRESHOLD,
        )
        if not 0 < value <= 1:
            raise ValueError("Configured phone confidence threshold must be in (0, 1].")
        return value

    def detect(self, frame: np.ndarray) -> list[tuple[tuple[int, int, int, int], float]]:
        if frame is None or frame.size == 0:
            return []
        height, width = frame.shape[:2]
        image = cv2.cvtColor(cv2.resize(frame, PHONE_IMAGE_SIZE), cv2.COLOR_BGR2RGB)
        prediction = self.model.predict(image[np.newaxis].astype(np.float32) / 255.0, verbose=0)[0]
        objectness = 1.0 / (1.0 + np.exp(-prediction[..., 0]))
        centerness = (1.0 / (1.0 + np.exp(-prediction[..., 5]))
                      if prediction.shape[-1] > 5 else np.ones_like(objectness))
        score_map = objectness * centerness
        boxes: list[list[int]] = []
        scores: list[float] = []
        for row, col in zip(*np.where(score_map >= self.threshold)):
            cx, cy, box_width, box_height = prediction[row, col, 1:5]
            cx, cy = 1 / (1 + np.exp(-cx)), 1 / (1 + np.exp(-cy))
            box_width, box_height = 1 / (1 + np.exp(-box_width)), 1 / (1 + np.exp(-box_height))
            x1 = max(0, min(width - 1, int((cx - box_width / 2) * width)))
            y1 = max(0, min(height - 1, int((cy - box_height / 2) * height)))
            x2 = max(x1 + 1, min(width, int((cx + box_width / 2) * width)))
            y2 = max(y1 + 1, min(height, int((cy + box_height / 2) * height)))
            boxes.append([x1, y1, x2 - x1, y2 - y1])
            scores.append(float(score_map[row, col]))
        if not boxes:
            return []
        kept = cv2.dnn.NMSBoxes(boxes, scores, self.threshold, PHONE_IOU_THRESHOLD)
        indices = np.asarray(kept).reshape(-1).tolist() if len(kept) else []
        return [(tuple(int(value) for value in boxes[index]), scores[index]) for index in indices]
