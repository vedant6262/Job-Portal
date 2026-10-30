"""Train the custom one-class phone detector from scratch.

Genuine single-shot bounding-box detector trained with randomly initialized
weights (no pretrained weights, unrelated to the face-direction classifier).

Accuracy design:
  * aspect-preserving input (config.PHONE_IMAGE_SIZE) instead of a squashed square
  * stride-8 feature map (fine grid) for better localization
  * every grid cell whose centre lies inside the phone box is trained positive,
    not just one cell (improves recall)
  * class-balanced objectness loss + GIoU box loss (improves precision and IoU)
  * horizontal-flip and brightness augmentation

Run directly:  python -m src.train_phone_detector --epochs 50 --batch-size 8
Full pipeline:  python -m src.phone_training_pipeline
"""
from __future__ import annotations

import os

os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")

import argparse
import json
import logging
import random
import shutil
import traceback
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import tensorflow as tf

from config import (
    PHONE_BATCH_SIZE,
    PHONE_CONFIDENCE_THRESHOLD,
    PHONE_EARLY_STOPPING_PATIENCE,
    PHONE_EPOCHS,
    PHONE_IMAGE_SIZE,
    PHONE_IMAGES_DIR,
    PHONE_LEARNING_RATE,
    PHONE_MODEL_DIR,
    PHONE_MODEL_PATH,
    PHONE_RANDOM_SEED,
    PHONE_SPLIT_RATIOS,
    PHONE_STRIDE,
    PHONE_TRAINING_LOG,
    validate_config,
)
from src.prepare_phone_dataset import validate_and_split

STATUS_DATASET_NOT_READY = "DATASET NOT READY"
STATUS_VALIDATING = "VALIDATING DATASET"
STATUS_PREPARING = "PREPARING DATA"
STATUS_INITIALIZING = "INITIALIZING MODEL"
STATUS_TRAINING = "TRAINING"
STATUS_EVALUATING = "EVALUATING MODEL"
STATUS_SAVING = "SAVING MODEL"
STATUS_COMPLETED = "TRAINING COMPLETED"
STATUS_FAILED = "TRAINING FAILED"

OBJECTNESS_POS_WEIGHT = 8.0
BOX_LOSS_WEIGHT = 2.0
CENTERNESS_LOSS_WEIGHT = 1.0
BRIGHTNESS_DELTA = 0.2
CENTER_SAMPLING = 0.6


def grid_shape(image_size: tuple[int, int]) -> tuple[int, int]:
    """Return (rows, cols) of the detector output for a (width, height) input."""
    return image_size[1] // PHONE_STRIDE, image_size[0] // PHONE_STRIDE


