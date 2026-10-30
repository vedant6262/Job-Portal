"""Load the locally trained CNN and classify cropped faces."""
import os
import json
import math
from pathlib import Path
from typing import Optional, Tuple
import cv2
import numpy as np
from config import (
    CNN_CONFIDENCE_THRESHOLD, CNN_INPUT_SIZE, CNN_MARGIN_THRESHOLD,
    EYE_CLOSED_OPENNESS_THRESHOLD, EYE_OPENNESS_SLOPE, FACE_SMOOTHING_ALPHA,
    FACE_TRACK_IOU_THRESHOLD, MODELS_DIR,
)
from .eye_state import EyeStateEstimator

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("TF_NUM_INTRAOP_THREADS", "1")
os.environ.setdefault("TF_NUM_INTEROP_THREADS", "1")


class FaceDirectionClassifier:
    def __init__(self):
        model_path = MODELS_DIR / "face_direction_cnn.keras"
        metadata_path = MODELS_DIR / "face_direction_classes.json"
        if not model_path.exists() or not metadata_path.exists():
            raise FileNotFoundError("Face model missing. Run python -m src.train_face_model.")
        from tensorflow.keras.models import load_model
        self.model = load_model(model_path)
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        self.classes = metadata["classes"]
        self._smoothed_probabilities: Optional[np.ndarray] = None
        self._last_box: Optional[Tuple[int, int, int, int]] = None
        self.eye_estimator = EyeStateEstimator()
        self._normal_index = self.classes.index("normal")
        self._closed_index = self.classes.index("eyes_closed")

    def reset(self) -> None:
        self._smoothed_probabilities = None
        self._last_box = None
        self.eye_estimator.reset()

    def predict(self, face, tracking_box=None):
        if face is None or face.size == 0:
            raise ValueError("Cannot classify an empty face crop.")
        image = cv2.cvtColor(cv2.resize(face, CNN_INPUT_SIZE), cv2.COLOR_BGR2RGB).astype("float32") / 255.0
        probabilities = self.model.predict(image[None, ...], verbose=0)[0]
        if tracking_box is not None and self._last_box is not None:
            if self._iou(tracking_box, self._last_box) < FACE_TRACK_IOU_THRESHOLD:
                self._smoothed_probabilities = None
        if self._smoothed_probabilities is None:
            self._smoothed_probabilities = probabilities
        else:
            alpha = FACE_SMOOTHING_ALPHA
            self._smoothed_probabilities = (
                alpha * probabilities + (1.0 - alpha) * self._smoothed_probabilities
            )
        self._last_box = tracking_box
        openness = self.eye_estimator.openness(face)
        decision = self._resolve_eye_pair(openness)
        index = int(np.argmax(decision))
        confidence = float(decision[index])
        sorted_probabilities = np.sort(decision)
        margin = float(sorted_probabilities[-1] - sorted_probabilities[-2])
        reliable = confidence >= CNN_CONFIDENCE_THRESHOLD and margin >= CNN_MARGIN_THRESHOLD
        return (self.classes[index] if reliable else "uncertain"), confidence

    def _resolve_eye_pair(self, openness: float) -> np.ndarray:
        """Let eye openness break an ambiguous ``normal``/``eyes_closed`` tie.

        Head-pose predictions (left/right/up/down) and confident CNN frontal
        decisions are never altered, so a reliable classifier is not overridden
        by the noisier Haar eye signal. Only when the CNN is unsure between the
        two frontal classes does eye openness decide the split.
        """
        probabilities = self._smoothed_probabilities
        leading = int(np.argmax(probabilities))
        if leading not in (self._normal_index, self._closed_index):
            return probabilities
        if probabilities[leading] >= CNN_CONFIDENCE_THRESHOLD:
            return probabilities
        frontal_mass = float(probabilities[self._normal_index] + probabilities[self._closed_index])
        if frontal_mass < 0.5:
            return probabilities
        split = 1.0 / (1.0 + math.exp(-EYE_OPENNESS_SLOPE * (openness - EYE_CLOSED_OPENNESS_THRESHOLD)))
        adjusted = probabilities.copy()
        adjusted[self._normal_index] = frontal_mass * split
        adjusted[self._closed_index] = frontal_mass * (1.0 - split)
        return adjusted

    @staticmethod
    def _iou(first, second) -> float:
        first_x, first_y, first_width, first_height = first
        second_x, second_y, second_width, second_height = second
        left = max(first_x, second_x)
        top = max(first_y, second_y)
        right = min(first_x + first_width, second_x + second_width)
        bottom = min(first_y + first_height, second_y + second_height)
        intersection = max(0, right - left) * max(0, bottom - top)
        first_area = first_width * first_height
        second_area = second_width * second_height
        union = first_area + second_area - intersection
        return intersection / union if union else 0.0
