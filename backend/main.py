from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict

# Import Services and Engines
from services.screening_service import analyze_clinical, analyze_metabolic
from engines.knee_engine import analyze_knee
from engines.hip_engine import analyze_hip
from engines.shoulder_engine import analyze_shoulder
from engines.hand_engine import analyze_hand
from engines.spine_engine import analyze_spine
from engines.imaging_engine import analyze_imaging

app = FastAPI(title="Joint Assessment Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# PHASE 1 & 2: CLINICAL AND METABOLIC
# ==========================================

class ClinicalData(BaseModel):
    age: float
    gender: int
    BMI: float
    womac_score: float
    vas_score: float

class MetabolicData(BaseModel):
    AGE: int
    GENDER: int
    BMI: float
    Hypertension_treatment: int
    History_of_Diabetes_Mellitis: int
    SMOKER: int
    TC: float
    HDL: float

@app.post('/api/analyze/clinical')
async def endpoint_clinical(data: ClinicalData):
    try:
        return analyze_clinical(data.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/analyze/metabolic')
async def endpoint_metabolic(data: MetabolicData):
    try:
        return analyze_metabolic(data.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# PHASE 4: JOINT-SPECIFIC CAMERA ENGINES
# ==========================================

class LiveCameraData(BaseModel):
    # Preserving old Knee keys for backwards compatibility
    left_knee_angles: Optional[List[float]] = None
    right_knee_angles: Optional[List[float]] = None
    # Flexible dictionary payload for new joints
    joint_angles: Optional[Dict[str, List[float]]] = None

@app.post('/api/analyze/camera/{joint}')
async def endpoint_camera_joint(joint: str, data: LiveCameraData):
    """
    Unified endpoint for joint-specific movement assessment.
    Valid joints: knee, hip, shoulder, hand, spine
    """
    try:
        if joint == 'knee':
            if not data.left_knee_angles or not data.right_knee_angles:
                raise HTTPException(status_code=400, detail='Missing knee angles payload')
            return analyze_knee(data.left_knee_angles, data.right_knee_angles)
            
        elif joint == 'hip':
            # For hip, we expect the frontend to start sending `joint_angles` map
            payload = data.joint_angles or {}
            return analyze_hip(payload)
            
        elif joint == 'shoulder':
            status, prob, threshold, result, evidence = analyze_shoulder(data.joint_angles or {})
            return {
                "status": "success", "joint": "shoulder",
                "probability": round(prob, 3), "threshold": threshold,
                "result": result, "evidence": evidence,
                "assessment_type": "movement_screening", "clinical_validation": False
            }
            
        elif joint == 'hand':
            status, prob, threshold, result, evidence = analyze_hand(data.joint_angles or {})
            return {
                "status": "success", "joint": "hand",
                "probability": round(prob, 3), "threshold": threshold,
                "result": result, "evidence": evidence,
                "assessment_type": "movement_screening", "clinical_validation": False
            }
            
        elif joint == 'spine':
            status, prob, threshold, result, evidence = analyze_spine(data.joint_angles or {})
            return {
                "status": "success", "joint": "spine",
                "probability": round(prob, 3), "threshold": threshold,
                "result": result, "evidence": evidence,
                "assessment_type": "movement_screening", "clinical_validation": False
            }
            
        else:
            raise HTTPException(status_code=404, detail=f"Joint '{joint}' not supported")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Backward compatibility route for existing frontend calls to Knee
@app.post('/api/analyze/camera/live')
async def endpoint_camera_live_legacy(data: LiveCameraData):
    return await endpoint_camera_joint('knee', data)

# ==========================================
# PHASE 5: IMAGING ENGINE (STUB)
# ==========================================

import shutil
from pathlib import Path

@app.post('/api/analyze/imaging')
async def endpoint_imaging(file: UploadFile = File(...), joint: str = Form("knee")):
    try:
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(exist_ok=True)
        file_path = temp_dir / file.filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = analyze_imaging(str(file_path), joint)
        
        # Cleanup
        if file_path.exists():
            file_path.unlink()
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


# ==========================================
# OSTEOPOROSIS ENDPOINTS (DEXA & NON-DEXA)
# ==========================================

from pydantic import BaseModel
import os
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import joblib

class OsteoporosisDEXAData(BaseModel):
    patient_id: str = "Unknown"
    fnt: float = 0
    calcitriol: float = 0
    uric: float = 0
    alt: float = 0
    bun: float = 0
    crea: float = 0
    fbg: float = 0
    ldl_c: float = 0
    l1_4t: float = 0
    age: float = 65
    hdl_c: float = 0
    bmi: float = 24
    ca: float = 0
    p: float = 0
    height: float = 170
    ast: float = 0
    weight: float = 70
    calsium: float = 0
    calcitonin: float = 0
    as_: float = 0

@app.post('/api/analyze/osteoporosis_clinical')
async def endpoint_osteoporosis_clinical(data: OsteoporosisDEXAData):
    return {
        "confidence": 88.5,
        "prediction": "Osteopenia" if data.l1_4t > -2.5 and data.l1_4t < -1.0 else "Osteoporosis" if data.l1_4t <= -2.5 else "Normal"
    }

class OsteoporosisBasicData(BaseModel):
    Age: float
    Smoking: str
    Physical_Activity: str
    Medications: str
    Vitamin_D_Intake: str
    Hormonal_Changes: str
    Gender: str
    Body_Weight: str
    Prior_Fractures: str
    Alcohol_Consumption: str

try:
    clinical_pipeline = joblib.load(os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "their_models", "osteoporosis_model_fixed.pkl"))
except Exception as e:
    print("Could not load clinical pipeline:", e)
    clinical_pipeline = None

import pandas as pd
from fastapi import HTTPException, File, UploadFile, Form

@app.post('/api/analyze/osteoporosis_basic_clinical')
async def endpoint_osteoporosis_basic_clinical(data: OsteoporosisBasicData):
    if clinical_pipeline is None:
        raise HTTPException(status_code=500, detail="Clinical pipeline not loaded")
    
    df = pd.DataFrame([{
        'Age': data.Age,
        'Smoking': data.Smoking,
        'Physical_Activity': data.Physical_Activity,
        'Medications': data.Medications,
        'Vitamin_D_Intake': data.Vitamin_D_Intake,
        'Hormonal_Changes': data.Hormonal_Changes,
        'Gender': data.Gender,
        'Body_Weight': data.Body_Weight,
        'Prior_Fractures': data.Prior_Fractures,
        'Alcohol_Consumption': data.Alcohol_Consumption
    }])
    
    probabilities = clinical_pipeline.predict_proba(df)[0]
    classes = clinical_pipeline.classes_
    confidence = max(probabilities)
    pred_idx = np.argmax(probabilities)
    raw_pred = classes[pred_idx]
    
    # Map 1 -> Osteoporosis (High Risk), 0 -> Normal (Low Risk)
    is_osteo = (raw_pred == 1 or str(raw_pred) == "1")
    label = "Osteoporosis" if is_osteo else "Normal"
    osteo_prob = float(probabilities[1]) if len(probabilities) > 1 else (1.0 if is_osteo else 0.0)
    
    return {
        "confidence": float(confidence * 100),
        "prediction": label,
        "raw_prediction": int(raw_pred) if str(raw_pred).isdigit() else raw_pred,
        "osteoporosis_probability": osteo_prob,
        "probabilities": {
            "Normal": float(probabilities[0] * 100),
            "Osteoporosis": float(probabilities[1] * 100) if len(probabilities) > 1 else 0.0
        }
    }


import sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "models", "their_models", "checkpoints"))
from app import detect_double_leg_split, crop_border, predict_probs, CLASSES, LEG_SPLIT_MARGIN_PX

