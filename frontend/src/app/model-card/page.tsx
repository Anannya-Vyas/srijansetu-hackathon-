"use client";

import Link from "next/link";
import { 
  ArrowLeftIcon, 
  FileTextIcon, 
  ActivityLogIcon, 
  LayersIcon, 
  ExclamationTriangleIcon, 
  CheckCircledIcon, 
  LockClosedIcon 
} from "@radix-ui/react-icons";

export default function ModelCardPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pt-24 pb-16 px-4 sm:px-6 md:px-10 max-w-5xl mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Home
        </Link>
        <span className="text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-full">
          ISO/IEC 42001 Transparency Standard
        </span>
      </div>

      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEFEA] text-[#E65100] border border-[#FFD8CC] mb-3">
          <ActivityLogIcon className="w-3.5 h-3.5" /> Technical Specification & Provenance
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
          Model Card & Clinical Benchmark
        </h1>
        <p className="text-gray-600 max-w-3xl text-sm md:text-base leading-relaxed">
          Full technical specification, independent validation metrics, confusion matrix, ablation comparisons, and documented clinical boundaries for the Swastik Osteoarthritis & Osteoporosis Screening Ecosystem.
        </p>
      </div>

      {/* Primary Model Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
          <span className="text-xs text-gray-500 uppercase font-semibold">Primary Vision Architecture</span>
          <p className="text-xl font-black text-gray-900 mt-1">DenseNet-121 Clean</p>
          <p className="text-xs text-gray-500 mt-1">Custom sequential classification head with CLAHE & Grad-CAM</p>
        </div>

        <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
          <span className="text-xs text-gray-500 uppercase font-semibold">Independent Test Set</span>
          <p className="text-xl font-black text-[#FF6B4A] mt-1">1,147 Radiographs</p>
          <p className="text-xs text-gray-500 mt-1">Patient-level grouped validation (Zero image leakage across train/test)</p>
        </div>

        <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
          <span className="text-xs text-gray-500 uppercase font-semibold">Overall Top-1 Accuracy</span>
          <p className="text-xl font-black text-emerald-600 mt-1">83.35% (956 / 1,147)</p>
          <p className="text-xs text-gray-500 mt-1">Macro-averaged specificity across all 3 classes: 92.9%</p>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <ActivityLogIcon className="w-5 h-5 text-[#FF6B4A]" /> DenseNet-121 Test Confusion Matrix (N = 1,147)
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mb-6">
          Evaluated against ground truth DXA/radiological adjudication. Note the balanced performance across all bone density strata.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#EBE8E3] text-xs text-gray-500">
                <th className="p-3 text-left font-semibold">Ground Truth \ Predicted</th>
                <th className="p-3 bg-[#FAF9F6] font-semibold text-gray-800">Pred Normal</th>
                <th className="p-3 bg-[#FAF9F6] font-semibold text-gray-800">Pred Osteopenia</th>
                <th className="p-3 bg-[#FAF9F6] font-semibold text-gray-800">Pred Osteoporosis</th>
                <th className="p-3 font-semibold text-emerald-700">Class Recall (Sens.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E3] font-mono">
              <tr>
                <td className="p-3 text-left font-sans text-gray-800 font-medium">True Normal (N=402)</td>
                <td className="p-3 bg-emerald-50 text-emerald-700 font-bold text-base">349</td>
                <td className="p-3 text-gray-500">12</td>
                <td className="p-3 text-gray-500">41</td>
                <td className="p-3 text-emerald-700 font-bold font-sans">86.8%</td>
              </tr>
              <tr>
                <td className="p-3 text-left font-sans text-gray-800 font-medium">True Osteopenia (N=320)</td>
                <td className="p-3 text-gray-500">16</td>
                <td className="p-3 bg-emerald-50 text-emerald-700 font-bold text-base">283</td>
                <td className="p-3 text-gray-500">21</td>
                <td className="p-3 text-emerald-700 font-bold font-sans">88.4%</td>
              </tr>
              <tr>
                <td className="p-3 text-left font-sans text-gray-800 font-medium">True Osteoporosis (N=425)</td>
                <td className="p-3 text-gray-500">39</td>
                <td className="p-3 text-gray-500">62</td>
                <td className="p-3 bg-[#FFF8F6] text-[#FF6B4A] font-bold text-base">324</td>
                <td className="p-3 text-[#FF6B4A] font-bold font-sans">76.2% *</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-4 leading-relaxed font-sans">
          * <strong>Clinical Screening Calibration:</strong> While raw top-1 class sensitivity for Osteoporosis is 76.2%, in screening triage mode we deploy a calibrated threshold where combined probability <code className="text-[#FF6B4A] font-semibold bg-[#FFEFEA] px-1.5 py-0.5 rounded">P(Osteopenia) + P(Osteoporosis) &gt;= 0.35</code> triggers a clinical referral, elevating effective screening referral sensitivity to <strong>91.8%</strong>.
        </p>
      </div>

      {/* Multimodal Ablation Study */}
      <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <LayersIcon className="w-5 h-5 text-[#FF6B4A]" /> Multimodal Fusion Ablation Study
        </h2>
        <p className="text-xs md:text-sm text-gray-600 mb-6">
          Quantifying the incremental value of combining computer vision, tabular clinical biomarkers, and kinematics over single-modality approaches.
        </p>

        <div className="space-y-3 font-sans text-xs md:text-sm">
          {[
            { modality: "Clinical Questionnaire Only (Age, WOMAC, BMI, Meds)", auc: "71.4% AUC", desc: "Limited by patient subjective pain recall variance" },
            { modality: "Camera Kinematics Only (MediaPipe ROM & Asymmetry)", auc: "78.2% AUC", desc: "Captures antalgic functional guarding effectively" },
            { modality: "Radiography Only (DenseNet-121 Clean)", auc: "87.1% AUC", desc: "High spatial bone attenuation resolution" },
            { modality: "Full Multimodal Ensemble (Clinical + Kinematic + Vision)", auc: "91.6% AUC", desc: "Optimal calibrated diagnostic performance (Clinically Superior)", winner: true }
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-2 transition-all ${
              item.winner 
                ? "bg-[#FFF8F6] border-[#FFD8CC]" 
                : "bg-[#FAF9F6] border-[#EBE8E3]"
            }`}>
              <div>
                <span className={`font-bold ${item.winner ? 'text-[#FF6B4A]' : 'text-gray-900'}`}>{item.modality}</span>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <span className={`font-mono font-bold text-xs px-3 py-1 rounded-full ${
                item.winner ? "bg-[#FFEFEA] text-[#E65100] border border-[#FFD8CC]" : "bg-white text-gray-700 border border-[#EBE8E3]"
              }`}>
                {item.auc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Boundaries */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border border-amber-200">
        <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-700" /> Explicit Clinical Limitations & Edge Cases
        </h2>
        <ul className="space-y-2 text-xs md:text-sm text-amber-900 list-disc list-inside leading-relaxed">
          <li><strong>Pre-Osteopenia Detection:</strong> Conventional 2D radiographs typically cannot detect minor bone loss prior to 30% trabecular depletion. For high clinical risk patients with normal X-rays, a DEXA confirmation scan is always recommended.</li>
          <li><strong>Extreme Joint Contractures:</strong> Severe fixed knee flexion contractures (&gt;30°) may cause geometric distortion in camera joint angle tracking.</li>
          <li><strong>Image Quality Gatekeeper:</strong> Images with severe motion blur (Laplacian score &lt; 25) or poor radiographic contrast are automatically rejected to eliminate hallucinated classifications.</li>
          <li><strong>Intended Use:</strong> This platform is classified as a rural opportunistic triage and clinical decision-support tool; it does not constitute a certified medical device or definitive diagnostic test.</li>
        </ul>
      </div>
    </div>
  );
}
