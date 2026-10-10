"use client";

import { useScreening } from "@/context/ScreeningContext";
import { usePatient } from "@/context/PatientContext";
import { useRouter } from "next/navigation";
import { Activity, Bone, ArrowLeft, Home, Download } from "lucide-react";
import Link from "next/link";

export default function OsteoporosisResults() {
  const { clinicalResult, imagingResult } = useScreening();
  const { patient } = usePatient();
  const router = useRouter();

  if (!clinicalResult && !imagingResult) {
    return <div className="text-white text-center mt-20">No results available. <Link href="/" className="text-emerald-500 ml-2">Go Home</Link></div>;
  }

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

      {clinicalResult && imagingResult && (
        <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-600/20 border-2 border-emerald-500/50 p-8 rounded-3xl mb-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400 flex items-center gap-2">
            <Activity className="w-6 h-6" /> Final Ensemble Prediction (Clinical + X-Ray)
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <p className="text-gray-300 text-lg">
                By fusing the predictions from the <strong>Metabolic XGBoost Model</strong> and the <strong>DenseNet121 Vision Architecture</strong>, the ensemble model provides a highly robust final assessment.
              </p>
            </div>
            <div className="bg-black/50 p-6 rounded-2xl border border-white/10 min-w-[250px] text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Ensemble Diagnosis</p>
              <p className="text-3xl font-bold text-white">
                {((clinicalResult.probability + imagingResult.probability) / 2) >= 0.5 ? "Osteoporosis" : "Normal"}
              </p>
              <p className="text-emerald-400 font-medium mt-2">
                {(((clinicalResult.probability + imagingResult.probability) / 2) * 100).toFixed(1)}% Confidence
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
            <div className="space-y-2">
              <p className="text-gray-400">Diagnosis: <span className="text-white font-bold">{clinicalResult.result}</span></p>
              <p className="text-gray-400">Confidence: <span className="text-white">{(clinicalResult.probability * 100).toFixed(1)}%</span></p>
              <p className="text-gray-400 text-sm mt-4">Model: {clinicalResult.model_name}</p>
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
            <div className="space-y-2">
              <p className="text-gray-400">Diagnosis: <span className="text-white font-bold">{imagingResult.result}</span></p>
              <p className="text-gray-400">Confidence: <span className="text-white">{(imagingResult.probability * 100).toFixed(1)}%</span></p>
              <p className="text-gray-400 text-sm mt-4">Model: {imagingResult.model_name}</p>
            </div>
          ) : (
            <p className="text-gray-500">Not completed.</p>
          )}
        </div>
      </div>
      
      <div className="mt-12 flex justify-center">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
          <Home className="w-4 h-4" /> Return to Home
        </button>
      </div>
    </div>
  );
}
