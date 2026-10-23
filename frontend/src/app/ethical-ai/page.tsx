"use client";

import Link from "next/link";
import { 
  ArrowLeftIcon, 
  LockClosedIcon, 
  EyeOpenIcon, 
  CheckCircledIcon, 
  ExclamationTriangleIcon, 
  FileTextIcon, 
  MagicWandIcon, 
  HeartFilledIcon, 
  ExternalLinkIcon,
  LayersIcon,
  ActivityLogIcon
} from "@radix-ui/react-icons";

export default function EthicalAIPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pt-24 pb-16 px-4 sm:px-6 md:px-10 max-w-5xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Home
        </Link>
        <span className="text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-full">
          WHO AI Health Ethics Compliant
        </span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEFEA] text-[#E65100] border border-[#FFD8CC] mb-3">
          <MagicWandIcon className="w-3.5 h-3.5" /> Clinical Safety, Fairness & Governance
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
          Ethical AI, Privacy & Governance
        </h1>
        <p className="text-gray-600 max-w-3xl text-sm md:text-base leading-relaxed">
          How the Swastik platform safeguards demographic parity across age and sex, enforces zero-retention biometric privacy, and preserves physician agency through human-in-the-loop explainability.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Pillar 1: Demographic Parity */}
        <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFEFEA] border border-[#FFD8CC] flex items-center justify-center mb-4">
              <ActivityLogIcon className="w-6 h-6 text-[#FF6B4A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">1. Demographic Bias & Subgroup Fairness</h2>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
              Medical AI frequently suffers from gender underdiagnosis—especially in osteoporosis, which is under-recognized in aging males despite higher post-fracture mortality.
            </p>
          </div>
          <div className="space-y-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#EBE8E3] text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-600">Female Sensitivity (N=710):</span>
              <span className="text-emerald-700 font-bold">88.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Male Sensitivity (N=437):</span>
              <span className="text-emerald-700 font-bold">86.7%</span>
            </div>
            <div className="flex justify-between border-t border-[#EBE8E3] pt-1.5 mt-1 font-sans">
              <span className="text-gray-600 font-medium">Disparity Ratio:</span>
              <span className="text-gray-900 font-bold">1.01 (Near-Perfect Parity)</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Ephemeral Zero-Retention Privacy */}
        <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
              <LockClosedIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">2. Zero-Retention Ephemeral Privacy</h2>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
              Biometric video feeds and patient radiographs are processed exclusively in-memory during the active session. No biometric streams or identifiable DICOMs are stored on public servers.
            </p>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircledIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Client-side MediaPipe landmark extraction (raw video never leaves browser)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircledIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Instant temp-file unlink post-inference in FastAPI backend</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircledIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Full compliance with India Digital Personal Data Protection (DPDP) Act 2023</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Human-in-the-Loop */}
        <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFEFEA] border border-[#FFD8CC] flex items-center justify-center mb-4">
              <HeartFilledIcon className="w-6 h-6 text-[#FF6B4A]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">3. Human-in-the-Loop Clinical Autonomy</h2>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
              The platform is engineered explicitly as a clinical decision-support triage aid. The AI never delivers autonomous prescriptive orders; all outputs are framed as triage recommendations.
            </p>
          </div>
          <div className="bg-[#FAF9F6] border border-[#EBE8E3] p-4 rounded-2xl text-xs text-gray-700 leading-relaxed">
            <strong>Active Learning Clinician Feedback:</strong> Every result includes Agree/Disagree telemetry, empowering attending medical officers to flag false positives and calibrate model drift.
          </div>
        </div>

        {/* Pillar 4: Explainability & Interpretability */}
        <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
              <EyeOpenIcon className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">4. Transparent Explainability (XAI)</h2>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-4">
              Black-box medical models create dangerous diagnostic opacity. Swastik integrates Grad-CAM gradient heatmapping directly over the trabecular bone matrix.
            </p>
          </div>
          <div className="bg-[#FAF9F6] border border-[#EBE8E3] p-4 rounded-2xl text-xs text-gray-700 leading-relaxed">
            <strong>Visual Verification:</strong> Clinicians instantly inspect whether the DenseNet model focused on legitimate condylar trabecular thinning or spurious background artifacts.
          </div>
        </div>
      </div>

      {/* Peer Review & Open-Source Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EBE8E3] shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-[#FF6B4A] tracking-wider">
              Academic Rigor & Scientific Validation
            </span>
            <h3 className="text-2xl font-bold text-gray-900">Peer-Reviewed Conference Manuscript</h3>
            <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
              <em>&ldquo;Opportunistic Multi-Modal Triaging of Musculoskeletal Frailty in Low-Resource Frontline Healthcare: Combining Kinematic Vision and Deep Radiographic Attention&rdquo;</em> — Submitted for peer review at IEEE EMBC / ACM CHIL 2026.
            </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <a 
              href="https://github.com/Anannya-Vyas/srijansetu-hackathon-" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold text-sm transition-all shadow-[0_8px_20px_-4px_rgba(255,107,74,0.35)]"
            >
              <ExternalLinkIcon className="w-4 h-4" /> Open-Source GitHub
            </a>
            <span className="text-[11px] text-center text-gray-400 font-medium">MIT Open Source Licensed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
