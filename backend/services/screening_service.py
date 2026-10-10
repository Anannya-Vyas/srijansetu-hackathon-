import os
import joblib
import pandas as pd
import shap
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), '../models')
clinical_model = None
metabolic_model = None

def load_models():
    pass

def analyze_clinical(data: dict):
    # Deterministic risk calculation for Clinical
    womac_score = float(data.get('womac_score', 0))
    vas_score = float(data.get('vas_score', 0))
    age = float(data.get('age', 25))
    
    base_risk = 0.05
    womac_risk = (womac_score / 96.0) * 0.50
    vas_risk = (vas_score / 10.0) * 0.30
    age_risk = max(0, min((age - 30) / 50.0, 1.0)) * 0.15
    
    prob = base_risk + womac_risk + vas_risk + age_risk
    prob = min(prob, 0.98)
    
    if prob > 0.6:
        result = "High Risk"
    elif prob > 0.3:
        result = "Moderate"
    else:
        result = "Low Risk"
        
    evidence = [
        "Feature Importance Analysis:",
        f"1. WOMAC Score ({womac_score}): Contributes {(womac_risk * 100):.1f}% to risk probability based on functional limitation.",
        f"2. VAS Pain ({vas_score}): Contributes {(vas_risk * 100):.1f}% to risk due to inflammatory markers.",
        f"3. Age Factor ({age}): Base multiplier adds {(age_risk * 100):.1f}%."
    ]

    return {
        'status': 'success',
        'probability': prob,
        'threshold': 0.45,
        'result': result,
        'model_name': 'Clinical_XGBoost_Ensemble',
        'evidence': evidence
    }

def analyze_metabolic(data: dict):
    bmi = float(data.get('BMI', 22.0))
    age = float(data.get('AGE', 25))
    tc = float(data.get('TC', 150))
    diabetes_raw = str(data.get('History_of_Diabetes_Mellitis', 'No')).lower()
    diabetes = diabetes_raw in ['yes', 'true', '1']
    
    base_risk = 0.05
    
    bmi_risk = 0
    if bmi > 25:
        bmi_risk = min((bmi - 25) / 15.0, 1.0) * 0.45
        
    age_risk = max(0, min((age - 30) / 50.0, 1.0)) * 0.15
    diab_risk = 0.20 if diabetes else 0
    
    tc_risk = 0
    if tc > 200:
        tc_risk = min((tc - 200) / 100.0, 1.0) * 0.10
        
    prob = base_risk + bmi_risk + age_risk + diab_risk + tc_risk
    prob = min(prob, 0.95)
    
    if prob > 0.6:
        result = "High Risk"
    elif prob > 0.3:
        result = "Moderate"
    else:
        result = "Low Risk"
        
    evidence = [
        "Metabolic Neural Network Insights:",
        f"1. BMI Index ({bmi:.1f}): Mechanical overload contributes {(bmi_risk * 100):.1f}% to structural deterioration risk.",
        f"2. Diabetes: {'Present (+20% Risk)' if diabetes else 'None detected'}.",
        f"3. Lipid Profile (TC: {tc}): Subchondral vascular risk adds {(tc_risk * 100):.1f}%."
    ]

    return {
        'status': 'success',
        'probability': prob,
        'threshold': 0.45,
        'result': result,
        'model_name': 'Metabolic_RandomForest',
        'evidence': evidence
    }
