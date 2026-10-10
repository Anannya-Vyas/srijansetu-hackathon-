# Swastik: Decentralized Osteoporosis Screening for Remote Healthcare

<p align="center">
  <img src="frontend/public/logo.png" alt="Swastik Logo" width="150"/>
</p>

## ?? The Story & Vision

In many remote and rural areas, access to specialized doctors and expensive diagnostic equipment like DEXA scanners is virtually non-existent. **Swastik** was built to bridge this massive healthcare gap. 

This platform is specifically engineered for **remote area dispensary technicians** and frontline health workers. It empowers them to perform highly accurate osteoporosis screenings and identify vulnerable patients—even in the complete absence of a specialized doctor. 

Because the application is **100% hardware-independent**, technicians can take this platform door-to-door on any standard device (like a tablet or smartphone). They can conduct on-the-ground surveys, maintain proper medication records, and identify at-risk individuals who need immediate medical intervention. 

Crucially, when expensive DEXA scans aren't available, Swastik uses a powerful **AI-driven Non-DEXA branch**. By seamlessly fusing a patient's basic clinical profile with a deep learning X-Ray analysis (via a ResNet18 5-Fold Ensemble), the platform delivers a highly robust, ensembled diagnosis without requiring state-of-the-art medical hardware.

---

## ?? Key Features
- **Door-to-Door Accessibility:** Fully hardware-independent, allowing frontline workers to screen patients anywhere.
- **Dual-Branch AI Pipeline:**
  - **DEXA Available:** Uses a comprehensive XGBoost clinical model for precision analysis.
  - **DEXA Unavailable:** Ensembles a basic clinical profile with a deep learning X-Ray analysis.
- **Automated Double-Leg Detection:** Smartly detects double-knee X-rays, splits them, analyzes both independently, and averages the tensors.
- **Patient Tracking:** Allows technicians to track vulnerable patients and mint immutable PDF reports.

## ?? Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS
- **Backend:** FastAPI (Python), PyTorch, XGBoost, Scikit-learn
- **ML Architectures:** ResNet18 (Ensembled), XGBoost, Random Forest

## ?? Running Locally

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000
```
