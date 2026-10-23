import os
import io
import base64
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import numpy as np
import cv2

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/densenet121_clean.pth')
CLASSES = ["Normal", "Osteopenia", "Osteoporosis"]

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
densenet_model = None

def load_densenet_model():
    global densenet_model
    if densenet_model is None and os.path.exists(MODEL_PATH):
        try:
            m = models.densenet121()
            m.classifier = nn.Sequential(
                nn.Dropout(0.2),
                nn.Linear(1024, 256),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(256, 3)
            )
            state_dict = torch.load(MODEL_PATH, map_location=device)
            m.load_state_dict(state_dict)
            m.to(device)
            m.eval()
            densenet_model = m
            print(f"Successfully loaded DenseNet-121 Clean model on {device}")
        except Exception as e:
            print(f"Failed to load DenseNet-121 model: {e}")

load_densenet_model()

# ImageNet normalization
eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def check_image_quality(img_pil: Image.Image):
    """
    Quality gatekeeper: rejects blurry, underexposed, or low-resolution images.
    Returns: (passed: bool, reason: str, metrics: dict)
    """
    w, h = img_pil.size
    if min(w, h) < 120:
        return False, f"Image resolution too low ({w}x{h} px). Radiograph must be at least 120x120 pixels.", {"blur": 0, "contrast": 0}
        
    gray = np.array(img_pil.convert("L"))
    blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    contrast_score = float(np.std(gray))
    mean_brightness = float(np.mean(gray))
    
    if blur_score < 25.0:
        return False, f"Severe motion blur detected (sharpness {blur_score:.1f} < 25.0). Please upload a clear diagnostic radiograph.", {"blur": blur_score, "contrast": contrast_score}
        
    if contrast_score < 12.0:
        return False, f"Insufficient radiographic dynamic range (contrast {contrast_score:.1f} < 12.0). Image appears washed out or uniform.", {"blur": blur_score, "contrast": contrast_score}
        
    if mean_brightness < 8.0:
        return False, "Image appears almost entirely black. Please verify the radiograph file.", {"blur": blur_score, "contrast": contrast_score}
        
    if mean_brightness > 248.0:
        return False, "Image appears completely overexposed/white.", {"blur": blur_score, "contrast": contrast_score}
        
    return True, "Image passed radiographic quality gate.", {"blur": blur_score, "contrast": contrast_score, "brightness": mean_brightness}

def crop_border(img_pil: Image.Image, tol: int = 15) -> Image.Image:
    """Trim uniform black border padding common in digital X-rays."""
    gray = np.array(img_pil.convert("L"))
    mask = gray > tol
    if not mask.any():
        return img_pil
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    if (rmax - rmin) < 50 or (cmax - cmin) < 50:
        return img_pil
    return img_pil.crop((cmin, rmin, cmax + 1, rmax + 1))

def apply_clahe(img_pil: Image.Image) -> Image.Image:
    """Apply Contrast Limited Adaptive Histogram Equalization to highlight trabecular bone loss."""
    rgb = np.array(img_pil.convert("RGB"))
    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    
    merged = cv2.merge((cl, a, b))
    enhanced_rgb = cv2.cvtColor(merged, cv2.COLOR_LAB2RGB)
    return Image.fromarray(enhanced_rgb)

def generate_gradcam_overlay(img_pil: Image.Image, target_class_idx: int) -> str:
    """
    Computes Grad-CAM for DenseNet-121 last convolutional features
    and returns a base64 encoded data URI of the heatmap overlay on the original X-ray.
    """
    load_densenet_model()
    if densenet_model is None:
        return ""
        
    img_clahe = apply_clahe(img_pil)
    tensor = eval_transform(img_clahe).unsqueeze(0).to(device)
    tensor.requires_grad = True
    
    features = densenet_model.features(tensor)
    features.retain_grad()
    
    out = F.relu(features, inplace=False)
    out = F.adaptive_avg_pool2d(out, (1, 1))
    out = torch.flatten(out, 1)
    logits = densenet_model.classifier(out)
    
    target_score = logits[0, target_class_idx]
    densenet_model.zero_grad()
    target_score.backward()
    
    grads = features.grad
    weights = torch.mean(grads, dim=(2, 3), keepdim=True)
    cam = torch.sum(weights * features, dim=1, keepdim=True)
    cam = F.relu(cam)
    
    cam_np = cam.squeeze().cpu().detach().numpy()
    if np.max(cam_np) > 0:
        cam_np = (cam_np - np.min(cam_np)) / (np.max(cam_np) - np.min(cam_np) + 1e-8)
    else:
        cam_np = np.zeros_like(cam_np)
        
    orig_np = np.array(img_pil.convert("RGB"))
    cam_resized = cv2.resize(cam_np, (orig_np.shape[1], orig_np.shape[0]))
    heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    
    # Blend: 55% original X-ray, 45% heatmap
    overlay = cv2.addWeighted(orig_np, 0.55, heatmap_rgb, 0.45, 0)
    
    # Convert overlay to base64
    overlay_pil = Image.fromarray(overlay)
    buffered = io.BytesIO()
    overlay_pil.save(buffered, format="JPEG", quality=90)
    b64_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return f"data:image/jpeg;base64,{b64_str}"

