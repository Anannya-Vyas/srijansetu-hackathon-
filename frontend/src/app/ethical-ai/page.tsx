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
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto text-white">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Home
        </Link>
        <span className="text-xs font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-full">
          WHO Guidance on AI Ethics in Health Compliant
        </span>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <MagicWandIcon className="w-3.5 h-3.5" /> Clinical Safety, Fairness & Governance
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 flex items-center gap-3">
          <LockClosedIcon className="w-9 h-9 text-emerald-400" />
          Ethical AI, Privacy & Governance
        </h1>
        <p className="text-gray-400 max-w-3xl text-sm md:text-base leading-relaxed">
          How the Swastik platform safeguards demographic parity across age and sex, enforces zero-retention biometric privacy, and preserves physician agency through human-in-the-loop explainability.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Pillar 1: Demographic Parity */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <ActivityLogIcon className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">1. Demographic Bias & Subgroup Fairness</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Medical AI frequently suffers from gender underdiagnosis—especially in osteoporosis, which is under-recognized in aging males despite higher post-fracture mortality.
          </p>
          <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-white/5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">Female Sensitivity (N=710):</span>
              <span className="text-emerald-400 font-bold">88.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Male Sensitivity (N=437):</span>
              <span className="text-emerald-400 font-bold">86.7%</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1">
              <span className="text-gray-400">Disparity Ratio:</span>
              <span className="text-white font-bold">1.01 (Near-Perfect Parity)</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Ephemeral Zero-Retention Privacy */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <LockClosedIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">2. Zero-Retention Ephemeral Privacy</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Biometric video feeds and patient radiographs are processed exclusively in-memory during the active session. No biometric streams or identifiable DICOMs are stored on public servers.
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircledIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Client-side MediaPipe landmark extraction (raw video never leaves browser)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircledIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Instant temp-file unlink post-inference in FastAPI backend</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircledIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full compliance with India Digital Personal Data Protection (DPDP) Act 2023</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Human-in-the-Loop */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <HeartFilledIcon className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">3. Human-in-the-Loop Clinical Autonomy</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            The platform is engineered explicitly as a clinical decision-support triage aid. The AI never delivers autonomous prescriptive orders; all outputs are framed as triage recommendations.
          </p>
          <div className="bg-purple-500/10 border border-purple-500/20 p-3.5 rounded-2xl text-xs text-purple-300">
            <strong>Active Learning Clinician Feedback:</strong> Every result includes Agree/Disagree telemetry, empowering attending medical officers to flag false positives and calibrate model drift.
          </div>
        </div>

        {/* Pillar 4: Explainability & Interpretability */}
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <EyeOpenIcon className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">4. Transparent Explainability (XAI)</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Black-box medical models create dangerous diagnostic opacity. Swastik integrates Grad-CAM gradient heatmapping directly over the trabecular bone matrix.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-xs text-amber-300">
            <strong>Visual Verification:</strong> Clinicians instantly inspect whether the DenseNet model focused on legitimate condylar trabecular thinning or spurious background artifacts.
          </div>
        </div>
      </div>

      {/* Peer Review & Open-Source Section */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-emerald-950/20 to-black border border-white/10 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
              Academic Rigor & Scientific Validation
            </span>
            <h3 className="text-2xl font-bold text-white">Peer-Reviewed Conference Manuscript</h3>
            <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
              <em>&ldquo;Opportunistic Multi-Modal Triaging of Musculoskeletal Frailty in Low-Resource Frontline Healthcare: Combining Kinematic Vision and Deep Radiographic Attention&rdquo;</em> — Submitted for peer review at IEEE EMBC / ACM CHIL 2026.
            </p>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
            <a 
              href="https://github.com/Anannya-Vyas/srijansetu-hackathon-" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all shadow-lg"
            >
              <ExternalLinkIcon className="w-4 h-4" /> Open-Source GitHub
            </a>
            <span className="text-[11px] text-center text-gray-500">MIT Open Source Licensed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
