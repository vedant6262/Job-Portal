"""Estimate eye openness from a cropped face using local Haar cascades.

The six-class CNN often wavers between ``normal`` and ``eyes_closed`` because the
only difference is a few pixels around the eyes. This lightweight estimator
gives the classifier a direct eye-openness signal so the frontal pair can be
resolved without falling back to ``uncertain``.
"""
from collections import deque
from pathlib import Path
import cv2
import numpy as np
from config import (
    EYE_DETECTION_MIN_NEIGHBORS, EYE_HISTORY_FRAMES, EYE_OPENNESS_SMOOTHING,
    EYE_REGION_TOP_FRACTION,
)


class EyeStateEstimator:
    """Return a smoothed 0..1 openness score (1 = both eyes clearly visible)."""

    def __init__(self):
        cascade_dir = Path(cv2.data.haarcascades)
        self._detectors = [
            cv2.CascadeClassifier(str(cascade_dir / "haarcascade_eye.xml")),
            cv2.CascadeClassifier(str(cascade_dir / "haarcascade_eye_tree_eyeglasses.xml")),
        ]
        self._detectors = [detector for detector in self._detectors if not detector.empty()]
        if not self._detectors:
            raise RuntimeError(f"Could not load eye detectors from: {cascade_dir}")
        self._clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        self._history: deque = deque(maxlen=EYE_HISTORY_FRAMES)
        self._smoothed: float = 0.0

    def reset(self) -> None:
        self._history.clear()
        self._smoothed = 0.0

    def openness(self, face: np.ndarray) -> float:
        """Update and return the smoothed eye-openness score for a face crop."""
        if face is None or face.size == 0:
            return self._smoothed
        gray = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        top = max(1, int(gray.shape[0] * EYE_REGION_TOP_FRACTION))
        region = self._clahe.apply(gray[:top, :])
        min_eye = max(8, region.shape[1] // 8)
        found = 0
        for detector in self._detectors:
            eyes = detector.detectMultiScale(
                region, scaleFactor=1.1, minNeighbors=EYE_DETECTION_MIN_NEIGHBORS,
                minSize=(min_eye, min_eye),
            )
            found = max(found, len(eyes))
        self._history.append(min(found, 2) / 2.0)
        self._smoothed = (
            EYE_OPENNESS_SMOOTHING * float(np.mean(self._history))
            + (1.0 - EYE_OPENNESS_SMOOTHING) * self._smoothed
        )
        return self._smoothed
