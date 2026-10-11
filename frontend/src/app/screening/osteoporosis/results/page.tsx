"use client";

import { useScreening } from "@/context/ScreeningContext";
import { usePatient } from "@/context/PatientContext";
import { useRouter } from "next/navigation";
import { Activity, Bone, ArrowLeft, Home, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OsteoporosisResults() {
  const { clinicalResult, imagingResult } = useScreening();
  const { patient } = usePatient();
  const router = useRouter();

  if (!clinicalResult && !imagingResult) {
    return <div className="text-white text-center mt-20">No results available. <Link href="/" className="text-emerald-500 ml-2">Go Home</Link></div>;
  }

  // Calculate true risk probabilities
  const clinicalRisk = clinicalResult ? clinicalResult.probability : 0;
  const imagingRisk = imagingResult ? imagingResult.probability : 0;

  // Weighted multimodal risk score (50% clinical markers + 50% imaging indicators)
  const combinedRisk = (clinicalResult && imagingResult)
    ? (clinicalRisk + imagingRisk) / 2
    : (clinicalResult ? clinicalRisk : imagingRisk);

  const isHighRisk = combinedRisk >= 0.50;
  const isDiscordant = clinicalResult && imagingResult && 
    ((clinicalResult.result === "Osteoporosis" && imagingResult.result === "Normal") ||
     (clinicalResult.result === "Normal" && imagingResult.result === "Osteoporosis"));

  const clinicalLabel = clinicalResult?.result === "1" ? "Osteoporosis" : (clinicalResult?.result || "N/A");
  const imagingLabel = imagingResult?.result || "N/A";

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Bone className="text-emerald-500 w-10 h-10" />
            Osteoporosis Assessment Results
          </h1>
          {patient && (
            <div className="flex items-center gap-4 border border-white/10 bg-white/5 px-4 py-3 rounded-xl w-max backdrop-blur-md print:bg-transparent print:border-black/20">
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider print:text-black/50">Patient Name</span>
                <span className="text-white font-medium text-xl print:text-black">{patient.patientName}</span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-2 print:bg-black/10"></div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider print:text-black/50">Screening ID</span>
                <span className="text-emerald-400 font-mono text-xl print:text-emerald-600">{patient.screeningId}</span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => window.print()} 
          className="group flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-full text-sm font-bold transition-all shadow-lg backdrop-blur-md hover:scale-105 print:hidden"
        >
          <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          Download PDF Report
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #0A0A0B !important; color: white !important; }
          button { display: none !important; }
          ::-webkit-scrollbar { display: none; }
        }
      `}} />

      {/* Ensemble Card */}
      {clinicalResult && imagingResult && (
        <div className={`border-2 p-8 rounded-3xl mb-8 shadow-2xl transition-all ${
          isHighRisk 
            ? "bg-gradient-to-r from-red-950/40 via-amber-950/20 to-black/60 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
            : "bg-gradient-to-r from-emerald-900/40 to-emerald-600/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        }`}>
          <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isHighRisk ? "text-amber-400" : "text-emerald-400"}`}>
            <Activity className="w-6 h-6" /> Final Multimodal Ensemble Diagnosis
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-3">
              <p className="text-gray-300 text-lg">
                Fusing patient clinical biomarkers ({clinicalResult.model_name}) with deep radiographic analysis ({imagingResult.model_name}) for a calibrated medical evaluation.
              </p>
              {isDiscordant && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-300 text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Clinical Note on Modality Variance:</strong> Clinical risk factors indicate high susceptibility ({clinicalLabel}), while plain X-ray features appear early-stage ({imagingLabel}). Plain 2D radiographs frequently appear normal in early osteoporosis before 30-50% bone mineral depletion occurs. Confirmatory DEXA scan recommended.
                  </span>
                </div>
              )}
            </div>
            <div className="bg-black/60 p-6 rounded-2xl border border-white/10 min-w-[280px] text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Combined Conclusion</p>
              <p className={`text-3xl font-extrabold ${isHighRisk ? "text-amber-400" : "text-emerald-400"}`}>
                {isHighRisk ? "Osteoporosis" : "Normal"}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-200">
                {isHighRisk ? "High Risk Detected" : "Low Risk Profile"}
              </div>
              <p className="text-gray-400 text-sm mt-3">
                Overall Risk Score: <span className="font-bold text-white">{(combinedRisk * 100).toFixed(1)}%</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Clinical Results */}
        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Clinical ML Analysis
          </h2>
          {clinicalResult ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-gray-400">Diagnosis:</span>
                <span className={`font-bold text-lg ${clinicalLabel === "Osteoporosis" ? "text-amber-400" : "text-emerald-400"}`}>
                  {clinicalLabel}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-gray-400">Osteoporosis Probability:</span>
                <span className="text-white font-mono font-medium">{(clinicalRisk * 100).toFixed(1)}%</span>
              </div>
              <p className="text-gray-500 text-xs mt-3">Model: {clinicalResult.model_name}</p>
            </div>
          ) : (
            <p className="text-gray-500">Not completed.</p>
          )}
        </div>

        {/* Imaging Results */}
        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400 flex items-center gap-2">
            <Bone className="w-5 h-5" /> Deep Learning X-Ray Analysis
          </h2>
          {imagingResult ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-gray-400">Radiograph Diagnosis:</span>
                <span className={`font-bold text-lg ${imagingLabel === "Osteoporosis" ? "text-amber-400" : "text-emerald-400"}`}>
                  {imagingLabel}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span className="text-gray-400">Osteoporosis Probability:</span>
                <span className="text-white font-mono font-medium">{(imagingRisk * 100).toFixed(1)}%</span>
              </div>
              <p className="text-gray-500 text-xs mt-3">Model: {imagingResult.model_name}</p>
            </div>
          ) : (
            <p className="text-gray-500">Not completed.</p>
          )}
        </div>
      </div>
      
      <div className="mt-12 flex justify-center">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all text-white font-medium">
          <Home className="w-4 h-4" /> Return to Home
        </button>
      </div>
    </div>
  );
}
