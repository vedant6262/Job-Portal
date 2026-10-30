"""One command for the full phone-detector pipeline.

Run with:  python -m src.phone_training_pipeline

Stages:
    1. validate the dataset and every annotation
    2. create deterministic train/validation/test splits
    3. initialize the detector from scratch and execute the configured epochs
    4. save checkpoints and the best model
    5. evaluate on the held-out test set
    6. select the confidence threshold using validation data only
    7. save metrics and verify the final model loads
Exit code 0 only if training actually completed and the model loads.
"""
from __future__ import annotations

import os

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

import json
import sys
import traceback

from src.evaluate_phone_detector import evaluate_phone_detector
from src.phone_detection import PhoneDetector
from src.train_phone_detector import train_phone_detector


def run() -> int:
    try:
        print("=== Phone Detector Pipeline ===")
        print("[1/4] Validating dataset and training detector ...")
        training = train_phone_detector()
        print("[2/4] Evaluating on held-out test set ...")
        evaluation = evaluate_phone_detector()
        print("[3/4] Verifying saved model loads ...")
        PhoneDetector()
        print("[4/4] Pipeline completed successfully.")
    except Exception as error:
        print("Phone detector pipeline failed.", file=sys.stderr)
        print(f"Reason: {error}", file=sys.stderr)
        traceback.print_exc()
        return 1
    print(json.dumps({"training": training,
                      "evaluation": {"selected_threshold": evaluation["selected_threshold"],
                                     "test": evaluation["test"]},
                      "model_load": "verified"}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
