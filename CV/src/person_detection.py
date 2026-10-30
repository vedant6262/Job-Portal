"""Conservative person counting using OpenCV's built-in HOG detector."""
import cv2


class PersonDetector:
    def __init__(self, confidence_threshold=0.4):
        self.hog = cv2.HOGDescriptor()
        self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        self.threshold = confidence_threshold

    def detect(self, frame):
        boxes, weights = self.hog.detectMultiScale(frame, winStride=(8, 8), padding=(8, 8), scale=1.05)
        return [(tuple(map(int, box)), float(weight)) for box, weight in zip(boxes, weights)
                if float(weight) >= self.threshold]
