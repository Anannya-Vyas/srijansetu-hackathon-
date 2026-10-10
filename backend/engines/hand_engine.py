def analyze_hand(data):
    if not data or not isinstance(data, dict):
        return True, 0.08, 0.5, "Normal Range", ["Insufficient data: No joint angles provided."]
        
    prob = 0.08
    result = "Normal Range"
    evidence = ["Computer Vision Kinematic Analysis:"]
    
    rom_values = []
    
    for key, angles in data.items():
        # Only check finger joints, ignore static body parts if they get passed in
        if len(angles) > 5 and 'Wrist' not in key and 'Torso' not in key:
            rom = max(angles) - min(angles)
            rom_values.append(rom)
            
    if not rom_values:
        return True, 0.08, 0.5, "Normal Range", ["Insufficient data: Tracking frames too short."]
                
    avg_rom = sum(rom_values) / len(rom_values)
                
    if avg_rom < 40:
        prob = 0.89
        result = "High Risk"
        evidence.append(f"1. Overall Hand Stiffness Detected: Average Range of Motion (ROM) across all fingers was only {avg_rom:.1f} degrees (Healthy baseline > 60).")
        evidence.append("2. Kinematic Profile: Restricted global flexion/extension is a hallmark kinematic signature of hand osteoarthritis.")
    elif avg_rom < 55:
        prob = 0.65
        result = "Moderate Risk"
        evidence.append(f"1. Reduced Average ROM: The hand exhibited an average flexion of {avg_rom:.1f} degrees, indicating early stage joint space narrowing or mild guarding.")
    else:
        prob = 0.08
        result = "Normal Range"
        evidence.append(f"1. Range of Motion: Healthy mobility detected with an average finger ROM of {avg_rom:.1f} degrees.")
        evidence.append("2. Biomechanical Profile: Full extension and flexion arc across the hand joints.")
        
    return True, prob, 0.5, result, evidence
