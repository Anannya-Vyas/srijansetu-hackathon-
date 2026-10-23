"use client";

import { useScreening } from "@/context/ScreeningContext";
import { usePatient } from "@/context/PatientContext";
import { 
  CheckCircledIcon, 
  ExclamationTriangleIcon, 
  ArrowRightIcon, 
  InfoCircledIcon, 
  PersonIcon,
  MixerHorizontalIcon,
  ActivityLogIcon,
  CameraIcon,
  ArrowLeftIcon,
  DownloadIcon
} from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function ResultsPage() {
  const { clinicalResult, metabolicResult, cameraResult, imagingResult, imuResult, selectedJoint } = useScreening();
  const { patient } = usePatient();
  const [viewMode, setViewMode] = useState<"patient" | "doctor">("patient");

  const isElevated = (res: any) => res && res.result && (res.result.includes("Elevated") || res.result.includes("High"));
  const recommendXRay = isElevated(clinicalResult) || isElevated(metabolicResult) || isElevated(cameraResult);
  
  if (!clinicalResult && !metabolicResult && !cameraResult && !imagingResult && !imuResult) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FFEFEA] text-[#FF6B4A] flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">No Active Screening Data</h2>
        <p className="text-gray-500 text-sm mb-6">
          You haven't completed the functional kinematic screening pipeline yet.
        </p>
        <Link 
          href="/screening/joint-selection" 
          className="inline-flex items-center gap-2 bg-[#FF6B4A] hover:bg-[#E85938] text-white px-8 py-3.5 rounded-full font-semibold shadow-[0_8px_20px_-4px_rgba(255,107,74,0.35)] transition-all"
        >
          Select Joint Assessment
        </Link>
      </div>
    );
  }

  const renderEvidence = (evidence: any[], isShap: boolean = true) => {
    if (!evidence || evidence.length === 0) return null;
    
    const isStringArray = evidence.length > 0 && typeof evidence[0] === "string";
    if (isStringArray) {
      return (
        <div className="mt-4 pt-4 border-t border-[#EBE8E3]">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Kinematic Indicators</p>
          <div className="space-y-1.5">
            {(evidence as string[]).map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#EBE8E3] text-xs font-medium text-gray-800">
                <span className="text-[#FF6B4A] mt-0.5">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    const sorted = [...evidence].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    
    return (
      <div className="mt-4 pt-4 border-t border-[#EBE8E3]">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Biomarker Feature Attributions</p>
        <div className="space-y-2">
          {sorted.map((item, idx) => {
            if (isShap) {
              const isPositive = item.contribution > 0;
              return (
                <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-[#FAF9F6]">
                  <span className="font-semibold text-gray-800">{item.feature} <span className="text-gray-400 font-normal">({item.value})</span></span>
                  <span className={`font-bold ${isPositive ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {isPositive ? '↑ Risk Factor' : '↓ Protective'}
                  </span>
                </div>
              );
            } else {
              return (
                <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-[#FAF9F6]">
                  <span className="font-semibold text-gray-800">{item.feature}</span>
                  <span className="font-bold text-[#FF6B4A]">{item.value.toFixed(1)}°</span>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Top Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium transition-colors">
              <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-semibold text-[#E65100] bg-[#FFEFEA] border border-[#FFD8CC] px-2.5 py-0.5 rounded-full">
              Assessment Results
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            {viewMode === "doctor" ? "AI Evidence & Kinematic Report" : "Functional Screening Summary"}
          </h1>
        </div>

        {/* View Toggle */}
        <div className="inline-flex bg-white border border-[#EBE8E3] p-1.5 rounded-full shadow-sm self-start sm:self-auto">
          <button 
            onClick={() => setViewMode("patient")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === "patient" ? 'bg-[#FF6B4A] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF9F6]'
            }`}
          >
            <PersonIcon className="w-4 h-4" /> Patient View
          </button>
          <button 
            onClick={() => setViewMode("doctor")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
              viewMode === "doctor" ? 'bg-[#FF6B4A] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-[#FAF9F6]'
            }`}
          >
            <MixerHorizontalIcon className="w-4 h-4" /> Doctor Evidence
          </button>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stage 1: Clinical */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-[#FF6B4A] uppercase">Clinical OA Signal</span>
              <ActivityLogIcon className="w-4 h-4 text-[#FF6B4A]" />
            </div>
            
            {clinicalResult ? (
              <>
                <div className="text-4xl font-black text-gray-900 mb-2">
                  {(clinicalResult.probability * 100).toFixed(1)}<span className="text-xl text-gray-400 ml-1">%</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block ${
                  isElevated(clinicalResult) ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {clinicalResult.result}
                </div>
                {viewMode === "doctor" && (
                  <>
                    <p className="text-xs text-gray-500 bg-[#FAF9F6] p-3 rounded-2xl border border-[#EBE8E3] mb-3">
                      Model: <strong>{clinicalResult.model_name}</strong><br/>
                      Threshold: <strong>{clinicalResult.threshold}</strong>
                    </p>
                    {renderEvidence(clinicalResult.evidence || [], true)}
                  </>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-xs italic">Clinical questionnaire not completed.</p>
            )}
          </div>
        </motion.div>

        {/* Stage 1: Metabolic */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-[#FF6B4A] uppercase">Metabolic Risk Profile</span>
              <MixerHorizontalIcon className="w-4 h-4 text-[#FF6B4A]" />
            </div>
            
            {metabolicResult ? (
              <>
                <div className="text-4xl font-black text-gray-900 mb-2">
                  {(metabolicResult.probability * 100).toFixed(1)}<span className="text-xl text-gray-400 ml-1">%</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block ${
                  isElevated(metabolicResult) ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {metabolicResult.result}
                </div>
                {viewMode === "doctor" && (
                  <>
                    <p className="text-xs text-gray-500 bg-[#FAF9F6] p-3 rounded-2xl border border-[#EBE8E3] mb-3">
                      Model: <strong>{metabolicResult.model_name}</strong><br/>
                      Threshold: <strong>{metabolicResult.threshold}</strong>
                    </p>
                    {renderEvidence(metabolicResult.evidence || [], true)}
                  </>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-xs italic">Biochemical numbers omitted (Skipped).</p>
            )}
          </div>
        </motion.div>

        {/* Stage 2: Camera */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider text-[#FF6B4A] uppercase">Vision Kinematics ({selectedJoint || "Knee"})</span>
              <CameraIcon className="w-4 h-4 text-[#FF6B4A]" />
            </div>
            
            {cameraResult ? (
              <>
                <div className="text-4xl font-black text-gray-900 mb-2">
                  {(cameraResult.probability * 100).toFixed(1)}<span className="text-xl text-gray-400 ml-1">%</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block ${
                  isElevated(cameraResult) ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {cameraResult.result}
                </div>
                {viewMode === "doctor" && (
                  <>
                    <p className="text-xs text-gray-500 bg-[#FAF9F6] p-3 rounded-2xl border border-[#EBE8E3] mb-3">
                      Model: <strong>{cameraResult.model_name || "MediaPipe Kinematics"}</strong>
                    </p>
                    {renderEvidence(cameraResult.evidence || [], false)}
                  </>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400 text-xs italic">Movement kinematic data not captured.</p>
                <Link href="/screening/camera?joint=knee" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6B4A] hover:underline">
                  Launch Camera Test <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* FINAL RECOMMENDATION BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="p-8 rounded-3xl bg-white border border-[#EBE8E3] shadow-sm flex flex-col md:flex-row items-center gap-6 mb-8"
      >
        <div className={`w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center ${
          recommendXRay ? 'bg-[#FFEFEA] text-[#FF6B4A]' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {recommendXRay ? <ExclamationTriangleIcon className="w-10 h-10" /> : <CheckCircledIcon className="w-10 h-10" />}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {recommendXRay ? "Radiographic Evaluation Recommended" : "Routine Conservative Monitoring"}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {recommendXRay 
              ? "One or more functional evidence streams demonstrate elevated probability of structural joint impairment. An orthopedic consultation and targeted radiograph is recommended."
              : "Completed evidence streams indicate stable range of motion and joint stability. Continue routine low-impact strengthening exercises."
            }
          </p>
          
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/screening/osteoporosis/basic-questionnaire"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold text-xs transition-all shadow-md"
            >
              Check Bone Density / Osteoporosis <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-[#EBE8E3] hover:bg-[#FAF9F6] text-gray-700 font-semibold text-xs transition-all"
            >
              <DownloadIcon className="w-3.5 h-3.5" /> Print Patient Slip
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Clinical Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#EBE8E3] text-xs text-gray-500 flex items-start gap-2.5 mb-12">
        <InfoCircledIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
        <p>
          <strong>Clinical Decision Support Notice:</strong> This software is an algorithmic pre-screening decision support tool. It does not provide formal medical diagnoses. Results should be interpreted by certified medical practitioners in conjunction with radiographic and clinical findings.
        </p>
      </div>
    </div>
  );
}
