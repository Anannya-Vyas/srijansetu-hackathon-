# 🏥 Product Narrative & Functional UI Prompt: Swastik Healthcare

> **How to use this prompt**:  
> Copy and paste the text below directly into your AI design tool (e.g. v0.dev, Bolt.new, Lovable, Claude Artifacts, or give it to your UI designer). It describes the **complete product story, clinical logic, user workflows, and features** without any rigid color or CSS constraints, allowing the AI to design a modern, world-class UI.

---

```text
Build a comprehensive, modern, clinical-grade web application for "Swastik Healthcare" — an opportunistic, hardware-free clinical triage platform for Osteoarthritis (joint health) and Osteoporosis (bone density).

The platform requires no specialized sensors, no wearable devices, and no expensive scanners. It runs entirely on a phone camera and a standard web browser, making musculoskeletal screening accessible to rural clinics, community health workers, and urban diagnostic centers.

You have full creative freedom over the visual styling, theme, typography, and aesthetic. Design a clean, premium, high-trust healthcare interface with intuitive layouts, polished cards, clear data visualizations, and accessible navigation.

---

### Core Concept & User Personas

1. The Rural Patient: Needs simple, jargon-free explanations (e.g., "Your bone structural age is 79 years compared to your actual age of 67") and clear next steps.
2. The Frontline Health Worker (ASHA / ANM): Runs rural screening camps in villages, needs a fast queue to screen patient after patient, see clear triage priority levels (Low, Moderate, High), and export batches of high-risk patients for hospital referral.
3. The Clinician / Orthopedist: Needs transparent medical evidence, Explainable AI attention heatmaps on X-rays, probability distributions, WHO diagnostic guidelines, and a quick "Agree/Disagree" feedback loop.
4. The District Health Officer (Public Health Official): Needs a high-level surveillance dashboard showing musculoskeletal risk by district to allocate mobile screening vans and resources effectively.

---

### Key Workflows & Pages to Build

#### 1. Home / Landing Page ('/')
- Hero Story: Introduce the mission — opportunistic musculoskeletal screening with zero extra hardware, turning any phone camera and browser into a clinical triage tool.
- Clear Navigation: Separate pathways to start an Osteoarthritis screen (movement analysis) or an Osteoporosis screen (radiograph analysis).
- Fast-Track Demo Launcher: 3 clickable sample patient cards that instantly pre-fill realistic clinical profiles so anyone can demo the entire system without typing:
  * Case A (High Risk): Elderly patient with severe trabecular bone loss and knee joint degeneration (Immediate hospital referral).
  * Case B (Borderline): Middle-aged patient with early osteopenia and joint stiffness (Lifestyle & Vit-D intervention plan).
  * Case C (Healthy Baseline): Normal healthy control with preserved bone density.
- Quick links to the sub-portals: ASHA Worker Camp Queue, Public Health Command, Lifestyle Simulator, Model Card, and Ethical AI Governance.
- Patient Intake Modal: Quick registration collecting Patient Name, ID/MRN, Age, and Gender.

#### 2. Live Camera Kinematics Lab ('/screening/camera?joint=knee|hip|shoulder|hand|spine')
- Purpose: Patient performs guided physical movements in front of their webcam/phone camera to measure joint range of motion (ROM) and bilateral asymmetry.
- Video Area: Displays the live camera stream with an overlaid transparent canvas that renders real-time skeletal joint landmarks and tracking connections.
- Guided Step-by-Step Flow:
  * Shows step progress (e.g., Step 1: Walking Gait Test -> Step 2: Squat Assessment).
  * Large, clear physical exercise instructions with voice-guidance capability.
  * 3-second animated countdown before recording starts.
  * Active recording indicator with real-time frame capture counter.
  * Completion overlay when the movement test finishes.
- Safety & Demo Fallback: A visible "Test with Simulated Motion" button so the assessment can always be tested even if physical camera permissions are restricted.
- Supported Joint Tests: Knee (gait & squats), Hip (lateral flexion & gait excursion), Shoulder (bilateral overhead reach & single arm raise), Hand (finger flexion & thumb opposition), Spine (forward bending & lateral side bend).

#### 3. Osteoporosis Radiograph Intake ('/screening/osteoporosis/xray')
- Upload Area: Clean drag-and-drop zone for knee or hip X-ray images (JPEG/PNG/DICOM).
- Built-in Image Quality Gatekeeper:
  * Evaluates uploaded radiographs for severe motion blur, low contrast, or pitch-black/washed-out inputs.
  * If a blurry image is uploaded, displays a prominent clinical alert explaining why the image was rejected to protect diagnostic safety and prevent AI hallucinations.
- Preview card with option to remove or re-upload, followed by an analyze action button.

#### 4. Clinical Assessment Results ('/screening/osteoporosis/results')
- Patient Summary Banner: Patient name, ID, age, and screening date.
- Multimodal Synthesis Card: Combines clinical questionnaire risk factors with radiographic bone loss into a unified triage tier (Low Risk, Moderate, High Risk).
- Bone Health Age Callout: Shows the patient's actual chronological age alongside their estimated "Bone Structural Age" (e.g., "Actual: 67 years | Bone Age: 79 years — 12 years premature aging").
- Discordance Callout: If clinical symptoms are severe but the 2D X-ray appears early-stage, shows an educational note explaining that plain radiographs often miss bone loss until 30-50% mineral depletion occurs.
- Explainable AI (Grad-CAM) Heatmap Viewer:
  * Shows the X-ray with an interactive toggle button: "Attention Heatmap" vs. "Plain Radiograph".
  * The heatmap highlights exactly which condylar and trabecular bone regions showed bone thinning.
- Probability Distribution: Clean progress bars showing class probabilities (Normal, Osteopenia, Osteoporosis).
- Clinician Review & Feedback: Quick "Agree" / "Disagree" buttons allowing attending doctors to validate the assessment for active learning.
- Dynamic Referral Slip & QR Code: A printable referral section with a generated QR code that a doctor can scan with their phone to view the patient's digital record.
- Nearest DEXA Diagnostic Centre Finder: A modal directory showing nearby verified tertiary hospitals (with contact numbers, scan costs, and wait times) so high-risk patients have an immediate referral pathway.

#### 5. Public Health Heatmap & Camp Command ('/dashboard')
- Tab 1: District Risk Heatmap
  * Surveillance table/cards covering multiple districts with screened volume, osteoporosis rate %, and knee OA burden %.
  * High-priority districts trigger an automated recommendation for mobile screening van deployment.
  * Labeled as simulated epidemiological data for demonstration.
- Tab 2: Screening Camp Mode
  * Active rural camp profile (Primary Health Centre location, supervising doctor).
  * Printable Camp Poster QR Code: Modal displaying a printable poster with a large QR code for walk-in patient registration.
  * End-of-Day Summary Report: Daily totals showing total screened, high-risk red referrals, moderate interventions, and estimated community healthcare cost savings.
- Tab 3: Health Economics & DEXA Triage Model
  * Strategic positioning: Explains that Swastik acts as an upstream pre-screening triage sieve to protect scarce hospital DEXA scanners rather than replacing them.
  * 3-Strategy Comparison Table (per 1,000 citizens):
    1. Universal DEXA: Huge cost (₹25 Lakhs), 5-month hospital waitlists.
    2. Swastik 2-Stage Triage: Pre-screen for ₹0, refer only 28% high-risk cases to DEXA. Total cost ₹7 Lakhs, saving 72% (₹18 Lakhs saved per 1,000 citizens).
    3. Status Quo / Do Nothing: High cost of emergency fracture hospitalizations.

#### 6. Community Health Worker Queue ('/screening/worker-queue')
- Designed for frontline ASHA/ANM workers in village camps.
- KPI summary counters: Total Screened Today, Red (Immediate Referral), Yellow (Moderate Follow-up), Green (Healthy).
- Filterable patient list with color-coded triage tags.
- Action Button: One-click "Export Red Referral Batch" to download a CSV list of critical patients to send to the district hospital.

#### 7. What-If Lifestyle Simulator ('/screening/lifestyle-simulator')
- An educational interactive simulator modeling the WHO FRAX guidelines.
- Modifiable Sliders:
  * Daily Dietary Calcium Intake (300 to 1,500 mg/day).
  * Sunlight / Vitamin D3 Exposure (0 to 60 mins/day).
  * Weight-bearing & Resistance Exercise (0 to 7 days/week).
  * Active Tobacco / Smoking toggle.
- Live Prognostic Gauge:
  * Watch the 5-Year Fracture Risk percentage drop as positive habits are adjusted.
  * Real-time Bone Health Age rejuvenation counter (e.g., potential biological rejuvenation: -6 years).

#### 8. Transparent Model Card & Metrics ('/model-card')
- High-trust technical transparency page:
  * DenseNet-121 architecture details and patient-level validation (N=1,147 test set).
  * Interactive Confusion Matrix table showing predictions across Normal, Osteopenia, and Osteoporosis.
  * Multimodal Ablation Study showing performance gain from questionnaire-only (71.4% AUC) to full ensemble (91.6% AUC).
  * Documented clinical limitations and safety boundaries.

#### 9. Ethical AI, Privacy & Governance ('/ethical-ai')
- Explains the 4 ethical pillars:
  1. Demographic Fairness: Audited gender parity (equal sensitivity between male and female cohorts).
  2. Zero-Retention Ephemeral Privacy: Video and imagery processed in volatile memory with instant deletion post-inference (DPDP Act compliant).
  3. Human-in-the-Loop Principle: AI as clinical decision support, preserving doctor agency.
  4. Explainability: Visual verification via Grad-CAM heatmaps.
- Academic Rigor: Citation of peer-reviewed manuscript submission (IEEE EMBC / ACM CHIL 2026) and link to open-source repository.

---

Create fully functional, beautifully styled, responsive pages with smooth transitions between views and consistent navigation.
```