def build_model(image_size: tuple[int, int] = PHONE_IMAGE_SIZE) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(image_size[1], image_size[0], 3))
    x = inputs
    for filters in (32, 64, 128):
        x = tf.keras.layers.Conv2D(filters, 3, strides=2, padding="same", use_bias=False)(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.Activation("relu")(x)
    for dilation in (2, 4, 8):
        x = tf.keras.layers.Conv2D(128, 3, dilation_rate=dilation, padding="same", use_bias=False)(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.Activation("relu")(x)
    outputs = tf.keras.layers.Conv2D(6, 1, padding="same", activation=None)(x)
    return tf.keras.Model(inputs, outputs, name="custom_phone_detector")


def _centerness(cell_x: float, cell_y: float, left: float, right: float,
                top: float, bottom: float) -> float:
    lr = min(cell_x - left, right - cell_x) / max(cell_x - left, right - cell_x, 1e-6)
    tb = min(cell_y - top, bottom - cell_y) / max(cell_y - top, bottom - cell_y, 1e-6)
    return float(np.sqrt(max(lr, 0.0) * max(tb, 0.0)))


def _target(boxes: list[list[float]], rows: int, cols: int) -> np.ndarray:
    """Positive cells: (1, cx, cy, w, h, centerness).

    Cells inside the box are candidates; cells within the central region
    (CENTER_SAMPLING of the box) are preferred so the response stays on the
    object and off-centre cells learn a low centerness that suppresses them.
    """
    target = np.zeros((rows, cols, 6), dtype=np.float32)
    for _, cx, cy, width, height in boxes:
        left, right = (cx - width / 2) * cols, (cx + width / 2) * cols
        top, bottom = (cy - height / 2) * rows, (cy + height / 2) * rows
        box_x, box_y = cx * cols, cy * rows
        half_w, half_h = CENTER_SAMPLING * width * cols / 2, CENTER_SAMPLING * height * rows / 2
        inside, centred = [], []
        for row in range(max(0, int(np.floor(top))), min(rows, int(np.ceil(bottom)) + 1)):
            for col in range(max(0, int(np.floor(left))), min(cols, int(np.ceil(right)) + 1)):
                cell_x, cell_y = col + 0.5, row + 0.5
                if left <= cell_x <= right and top <= cell_y <= bottom:
                    inside.append((row, col))
                    if abs(cell_x - box_x) <= half_w and abs(cell_y - box_y) <= half_h:
                        centred.append((row, col))
        chosen = centred or inside
        if not chosen:
            row = int(np.clip(round(box_y - 0.5), 0, rows - 1))
            col = int(np.clip(round(box_x - 0.5), 0, cols - 1))
            chosen = [(row, col)]
        for row, col in chosen:
            target[row, col] = [1.0, cx, cy, width, height,
                                _centerness(col + 0.5, row + 0.5, left, right, top, bottom)]
    return target


def _load_samples(records: list[dict[str, Any]],
                  image_size: tuple[int, int] = PHONE_IMAGE_SIZE) -> tuple[np.ndarray, np.ndarray]:
    rows, cols = grid_shape(image_size)
    image_paths = {path.name: path for path in PHONE_IMAGES_DIR.rglob("*") if path.is_file()}
    images, targets = [], []
    for record in records:
        path = image_paths.get(record["image"])
        if path is None:
            raise FileNotFoundError(f"Image referenced by split is missing: {record['image']}")
        image = cv2.imread(str(path))
        if image is None:
            raise RuntimeError(f"Unable to load training image: {path}")
        image = cv2.cvtColor(cv2.resize(image, image_size), cv2.COLOR_BGR2RGB)
        images.append(image.astype(np.uint8))
        targets.append(_target(record["boxes"], rows, cols))
    if not images:
        raise RuntimeError("No samples available for this split.")
    return np.asarray(images), np.asarray(targets)


@tf.keras.utils.register_keras_serializable(package="phone_detector")
def phone_grid_loss(y_true, y_pred):
    """Class-balanced objectness plus CIoU box loss on positive cells only."""
    object_target = y_true[..., 0]
    object_loss = tf.nn.weighted_cross_entropy_with_logits(
        object_target, y_pred[..., 0], pos_weight=OBJECTNESS_POS_WEIGHT)
    true_box = y_true[..., 1:5]
    pred_box = tf.sigmoid(y_pred[..., 1:5])
    tcx, tcy, tw, th = true_box[..., 0], true_box[..., 1], true_box[..., 2], true_box[..., 3]
    pcx, pcy, pw, ph = pred_box[..., 0], pred_box[..., 1], pred_box[..., 2], pred_box[..., 3]
    tx1, ty1 = tcx - tw / 2, tcy - th / 2
    tx2, ty2 = tcx + tw / 2, tcy + th / 2
    px1, py1 = pcx - pw / 2, pcy - ph / 2
    px2, py2 = pcx + pw / 2, pcy + ph / 2
    inter = tf.maximum(0.0, tf.minimum(tx2, px2) - tf.maximum(tx1, px1)) * \
        tf.maximum(0.0, tf.minimum(ty2, py2) - tf.maximum(ty1, py1))
    union = tw * th + pw * ph - inter
    iou = inter / (union + 1e-7)
    enclosing = (tf.maximum(tx2, px2) - tf.minimum(tx1, px1)) ** 2 + \
        (tf.maximum(ty2, py2) - tf.minimum(ty1, py1)) ** 2
    centre = (pcx - tcx) ** 2 + (pcy - tcy) ** 2
    aspect = (4.0 / np.pi ** 2) * (tf.atan(tw / (th + 1e-7)) - tf.atan(pw / (ph + 1e-7))) ** 2
    ciou = iou - centre / (enclosing + 1e-7) - aspect / (1.0 - iou + aspect + 1e-7) * aspect
    positives = tf.reduce_sum(object_target) + 1e-6
    box_loss = tf.reduce_sum((1.0 - ciou) * object_target) / positives
    centerness_loss = tf.reduce_sum(
        tf.nn.sigmoid_cross_entropy_with_logits(y_true[..., 5], y_pred[..., 5]) * object_target
    ) / positives
    return tf.reduce_mean(object_loss) + BOX_LOSS_WEIGHT * box_loss + \
        CENTERNESS_LOSS_WEIGHT * centerness_loss


def _flip_target(target: tf.Tensor) -> tf.Tensor:
    target = tf.reverse(target, axis=[1])
    objectness = target[..., 0:1]
    mirrored = 1.0 - target[..., 1:2]
    return tf.concat([objectness, mirrored, target[..., 2:]], axis=-1)


def _augment(image: tf.Tensor, target: tf.Tensor) -> tuple[tf.Tensor, tf.Tensor]:
    image = tf.cast(image, tf.float32) / 255.0
    if tf.random.uniform(()) < 0.5:
        image = tf.image.flip_left_right(image)
        target = _flip_target(target)
    image = tf.image.random_brightness(image, BRIGHTNESS_DELTA)
    image = tf.image.random_contrast(image, 1.0 - BRIGHTNESS_DELTA, 1.0 + BRIGHTNESS_DELTA)
    image = tf.image.random_saturation(image, 1.0 - BRIGHTNESS_DELTA, 1.0 + BRIGHTNESS_DELTA)
    return tf.clip_by_value(image, 0.0, 1.0), target


def _plain(image: tf.Tensor, target: tf.Tensor) -> tuple[tf.Tensor, tf.Tensor]:
    return tf.cast(image, tf.float32) / 255.0, target


def _dataset(images: np.ndarray, targets: np.ndarray, batch_size: int,
             shuffle: bool, seed: int, augment: bool) -> tf.data.Dataset:
    dataset = tf.data.Dataset.from_tensor_slices((images, targets))
    if shuffle:
        dataset = dataset.shuffle(len(images), seed=seed, reshuffle_each_iteration=True)
    dataset = dataset.map(_augment if augment else _plain, num_parallel_calls=tf.data.AUTOTUNE)
    return dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)


def train_phone_detector(
    epochs: int = PHONE_EPOCHS,
    batch_size: int = PHONE_BATCH_SIZE,
    learning_rate: float = PHONE_LEARNING_RATE,
    image_size: tuple[int, int] = PHONE_IMAGE_SIZE,
    confidence_threshold: float = PHONE_CONFIDENCE_THRESHOLD,
    seed: int = PHONE_RANDOM_SEED,
    split_ratios: tuple[float, float, float] = PHONE_SPLIT_RATIOS,
    early_stopping_patience: int = PHONE_EARLY_STOPPING_PATIENCE,
) -> dict[str, Any]:
    PHONE_TRAINING_LOG.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        filename=PHONE_TRAINING_LOG, level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s", force=True,
    )
    try:
        if epochs < 1 or batch_size < 1 or learning_rate <= 0:
            raise ValueError("epochs and batch_size must be positive; learning_rate must be positive")
        if not 0 < confidence_threshold <= 1:
            raise ValueError("confidence_threshold must be in (0, 1]")
        if any(value <= 0 for value in image_size):
            raise ValueError("image_size values must be positive")
        if early_stopping_patience < 0:
            raise ValueError("early_stopping_patience must be zero or positive")
        validate_config()
        logging.info("TRAINING STARTED epochs=%s batch_size=%s learning_rate=%s image_size=%s seed=%s",
                     epochs, batch_size, learning_rate, image_size, seed)
        random.seed(seed)
        np.random.seed(seed)
        tf.random.set_seed(seed)

        logging.info("STATUS %s", STATUS_VALIDATING)
        print("Mobile Phone Detector Training")
        try:
            prepared = validate_and_split(seed=seed, split_ratios=split_ratios)
        except RuntimeError as error:
            logging.error("STATUS %s: %s", STATUS_DATASET_NOT_READY, error)
            raise
        logging.info("STATUS %s counts=%s", STATUS_PREPARING, prepared["summary"]["splits"])
        logging.info("DATASET COUNTS valid_phone=%s valid_nophone=%s objects=%s",
                     prepared["summary"]["valid_phone_images"],
                     prepared["summary"]["valid_no_phone_images"],
                     prepared["summary"]["annotated_phone_objects"])
        print("Dataset validation: PASSED")

        train_x, train_y = _load_samples(prepared["records"]["train"], image_size)
        if prepared["records"]["val"]:
            val_x, val_y = _load_samples(prepared["records"]["val"], image_size)
        else:
            logging.warning("No validation split available; using the training split for validation.")
            val_x, val_y = train_x, train_y
        train_dataset = _dataset(train_x, train_y, batch_size, True, seed, augment=True)
        val_dataset = _dataset(val_x, val_y, batch_size, False, seed, augment=False)

        logging.info("STATUS %s", STATUS_INITIALIZING)
        model = build_model(image_size)
        steps_per_epoch = (len(train_x) + batch_size - 1) // batch_size
        schedule = tf.keras.optimizers.schedules.CosineDecay(
            initial_learning_rate=learning_rate,
            decay_steps=max(1, epochs * steps_per_epoch), alpha=0.02)
        model.compile(optimizer=tf.keras.optimizers.Adam(schedule), loss=phone_grid_loss)
        PHONE_MODEL_DIR.mkdir(parents=True, exist_ok=True)
        checkpoint = PHONE_MODEL_DIR / "best_model.keras"
        history_path = PHONE_MODEL_DIR / "training_history.csv"
        history_path.unlink(missing_ok=True)

        def _on_epoch_end(epoch: int, logs: dict[str, Any] | None) -> None:
            logs = logs or {}
            train_loss, val_loss = logs.get("loss"), logs.get("val_loss")
            logging.info("EPOCH %s/%s training_loss=%s validation_loss=%s",
                         epoch + 1, epochs, train_loss, val_loss)
            print(f"Epoch {epoch + 1}/{epochs}")
            print(f"training loss: {train_loss:.4f}" if train_loss is not None else "training loss: n/a")
            print(f"validation loss: {val_loss:.4f}" if val_loss is not None else "validation loss: n/a")

        callbacks = [
            tf.keras.callbacks.ModelCheckpoint(str(checkpoint), monitor="val_loss",
                                               save_best_only=True, verbose=0),
            tf.keras.callbacks.CSVLogger(str(history_path)),
            tf.keras.callbacks.LambdaCallback(on_epoch_end=_on_epoch_end),
        ]
        if early_stopping_patience > 0:
            callbacks.append(tf.keras.callbacks.EarlyStopping(
                monitor="val_loss", patience=early_stopping_patience, restore_best_weights=True))
            logging.info("Early stopping enabled with patience=%s", early_stopping_patience)

        print("Model initialization: COMPLETED")
        logging.info("STATUS %s", STATUS_TRAINING)
        history = model.fit(train_dataset, validation_data=val_dataset, epochs=epochs,
                            callbacks=callbacks, verbose=0)
        if not checkpoint.exists():
            raise RuntimeError("Training finished without saving a model checkpoint.")

        logging.info("STATUS %s", STATUS_EVALUATING)
        trained = tf.keras.models.load_model(
            checkpoint, custom_objects={"phone_grid_loss": phone_grid_loss}, compile=False)
        logging.info("STATUS %s checkpoint=%s", STATUS_SAVING, checkpoint)

        backup = None
        if PHONE_MODEL_PATH.exists():
            backup = PHONE_MODEL_DIR / "phone_detector.backup.keras"
            shutil.copy2(PHONE_MODEL_PATH, backup)
            logging.info("BACKUP SAVED %s", backup)
        pending = PHONE_MODEL_DIR / "phone_detector.pending.keras"
        pending.unlink(missing_ok=True)
        trained.save(pending)
        verified = tf.keras.models.load_model(pending, compile=False)
        verified.save(PHONE_MODEL_PATH)
        pending.unlink(missing_ok=True)

        rows, cols = grid_shape(image_size)
        config = {
            "framework": "tensorflow",
            "model_type": "custom_phone_detector",
            "image_size": list(image_size),
            "stride": PHONE_STRIDE,
            "grid": [rows, cols],
            "epochs": epochs,
            "batch_size": batch_size,
            "learning_rate": learning_rate,
            "seed": seed,
            "split_ratios": list(split_ratios),
            "confidence_threshold": float(confidence_threshold),
            "early_stopping_patience": early_stopping_patience,
            "augmentation": ["horizontal_flip", "brightness", "contrast", "saturation"],
            "lr_schedule": "cosine_decay",
            "backbone": "conv stride-8 + dilated(2,4,8)",
        }
        (PHONE_MODEL_DIR / "class_names.json").write_text(
            json.dumps([{"id": 0, "name": "mobile_phone"}], indent=2), encoding="utf-8")
        (PHONE_MODEL_DIR / "training_config.json").write_text(
            json.dumps(config, indent=2), encoding="utf-8")
        result = {
            "epochs_requested": epochs,
            "epochs_completed": len(history.history["loss"]),
            "final_training_loss": float(history.history["loss"][-1]),
            "final_validation_loss": float(history.history["val_loss"][-1]),
            "best_model": str(checkpoint),
            "model": str(PHONE_MODEL_PATH),
            "backup": str(backup) if backup else None,
            "training_history_csv": str(history_path),
        }
        (PHONE_MODEL_DIR / "training_results.json").write_text(
            json.dumps(result, indent=2), encoding="utf-8")
        logging.info("STATUS %s %s", STATUS_COMPLETED, result)
        print("Training completed")
        print("Model saved successfully")
        return result
    except Exception:
        logging.error("STATUS %s\n%s", STATUS_FAILED, traceback.format_exc())
        print(f"TRAINING FAILED: see {PHONE_TRAINING_LOG}")
        raise


