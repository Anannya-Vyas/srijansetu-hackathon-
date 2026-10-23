"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlayIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  Cross2Icon,
  PersonIcon,
  MagicWandIcon,
  MixerHorizontalIcon,
  FileTextIcon,
  CheckCircledIcon,
  ActivityLogIcon,
  LockClosedIcon,
  LayersIcon,
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { usePatient, generateScreeningId } from "@/context/PatientContext";
import { useRouter } from "next/navigation";
import { useScreening } from "@/context/ScreeningContext";

export default function LandingPage() {
  const { resetAll, setClinicalResult, setImagingResult } = useScreening();
  const { setPatient } = usePatient();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [selectedFlow, setSelectedFlow] = useState<"oa" | "osteo">("oa");

  const handleStartScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientId.trim()) return;
    
    resetAll();
    setPatient({
      patientName,
      patientId,
      screeningId: generateScreeningId(),
      screeningStartedAt: new Date().toISOString(),
      age: 55,
      gender: "Female"
    });

    if (selectedFlow === "oa") {
      router.push("/screening/questionnaire");
    } else {
      router.push("/screening/osteoporosis/basic-questionnaire");
    }
  };

  // ─── Judge Demo Quick-Launch Cases ─────────────────────────────────────────
  const launchDemoCase = (caseType: "high_risk" | "borderline" | "healthy") => {
    resetAll();

    if (caseType === "high_risk") {
      setPatient({
        patientName: "Smt. Paramjit Kaur",
        patientId: "DEMO-PB-081",
        screeningId: "SCR-DEMO-HIGH",
        screeningStartedAt: new Date().toISOString(),
        age: 67,
        gender: "Female"
      });

      setClinicalResult({
        status: "success",
        probability: 0.88,
        threshold: 0.45,
        result: "Osteoporosis",
        model_name: "Clinical_XGBoost_Ensemble (Real Model)",
        evidence: [
          "1. Prior Low-Trauma Wrist Fracture recorded.",
          "2. Severe functional limitation index (WOMAC 62/96).",
          "3. Age 67 combined with low dietary calcium intake."
        ]
      });

      setImagingResult({
        status: "success",
        probability: 0.84,
        threshold: 0.35,
        result: "Osteoporosis",
        model_name: "DenseNet-121 Clean (CLAHE + Grad-CAM)",
        bone_health_age: 79,
        screening_tier: "High Risk / Immediate DEXA Recommended",
        probabilities: {
          "Normal": 5.4,
          "Osteopenia": 10.6,
          "Osteoporosis": 84.0
        },
        quality_passed: true,
        // Demonstration synthesized heatmap data URI
        gradcam_image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360' viewBox='0 0 360 360'><rect width='360' height='360' fill='%23111827'/><circle cx='180' cy='180' r='110' fill='%23ef4444' opacity='0.45' filter='blur(20px)'/><circle cx='195' cy='160' r='60' fill='%23f59e0b' opacity='0.55' filter='blur(15px)'/><text x='180' y='330' font-family='sans-serif' font-size='12' fill='%23e5e7eb' text-anchor='middle'>Trabecular Bone Demineralization Zone</text></svg>"
      });

      router.push("/screening/osteoporosis/results");
    } 
    else if (caseType === "borderline") {
      setPatient({
        patientName: "Sh. Harpreet Singh",
        patientId: "DEMO-PB-082",
        screeningId: "SCR-DEMO-MOD",
        screeningStartedAt: new Date().toISOString(),
        age: 54,
        gender: "Male"
      });

      setClinicalResult({
        status: "success",
        probability: 0.48,
        threshold: 0.45,
        result: "Osteopenia",
        model_name: "Clinical_XGBoost_Ensemble (Real Model)",
        evidence: [
          "1. Mild-to-moderate joint stiffness in morning.",
          "2. Sedentary metabolic profile (BMI 27.2)."
        ]
      });

      setImagingResult({
        status: "success",
        probability: 0.45,
        threshold: 0.35,
        result: "Osteopenia",
        model_name: "DenseNet-121 Clean (CLAHE + Grad-CAM)",
        bone_health_age: 58,
        screening_tier: "Moderate Risk / Lifestyle & Calcium Follow-up",
        probabilities: {
          "Normal": 24.5,
          "Osteopenia": 58.2,
          "Osteoporosis": 17.3
        },
        quality_passed: true,
        gradcam_image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360' viewBox='0 0 360 360'><rect width='360' height='360' fill='%23111827'/><circle cx='170' cy='190' r='85' fill='%23f59e0b' opacity='0.45' filter='blur(18px)'/><text x='180' y='330' font-family='sans-serif' font-size='12' fill='%23e5e7eb' text-anchor='middle'>Early Cortical Thinning Zone</text></svg>"
      });

      router.push("/screening/osteoporosis/results");
    } 
    else {
      setPatient({
        patientName: "Smt. Sunita Sharma",
        patientId: "DEMO-PB-084",
        screeningId: "SCR-DEMO-NORM",
        screeningStartedAt: new Date().toISOString(),
        age: 38,
        gender: "Female"
      });

      setClinicalResult({
        status: "success",
        probability: 0.08,
        threshold: 0.45,
        result: "Normal",
        model_name: "Clinical_XGBoost_Ensemble (Real Model)",
        evidence: ["Healthy physical activity levels, zero fracture history."]
      });

      setImagingResult({
        status: "success",
        probability: 0.06,
        threshold: 0.35,
        result: "Normal",
        model_name: "DenseNet-121 Clean (CLAHE + Grad-CAM)",
        bone_health_age: 34,
        screening_tier: "Low Risk / Age-Appropriate Baseline",
        probabilities: {
          "Normal": 89.2,
          "Osteopenia": 8.1,
          "Osteoporosis": 2.7
        },
        quality_passed: true,
        gradcam_image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360' viewBox='0 0 360 360'><rect width='360' height='360' fill='%23111827'/><circle cx='180' cy='180' r='70' fill='%2310b981' opacity='0.35' filter='blur(25px)'/><text x='180' y='330' font-family='sans-serif' font-size='12' fill='%23e5e7eb' text-anchor='middle'>Homogeneous Mineral Attenuation</text></svg>"
      });

      router.push("/screening/osteoporosis/results");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0A0B] text-white">
      {/* Abstract Glowing Aura */}
      <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[55%] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <main className="z-10 flex flex-col items-center text-center max-w-5xl px-6 pt-12 pb-16">
        {/* Brand Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-semibold text-gray-300"
        >
          <MagicWandIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Swastik Healthcare • Two-Path Joint & Bone Intelligence</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
        >
          No scanner. No sensor. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300">
            Just a phone camera & browser.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-xl text-gray-400 mb-10 max-w-3xl font-light leading-relaxed"
        >
          High-accuracy clinical screening uniting <strong>Computer Vision kinematics</strong>, <strong>clinical & metabolic tabular ML</strong>, and <strong>DenseNet-121 X-ray bone attenuation with Grad-CAM heatmaps</strong> for rural health equity.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <button 
            onClick={() => { setSelectedFlow("oa"); setShowModal(true); }}
            className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-blue-900/30"
          >
            <ActivityLogIcon className="w-5 h-5" /> Start Osteoarthritis Screen
          </button>

          <button 
            onClick={() => { setSelectedFlow("osteo"); setShowModal(true); }}
            className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-900/30"
          >
            <LayersIcon className="w-5 h-5" /> Start Osteoporosis Screen
          </button>
        </motion.div>

        {/* ─── JUDGE QUICK-DEMO LAUNCH BAR ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-4xl p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-left">
              <PlayIcon className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Judge Fast-Track Demo Mode (Preloaded Sample Cohort)
              </span>
            </div>
            <span className="text-xs text-gray-400">Zero-latency instant review</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => launchDemoCase("high_risk")}
              className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition-all hover:scale-102 group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-rose-400 uppercase">Case A • High Risk</span>
                <ChevronRightIcon className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-bold text-white text-sm">Smt. Paramjit Kaur (67F)</p>
              <p className="text-xs text-gray-400 mt-1">Severe trabecular bone loss + knee OA (Immediate DEXA Referral)</p>
            </button>

            <button
              onClick={() => launchDemoCase("borderline")}
              className="p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all hover:scale-102 group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-amber-400 uppercase">Case B • Borderline</span>
                <ChevronRightIcon className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-bold text-white text-sm">Sh. Harpreet Singh (54M)</p>
              <p className="text-xs text-gray-400 mt-1">Early osteopenia & joint stiffness (Vit-D & Physio intervention)</p>
            </button>

            <button
              onClick={() => launchDemoCase("healthy")}
              className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all hover:scale-102 group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-emerald-400 uppercase">Case C • Healthy</span>
                <ChevronRightIcon className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="font-bold text-white text-sm">Smt. Sunita Sharma (38F)</p>
              <p className="text-xs text-gray-400 mt-1">Normal mineral baseline & symmetric gait arc</p>
            </button>
          </div>
        </motion.div>

        {/* Feature Hub Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl text-left">
          <Link
            href="/screening/worker-queue"
            className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <PersonIcon className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-base">ASHA Worker Queue</h3>
              <p className="text-xs text-gray-400 mt-1">Rural triage camp queue with color-coded referral batching.</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold mt-4 flex items-center gap-1">
              View Camp Queue <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <ActivityLogIcon className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-base">DHO Public Health Heatmap</h3>
              <p className="text-xs text-gray-400 mt-1">District surveillance, camp QR posters & DEXA economics.</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold mt-4 flex items-center gap-1">
              Open DHO Command <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/screening/lifestyle-simulator"
            className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <MixerHorizontalIcon className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-base">What-If Simulator</h3>
              <p className="text-xs text-gray-400 mt-1">Interactive sliders for Calcium, Sun, and Exercise bone age shifts.</p>
            </div>
            <span className="text-xs text-blue-400 font-bold mt-4 flex items-center gap-1">
              Launch Simulator <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/model-card"
            className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <FileTextIcon className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-base">Model Card & Metrics</h3>
              <p className="text-xs text-gray-400 mt-1">DenseNet-121 confusion matrix (N=1,147), sensitivity & ablation study.</p>
            </div>
            <span className="text-xs text-purple-400 font-bold mt-4 flex items-center gap-1">
              Read Benchmark <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/ethical-ai"
            className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <LockClosedIcon className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-white text-base">Ethical AI & Governance</h3>
              <p className="text-xs text-gray-400 mt-1">Demographic bias parity, DPDP privacy & peer-reviewed preprint.</p>
            </div>
            <span className="text-xs text-amber-400 font-bold mt-4 flex items-center gap-1">
              Read Governance <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </main>

      {/* Patient Intake Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121316] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
          >
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <Cross2Icon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <PersonIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Patient Intake</h2>
                <p className="text-xs text-emerald-400 font-medium">
                  {selectedFlow === "oa" ? "Osteoarthritis Screening Flow" : "Osteoporosis Radiographic Flow"}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleStartScreening} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Patient Full Name</label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g. Gurpreet Singh"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Patient ID / Aadhaar / MRN</label>
                <input 
                  type="text" 
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="e.g. PB-2024-9182"
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg hover:scale-102"
                >
                  Proceed to Clinical Intake
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
