"""Train and evaluate the custom six-class face-direction CNN."""
import os
import json
import hashlib
from pathlib import Path
import numpy as np
import cv2
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
import matplotlib.pyplot as plt
from config import FACE_CLASSES, FACE_DATASET_DIR, CNN_INPUT_SIZE, MODELS_DIR, TRAINING_RESULTS_DIR
from .dataset_validation import validate_face_dataset

# Keep native Windows CPU training within a stable memory budget.
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("TF_NUM_INTRAOP_THREADS", "1")
os.environ.setdefault("TF_NUM_INTEROP_THREADS", "1")


def build_model():
    from tensorflow.keras import Sequential, regularizers
    from tensorflow.keras.layers import Conv2D, MaxPooling2D, BatchNormalization, Dropout, Flatten, Dense
    reg = regularizers.l2(1e-4)
    model = Sequential([
        Conv2D(32, 3, activation="relu", kernel_regularizer=reg, input_shape=(*CNN_INPUT_SIZE, 3)),
        BatchNormalization(), MaxPooling2D(), Conv2D(64, 3, activation="relu", kernel_regularizer=reg),
        BatchNormalization(), MaxPooling2D(), Conv2D(128, 3, activation="relu", kernel_regularizer=reg),
        MaxPooling2D(), Dropout(0.35), Flatten(), Dense(128, activation="relu", kernel_regularizer=reg),
        Dropout(0.45), Dense(len(FACE_CLASSES), activation="softmax"),
    ])
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model


def load_images():
    """Load each class once, skipping exact duplicate frames.

    Consecutive auto-captured frames are often byte-identical; removing them
    stops the same image leaking into both the train and validation splits.
    """
    images, labels = [], []
    for index, class_name in enumerate(FACE_CLASSES):
        seen = set()
        for path in sorted((FACE_DATASET_DIR / class_name).glob("*")):
            image = cv2.imread(str(path))
            if image is None:
                continue
            digest = hashlib.sha256(image.tobytes()).hexdigest()
            if digest in seen:
                continue
            seen.add(digest)
            images.append(cv2.cvtColor(cv2.resize(image, CNN_INPUT_SIZE), cv2.COLOR_BGR2RGB))
            labels.append(index)
    if not images:
        raise RuntimeError("No readable face images found. Run python -m src.capture_dataset first.")
    return np.asarray(images, dtype=np.uint8), np.asarray(labels, dtype=np.int64)


def train(epochs: int = 60, batch_size: int = 8):
    summary = validate_face_dataset()
    print(json.dumps(summary, indent=2))
    if not summary["ready"]:
        raise RuntimeError("Dataset validation failed; each class needs readable samples before training.")
    x, y = load_images()
    class_weight = {
        int(label): float(weight)
        for label, weight in zip(np.unique(y), compute_class_weight("balanced", classes=np.unique(y), y=y))
    }
    print(f"Training on {len(x)} unique frames; class weights: {class_weight}")
    x_train, x_val, y_train, y_val = train_test_split(x, y, test_size=0.2, stratify=y, random_state=42)
    x_val = x_val.astype(np.float32) / 255.0
    import tensorflow as tf
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    tf.keras.utils.set_random_seed(42)
    model = build_model()

    def random_brightness(image: np.ndarray) -> np.ndarray:
        factor = np.random.uniform(0.80, 1.20)
        return np.clip(image * factor, 0.0, 255.0)

    generator = ImageDataGenerator(rescale=1.0 / 255.0, rotation_range=10, width_shift_range=.10,
                                   height_shift_range=.10, zoom_range=.12, fill_mode="nearest",
                                   horizontal_flip=False, preprocessing_function=random_brightness)
    TRAINING_RESULTS_DIR.mkdir(exist_ok=True)
    history = model.fit(generator.flow(x_train, y_train, batch_size=batch_size),
                        validation_data=(x_val, y_val), epochs=epochs, class_weight=class_weight,
                        callbacks=[EarlyStopping(patience=10, restore_best_weights=True),
                                   ReduceLROnPlateau(patience=4, factor=.5),
                                   ModelCheckpoint(str(MODELS_DIR / "face_direction_cnn.keras"),
                                                   save_best_only=True)])
    predictions = np.argmax(model.predict(x_val, verbose=0), axis=1)
    report = classification_report(y_val, predictions, target_names=FACE_CLASSES)
    (TRAINING_RESULTS_DIR / "classification_report.txt").write_text(report, encoding="utf-8")
    (MODELS_DIR / "face_direction_classes.json").write_text(
        json.dumps({"classes": FACE_CLASSES, "input_size": CNN_INPUT_SIZE}), encoding="utf-8")
    cm = confusion_matrix(y_val, predictions)
    plt.figure(figsize=(8, 7)); plt.imshow(cm, cmap="Blues"); plt.colorbar()
    plt.xticks(range(len(FACE_CLASSES)), FACE_CLASSES, rotation=45); plt.yticks(range(len(FACE_CLASSES)), FACE_CLASSES)
    plt.xlabel("Predicted"); plt.ylabel("Actual"); plt.tight_layout()
    plt.savefig(TRAINING_RESULTS_DIR / "confusion_matrix.png"); plt.close()
    plt.figure(figsize=(10, 4)); plt.subplot(1, 2, 1)
    plt.plot(history.history["accuracy"]); plt.plot(history.history["val_accuracy"]); plt.title("Accuracy")
    plt.legend(["train", "validation"]); plt.subplot(1, 2, 2)
    plt.plot(history.history["loss"]); plt.plot(history.history["val_loss"]); plt.title("Loss")
    plt.legend(["train", "validation"]); plt.tight_layout()
    plt.savefig(TRAINING_RESULTS_DIR / "training_history.png"); plt.close()
    print(report)


if __name__ == "__main__":
    train()