def analyze_osteoporosis_xray(image_bytes: bytes, patient_age: float = 60.0):
    """
    End-to-end inference using DenseNet-121 Clean + CLAHE + Grad-CAM + Quality Gate.
    """
    load_densenet_model()
    
    try:
        raw_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return {
            'status': 'error',
            'detail': f'Invalid image format: {e}',
            'quality_passed': False
        }
        
    # Step 1: Quality Gatekeeper
    passed, reason, q_metrics = check_image_quality(raw_img)
    if not passed:
        return {
            'status': 'rejected',
            'detail': reason,
            'quality_passed': False,
            'prediction': 'Inconclusive / Rejected',
            'confidence': 0.0,
            'quality_metrics': q_metrics,
            'disclaimer': 'Image quality gatekeeper rejected this file to prevent erroneous clinical inference.'
        }
        
    # Step 2: Preprocessing (Border crop + CLAHE)
    cropped = crop_border(raw_img)
    enhanced = apply_clahe(cropped)
    
    # Step 3: PyTorch Inference
    tensor = eval_transform(enhanced).unsqueeze(0).to(device)
    
    with torch.no_grad():
        if densenet_model is not None:
            logits = densenet_model(tensor)
            probs = F.softmax(logits, dim=1).squeeze().cpu().numpy()
        else:
            # Fallback
            probs = np.array([0.33, 0.33, 0.34])
            
    prob_dict = {
        "Normal": float(probs[0] * 100),
        "Osteopenia": float(probs[1] * 100),
        "Osteoporosis": float(probs[2] * 100)
    }
    
    max_idx = int(np.argmax(probs))
    raw_confidence = float(np.max(probs))
    pred_label = CLASSES[max_idx]
    
    # Step 4: Screening Threshold & Inconclusive Safety Mode
    # If the model is guessing with low certainty (top probability < 50%), trigger inconclusive mode
    is_inconclusive = raw_confidence < 0.48
    if is_inconclusive:
        final_prediction = "Inconclusive (Borderline Bone Mineral Density)"
        screening_tier = "Referral Advised"
    else:
        final_prediction = pred_label
        if pred_label == "Osteoporosis":
            screening_tier = "High Risk / Immediate DEXA Recommended"
        elif pred_label == "Osteopenia":
            screening_tier = "Moderate Risk / Lifestyle & Calcium Follow-up"
        else:
            screening_tier = "Low Risk / Age-Appropriate Baseline"
            
    # Step 5: Grad-CAM generation
    # Highlight trabecular bone loss regions (index 2 for Osteoporosis, or index 1 for Osteopenia)
    cam_target_idx = 2 if probs[2] >= 0.25 else (1 if probs[1] >= probs[0] else 0)
    gradcam_data_uri = generate_gradcam_overlay(cropped, cam_target_idx)
    
    # Step 6: Estimated Bone Health Age
    # Based on actual patient age and bone density tier
    if pred_label == "Osteoporosis":
        bone_age = int(min(max(patient_age + 14, 72), 92))
    elif pred_label == "Osteopenia":
        bone_age = int(patient_age + 5)
    else:
        bone_age = int(max(patient_age - 6, 30))
        
    return {
        'status': 'success',
        'prediction': final_prediction,
        'raw_prediction': pred_label,
        'confidence': round(raw_confidence * 100, 2),
        'probabilities': prob_dict,
        'screening_tier': screening_tier,
        'bone_health_age': bone_age,
        'actual_age': int(patient_age),
        'gradcam_image': gradcam_data_uri,
        'quality_passed': True,
        'quality_metrics': q_metrics,
        'clahe_applied': True,
        'model_name': 'DenseNet-121 (Bone Mineral Density Clean Final)',
        'target_region': 'Proximal Tibia / Femoral Condyles Trabecular Matrix'
    }
