"""Face localization using OpenCV's locally installed Haar cascade."""
from pathlib import Path
from typing import List, Tuple
import cv2
import numpy as np

Box = Tuple[int, int, int, int]


class FaceDetector:
    def __init__(self, scale_factor: float = 1.1, min_neighbors: int = 5):
        cascade_dir = Path(cv2.data.haarcascades)
        frontal_path = cascade_dir / "haarcascade_frontalface_default.xml"
        profile_path = cascade_dir / "haarcascade_profileface.xml"
        self.detector = cv2.CascadeClassifier(str(frontal_path))
        self.profile_detector = cv2.CascadeClassifier(str(profile_path))
        if self.detector.empty() or self.profile_detector.empty():
            raise RuntimeError(f"Could not load face detectors from: {cascade_dir}")
        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

    def detect(self, frame: np.ndarray) -> List[Box]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        enhanced = self.clahe.apply(gray)
        candidates = list(self.detector.detectMultiScale(
            enhanced, scaleFactor=self.scale_factor, minNeighbors=self.min_neighbors,
            minSize=(60, 60),
        ))
        candidates.extend(self.profile_detector.detectMultiScale(
            enhanced, scaleFactor=1.05, minNeighbors=3, minSize=(50, 50)
        ))

        mirrored_gray = cv2.flip(enhanced, 1)
        mirrored_faces = self.profile_detector.detectMultiScale(
            mirrored_gray, scaleFactor=1.05, minNeighbors=3, minSize=(50, 50)
        )
        candidates.extend(
            (gray.shape[1] - x - width, y, width, height)
            for x, y, width, height in mirrored_faces
        )

        valid = [
            tuple(map(int, face))
            for face in candidates
            if face[2] >= 50 and face[3] >= 50
            and face[0] >= 0 and face[1] >= 0
            and face[0] + face[2] <= frame.shape[1]
            and face[1] + face[3] <= frame.shape[0]
        ]
        return self._deduplicate(valid)

    @staticmethod
    def _deduplicate(faces: List[Box]) -> List[Box]:
        """Merge overlapping frontal/profile detections while retaining large faces."""
        result: List[Box] = []
        for candidate in sorted(faces, key=lambda face: face[2] * face[3], reverse=True):
            x, y, width, height = candidate
            overlaps = False
            for other_x, other_y, other_width, other_height in result:
                intersection_width = max(0, min(x + width, other_x + other_width) - max(x, other_x))
                intersection_height = max(0, min(y + height, other_y + other_height) - max(y, other_y))
                intersection = intersection_width * intersection_height
                smaller_area = min(width * height, other_width * other_height)
                if smaller_area and intersection / smaller_area >= 0.45:
                    overlaps = True
                    break
            if not overlaps:
                result.append(candidate)
        return result

    @staticmethod
    def crop(frame: np.ndarray, box: Box, padding: float = 0.20) -> np.ndarray:
        x, y, width, height = box
        pad_x, pad_y = int(width * padding), int(height * padding)
        left, top = max(0, x - pad_x), max(0, y - pad_y)
        right = min(frame.shape[1], x + width + pad_x)
        bottom = min(frame.shape[0], y + height + pad_y)
        return frame[top:bottom, left:right]
