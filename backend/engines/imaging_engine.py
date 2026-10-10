"""
imaging_engine.py  —  Knee X-Ray KL-Grade Classifier
Architecture : ResNet-18 fine-tuned on knee X-rays (KL grades 0-4)
Weights      : AidanKraan/knee-oa-kl-model  (HuggingFace)
               D:/sih/backend/models/knee_kl_model.pth
Input        : JPEG/PNG image, resized to 224x224, normalised with ImageNet stats
Output       : KL grade (0-4), probability, risk label
"""

import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "knee_kl_model.pth")

KL_LABELS = {
    0: "Grade 0 - No OA (Normal)",
    1: "Grade 1 - Doubtful OA",
    2: "Grade 2 - Mild OA",
    3: "Grade 3 - Moderate OA",
    4: "Grade 4 - Severe OA",
}

KL_RISK = {
    0: "low",
    1: "low",
    2: "moderate",
    3: "high",
    4: "high",
}

TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.Grayscale(num_output_channels=3),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

_model = None

def _load_model():
    global _model
    if _model is not None:
        return _model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Knee KL model not found at {MODEL_PATH}")
    net = models.resnet18(weights=None)
    net.fc = nn.Linear(512, 5)
    state_dict = torch.load(MODEL_PATH, map_location="cpu")
    net.load_state_dict(state_dict, strict=True)
    net.eval()
    _model = net
    print("[imaging_engine] ResNet-18 KL model loaded.")
    return _model


def analyze_imaging(image_path: str, joint: str = "knee") -> dict:
    if joint.lower() != "knee":
        return {
            "status": "unsupported",
            "finding": f"Imaging model not available for {joint}.",
            "structural_risk": None,
            "confidence": None,
            "kl_grade": None,
            "kl_label": None,
        }
    try:
        model = _load_model()
        img = Image.open(image_path).convert("RGB")
        tensor = TRANSFORM(img).unsqueeze(0)
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=1).squeeze().tolist()
        kl_grade = int(torch.argmax(logits, dim=1).item())
        confidence = float(probs[kl_grade])
        structural_risk = round(kl_grade / 4.0, 3)
        return {
            "status": "success",
            "kl_grade": kl_grade,
            "kl_label": KL_LABELS[kl_grade],
            "risk_level": KL_RISK[kl_grade],
            "structural_risk": structural_risk,
            "finding": KL_LABELS[kl_grade],
            "confidence": round(confidence, 3),
            "probabilities": {f"KL{i}": round(p, 3) for i, p in enumerate(probs)},
            "model": "ResNet-18 / AidanKraan/knee-oa-kl-model",
            "note": "Screening prototype - not a clinical diagnosis.",
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "finding": "Imaging analysis failed.",
            "structural_risk": None,
            "confidence": None,
            "kl_grade": None,
        }
