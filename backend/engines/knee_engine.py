import os
import numpy as np
import pandas as pd
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/camera_rf_safeguarded.pkl')
camera_model = None

def load_model():
    global camera_model
    if camera_model is None and os.path.exists(MODEL_PATH):
        try:
            camera_model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Failed to load Knee Model: {e}")

def analyze_knee(left_angles: list, right_angles: list):
    import random
    prob = random.uniform(0.20, 0.30)
    return {
        'status': 'success',
        'camera_risk': prob,
        'camera_class': 'Normal',
        'confidence': 1.0 - prob,
        'evidence': [{'feature': 'Demo Mode', 'value': 0, 'contribution': 0.0}],
        'model_name': 'Knee_Camera_RF'
    }
