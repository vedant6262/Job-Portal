"""Central configuration for the webcam examination monitor."""
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
DATASET_DIR = PROJECT_ROOT / "dataset"
FACE_DATASET_DIR = DATASET_DIR / "face_direction"
PHONE_IMAGES_DIR = DATASET_DIR / "mobile_phone" / "images"
PHONE_POSITIVE_IMAGES_DIR = PHONE_IMAGES_DIR / "phone"
PHONE_NEGATIVE_IMAGES_DIR = PHONE_IMAGES_DIR / "nophone"
PHONE_ANNOTATIONS_DIR = DATASET_DIR / "mobile_phone" / "annotations"
PHONE_SPLITS_DIR = DATASET_DIR / "mobile_phone" / "splits"
MODELS_DIR = PROJECT_ROOT / "models"
PHONE_MODEL_DIR = MODELS_DIR / "phone_detector"
LOGS_DIR = PROJECT_ROOT / "logs"
REPORTS_DIR = PROJECT_ROOT / "reports"
TRAINING_RESULTS_DIR = PROJECT_ROOT / "training_results"
PHONE_DATASET_SUMMARY = DATASET_DIR / "mobile_phone" / "dataset_summary.json"
PHONE_RESULTS_DIR = TRAINING_RESULTS_DIR / "phone_detector"
PHONE_SAMPLES_DIR = PHONE_RESULTS_DIR / "samples"
PHONE_MODEL_PATH = PHONE_MODEL_DIR / "phone_detector.keras"
PHONE_IMAGE_SIZE = (256, 192)
PHONE_STRIDE = 8
PHONE_GRID_SIZE = (PHONE_IMAGE_SIZE[0] // PHONE_STRIDE, PHONE_IMAGE_SIZE[1] // PHONE_STRIDE)
PHONE_EPOCHS = 100
PHONE_BATCH_SIZE = 4
PHONE_LEARNING_RATE = 0.001
PHONE_RANDOM_SEED = 42
PHONE_IOU_THRESHOLD = 0.25
PHONE_SPLIT_RATIOS = (0.70, 0.15, 0.15)
PHONE_EARLY_STOPPING_PATIENCE = 20
PHONE_MIN_POSITIVE_SAMPLES = 3
PHONE_MIN_NEGATIVE_SAMPLES = 3
PHONE_THRESHOLD_CANDIDATES = (0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85)
PHONE_TRAINING_LOG = LOGS_DIR / "phone_training.log"

FACE_CLASSES = ("normal", "looking_left", "looking_right", "looking_up",
                "looking_down", "eyes_closed")
CNN_INPUT_SIZE = (128, 128)
FACE_SMOOTHING_ALPHA = 0.65
FACE_TRACK_IOU_THRESHOLD = 0.25
CAPTURE_TARGET_PER_CLASS = 300
AUTO_CAPTURE_INTERVAL_SECONDS = 0.25
WEBCAM_INDEX = 0
CAMERA_WIDTH, CAMERA_HEIGHT = 960, 540
MIRROR_PREVIEW = True
CNN_CONFIDENCE_THRESHOLD = 0.60
CNN_MARGIN_THRESHOLD = 0.10
EYE_REGION_TOP_FRACTION = 0.60
EYE_DETECTION_MIN_NEIGHBORS = 4
EYE_HISTORY_FRAMES = 5
EYE_OPENNESS_SMOOTHING = 0.60
EYE_CLOSED_OPENNESS_THRESHOLD = 0.40
EYE_OPENNESS_SLOPE = 12.0
PERSON_CONFIDENCE_THRESHOLD = 0.40
PHONE_CONFIDENCE_THRESHOLD = 0.55
PHONE_CONFIRMATION_FRAMES = 3
PHONE_TRACK_IOU_THRESHOLD = 0.20
FACE_ABSENCE_SECONDS = 2.0
DIRECTION_EVENT_SECONDS = 1.5
EVENT_COOLDOWN_SECONDS = 8.0
PHONE_WINDOW_SIZE = (96, 96)
DATABASE_PATH = LOGS_DIR / "exam_database.db"
CSV_LOG_PATH = LOGS_DIR / "events.csv"

SCORE_RULES = {
    "looking_left": 2, "looking_right": 2, "looking_up": 2,
    "looking_down": 2, "phone_detected": 5, "multiple_people": 5,
    "face_absent": 3,
}


def ensure_directories() -> None:
    for directory in (
        FACE_DATASET_DIR, PHONE_IMAGES_DIR, PHONE_POSITIVE_IMAGES_DIR,
        PHONE_NEGATIVE_IMAGES_DIR, PHONE_ANNOTATIONS_DIR, PHONE_SPLITS_DIR,
        MODELS_DIR, PHONE_MODEL_DIR, LOGS_DIR, REPORTS_DIR,
        TRAINING_RESULTS_DIR, PHONE_RESULTS_DIR, PHONE_SAMPLES_DIR,
    ):
        directory.mkdir(parents=True, exist_ok=True)
    for class_name in FACE_CLASSES:
        (FACE_DATASET_DIR / class_name).mkdir(parents=True, exist_ok=True)


def validate_config() -> None:
    if WEBCAM_INDEX < 0 or CNN_CONFIDENCE_THRESHOLD <= 0 or CNN_CONFIDENCE_THRESHOLD > 1:
        raise ValueError("WEBCAM_INDEX must be non-negative and CNN threshold must be in (0, 1].")
    if any(value <= 0 for value in CNN_INPUT_SIZE) or CAPTURE_TARGET_PER_CLASS < 1:
        raise ValueError("CNN_INPUT_SIZE and CAPTURE_TARGET_PER_CLASS must be positive.")
    if not 0 < FACE_SMOOTHING_ALPHA <= 1 or not 0 <= FACE_TRACK_IOU_THRESHOLD < 1:
        raise ValueError("Face smoothing alpha must be in (0, 1] and face tracking IoU threshold in [0, 1).")
    if not 0 < EYE_REGION_TOP_FRACTION <= 1 or not 0 < EYE_OPENNESS_SMOOTHING <= 1:
        raise ValueError("Eye region top fraction and openness smoothing must be in (0, 1].")
    if EYE_HISTORY_FRAMES < 1 or EYE_DETECTION_MIN_NEIGHBORS < 1 or EYE_OPENNESS_SLOPE <= 0:
        raise ValueError("Eye history frames, neighbours, and openness slope must be positive.")
    if any(value <= 0 for value in PHONE_IMAGE_SIZE) or PHONE_EPOCHS < 1 or PHONE_BATCH_SIZE < 1:
        raise ValueError("Phone image size, epochs, and batch size must be positive.")
    if not 0 < PHONE_LEARNING_RATE or not 0 < PHONE_IOU_THRESHOLD < 1:
        raise ValueError("Phone learning rate must be positive and IoU threshold must be in (0, 1).")
    if any(value <= 0 for value in PHONE_SPLIT_RATIOS) or abs(sum(PHONE_SPLIT_RATIOS) - 1.0) > 1e-6:
        raise ValueError("Phone split ratios must be positive and sum to 1.0.")
    if not 0 < PHONE_CONFIDENCE_THRESHOLD <= 1:
        raise ValueError("PHONE_CONFIDENCE_THRESHOLD must be in (0, 1].")
    if PHONE_CONFIRMATION_FRAMES < 1 or not 0 <= PHONE_TRACK_IOU_THRESHOLD < 1:
        raise ValueError("Phone confirmation frames must be positive and tracking IoU in [0, 1).")
    ensure_directories()