def _parse_size(value: str) -> tuple[int, int]:
    parts = value.lower().replace("x", ",").split(",")
    if len(parts) != 2:
        raise argparse.ArgumentTypeError("image size must look like 256x192")
    return int(parts[0]), int(parts[1])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the custom phone detector from scratch.")
    parser.add_argument("--epochs", type=int, default=PHONE_EPOCHS)
    parser.add_argument("--batch-size", type=int, default=PHONE_BATCH_SIZE)
    parser.add_argument("--learning-rate", type=float, default=PHONE_LEARNING_RATE)
    parser.add_argument("--image-size", type=_parse_size, default=PHONE_IMAGE_SIZE)
    parser.add_argument("--confidence-threshold", type=float, default=PHONE_CONFIDENCE_THRESHOLD)
    parser.add_argument("--seed", type=int, default=PHONE_RANDOM_SEED)
    parser.add_argument("--early-stopping-patience", type=int, default=PHONE_EARLY_STOPPING_PATIENCE)
    arguments = parser.parse_args()
    train_phone_detector(
        epochs=arguments.epochs,
        batch_size=arguments.batch_size,
        learning_rate=arguments.learning_rate,
        image_size=arguments.image_size,
        confidence_threshold=arguments.confidence_threshold,
        seed=arguments.seed,
        early_stopping_patience=arguments.early_stopping_patience,
    )
