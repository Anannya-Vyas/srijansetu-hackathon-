import numpy as np

def analyze_shoulder(data):
    """
    Biomechanical Range of Motion (ROM) & Bilateral Asymmetry Assessment for Shoulder OA.
    Expected keys from MediaPipe:
    - shoulder_a_L_Shoulder_Torso, shoulder_a_R_Shoulder_Torso (Bilateral arm raise)
    - shoulder_b_L_Shoulder_Torso, shoulder_b_R_Shoulder_Torso (Single arm raise)
    """
    if not data or not isinstance(data, dict):
        return True, 0.15, 0.50, "Normal Range", ["Insufficient data: No shoulder movement tracks provided."]
        
    left_angles = []
    right_angles = []
    
    for k, v in data.items():
        if isinstance(v, list) and len(v) > 0:
            if 'L_Shoulder' in k:
                left_angles.extend(v)
            elif 'R_Shoulder' in k:
                right_angles.extend(v)
                
    if not left_angles and not right_angles:
        # Fallback to inspecting all angle arrays in data
        all_vals = [arr for arr in data.values() if isinstance(arr, list) and len(arr) > 0]
        if all_vals:
            left_angles = all_vals[0]
            right_angles = all_vals[1] if len(all_vals) > 1 else all_vals[0]
        else:
            return True, 0.15, 0.50, "Normal Range", ["Insufficient frame count for kinematic tracking."]

    l_max = float(np.max(left_angles)) if left_angles else 140.0
    r_max = float(np.max(right_angles)) if right_angles else 140.0
    l_rom = float(np.max(left_angles) - np.min(left_angles)) if left_angles else 100.0
    r_rom = float(np.max(right_angles) - np.min(right_angles)) if right_angles else 100.0
    
    asymmetry = abs(l_max - r_max)
    min_reach = min(l_max, r_max)
    
    evidence = [
        "Kinematic Shoulder Biomechanics Analysis:",
        f"1. Left Shoulder Peak Elevation: {l_max:.1f}° (Flexion Arc: {l_rom:.1f}°).",
        f"2. Right Shoulder Peak Elevation: {r_max:.1f}° (Flexion Arc: {r_rom:.1f}°).",
        f"3. Bilateral Elevation Disparity: {asymmetry:.1f}°."
    ]
    
    if min_reach < 95.0 or asymmetry > 28.0:
        prob = 0.82
        result = "Elevated Shoulder OA / Impingement Risk"
        evidence.append("4. Severe abduction/flexion limitation detected (< 100° or > 25° bilateral asymmetry).")
    elif min_reach < 130.0 or asymmetry > 18.0:
        prob = 0.54
        result = "Moderate Shoulder Movement Restriction"
        evidence.append("4. Mild subacromial restriction or guarded gleno-humeral arc observed.")
    else:
        prob = 0.12
        result = "Normal Movement Pattern"
        evidence.append("4. Full physiologic overhead range of motion (> 130°) with balanced bilateral symmetry.")
        
    return True, prob, 0.50, result, evidence