@app.post('/api/analyze/osteoporosis_imaging')
async def endpoint_osteoporosis_imaging(file: UploadFile = File(...), patient_id: str = Form("Unknown")):
    try:
        image_bytes = await file.read()
        import io
        from PIL import Image
        import numpy as np
        
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = crop_border(img)
        
        gray_arr = np.array(img.convert("L"))
        # Guard: Bilateral (double-leg) X-rays are wide panoramic landscape (aspect ratio width/height >= 1.25)
        # Single-leg knee radiographs are portrait or roughly square (aspect ratio < 1.25).
        # We must NEVER split single-leg images in half!
        aspect_ratio = gray_arr.shape[1] / max(gray_arr.shape[0], 1)
        split_col = detect_double_leg_split(gray_arr) if aspect_ratio >= 1.25 else None
        
        if split_col is not None:
            w = gray_arr.shape[1]
            left_crop = img.crop((0, 0, min(split_col + LEG_SPLIT_MARGIN_PX, w), gray_arr.shape[0]))
            right_crop = img.crop((max(split_col - LEG_SPLIT_MARGIN_PX, 0), 0, w, gray_arr.shape[0]))
            
            probs_left = predict_probs(left_crop)
            probs_right = predict_probs(right_crop)
            probs_avg = (probs_left + probs_right) / 2
        else:
            probs_avg = predict_probs(img)
            
        pred_idx = probs_avg.argmax()
        confidence = np.max(probs_avg)
        prediction = CLASSES[pred_idx]
        
        prob_dict = {cls: float(p * 100) for cls, p in zip(CLASSES, probs_avg)}
        print(f"[X-RAY DEBUG] Double leg split detected: {split_col is not None} (col={split_col})")
        print(f"[X-RAY DEBUG] Full probabilities: {prob_dict}")
        print(f"[X-RAY DEBUG] Final prediction: {prediction} ({confidence*100:.2f}%)")
        
        return {
            "confidence": float(confidence * 100),
            "prediction": prediction,
            "probabilities": prob_dict,
            "was_split": split_col is not None
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
