"use client";

import { useScreening } from "@/context/ScreeningContext";
import { usePatient } from "@/context/PatientContext";
import type { IMUResult } from "@/context/ScreeningContext";
import { Activity, Bone, Camera, HeartPulse, AlertCircle, ArrowRight, ShieldCheck, Info, Stethoscope, UserCircle, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function ResultsPage() {
  const { clinicalResult, metabolicResult, cameraResult, imagingResult, imuResult, selectedJoint } = useScreening();
  const { patient } = usePatient();
  const [viewMode, setViewMode] = useState<"patient" | "doctor">("patient");

  // Helper to determine if we recommend X-ray
  const isElevated = (res: any) => res && res.result && (res.result.includes("Elevated") || res.result.includes("High"));
  const imuElevated = imuResult && (imuResult.risk_level === "elevated" || imuResult.risk_level === "moderate");
  const recommendXRay = isElevated(clinicalResult) || isElevated(metabolicResult) || isElevated(cameraResult);
  
  if (!clinicalResult && !metabolicResult && !cameraResult && !imagingResult && !imuResult) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-white">No Assessment Data</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          You haven't completed the Doctor AI screening pipeline yet.
        </p>
        <Link href="/" className="bg-white text-black px-6 py-2.5 rounded-full font-medium hover:bg-gray-200 transition-colors">
          Start Screening
        </Link>
      </div>
    );
  }

  const renderEvidence = (evidence: any[], isShap: boolean = true) => {
    if (!evidence || evidence.length === 0) return null;
    
    // Detect if this is plain string array (movement screening) vs SHAP object array
    const isStringArray = evidence.length > 0 && typeof evidence[0] === "string";
    if (isStringArray) {
      return (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs font-bold text-white/70 uppercase mb-3">Movement Evidence</p>
          <div className="space-y-2">
            {(evidence as string[]).map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-white/5 text-sm text-white/80">
                <span className="text-accent mt-0.5">â€¢</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Sort by absolute contribution for SHAP
    const sorted = [...evidence].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    
    return (
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs font-bold text-white/70 uppercase mb-3">Why did AI say this?</p>
        <div className="space-y-2">
          {sorted.map((item, idx) => {
            if (isShap) {
              const isPositive = item.contribution > 0;
              return (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-white/80">{item.feature} <span className="text-white/40">({item.value})</span></span>
                  <span className={`font-medium ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isPositive ? 'â†‘ Increased Risk' : 'â†“ Decreased Risk'}
                  </span>
                </div>
              );
            } else {
              // Raw measurements (e.g. Camera)
              return (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-white/80">{item.feature}</span>
                  <span className="font-mono text-accent">{item.value.toFixed(1)}</span>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col relative">
      
      {/* View Toggle */}
      <div className="absolute top-8 right-8 z-20 flex bg-black/40 p-1 rounded-lg border border-white/10 backdrop-blur-md">
        <button 
          onClick={() => setViewMode("patient")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "patient" ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          <UserCircle className="w-4 h-4" /> Patient View
        </button>
        <button 
          onClick={() => setViewMode("doctor")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "doctor" ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
        >
          <Stethoscope className="w-4 h-4" /> Doctor Evidence
        </button>
      </div>

      <div className="mb-8 z-10 pt-4">
        <h1 className="text-4xl font-semibold tracking-tight text-white flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-accent" />
          {viewMode === "doctor" ? "AI Evidence Dashboard" : "Assessment Results"}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {viewMode === "doctor" 
            ? "Transparent explainable AI insights based on SHAP values and functional biomechanics."
            : "Your screening results based on clinical and functional assessments."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        
        {/* Stage 1: Clinical */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-3xl relative overflow-hidden border-t-2 border-t-blue-500/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          <h3 className="text-sm font-bold tracking-wider text-blue-400 uppercase mb-4 flex items-center gap-2">
            <Bone className="w-4 h-4" /> Clinical OA Signal
          </h3>
          
          {clinicalResult ? (
            <>
              <div className="flex items-end gap-3 mb-4">
                <div className="text-5xl font-black text-white">
                  {(clinicalResult.probability * 100).toFixed(1)}<span className="text-2xl text-muted-foreground ml-1">%</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold mb-4 inline-block ${isElevated(clinicalResult) ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {clinicalResult.result}
              </div>
              {viewMode === "doctor" && (
                <>
                  <p className="text-xs text-white/50 bg-black/40 p-3 rounded-lg mb-4">Model: {clinicalResult.model_name}<br/>Threshold: {clinicalResult.threshold}</p>
                  {renderEvidence(clinicalResult.evidence || [], true)}
                </>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm italic">Assessment skipped or missing.</p>
          )}
        </motion.div>

        {/* Stage 1: Metabolic */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-3xl relative overflow-hidden border-t-2 border-t-purple-500/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
          <h3 className="text-sm font-bold tracking-wider text-purple-400 uppercase mb-4 flex items-center gap-2">
            <HeartPulse className="w-4 h-4" /> Metabolic Severity Risk
          </h3>
          
          {metabolicResult ? (
            <>
              <div className="flex items-end gap-3 mb-4">
                <div className="text-5xl font-black text-white">
                  {(metabolicResult.probability * 100).toFixed(1)}<span className="text-2xl text-muted-foreground ml-1">%</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold mb-4 inline-block ${isElevated(metabolicResult) ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {metabolicResult.result}
              </div>
              {viewMode === "doctor" && (
                <>
                  <p className="text-xs text-white/50 bg-black/40 p-3 rounded-lg mb-4">Model: {metabolicResult.model_name}<br/>Threshold: {metabolicResult.threshold}</p>
                  {renderEvidence(metabolicResult.evidence || [], true)}
                </>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm italic">Assessment skipped or missing.</p>
          )}
        </motion.div>

        {/* Stage 2: Camera */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-3xl relative overflow-hidden border-t-2 border-t-accent/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
          <h3 className="text-sm font-bold tracking-wider text-accent uppercase mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4" />  Camera-based movement screening ({selectedJoint})
          </h3>
          
          {cameraResult ? (
            <>
              <div className="flex items-end gap-3 mb-4">
                <div className="text-5xl font-black text-white">
                  {(cameraResult.probability * 100).toFixed(1)}<span className="text-2xl text-muted-foreground ml-1">%</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-bold mb-4 inline-block ${isElevated(cameraResult) ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {cameraResult.result}
              </div>
              {viewMode === "doctor" && (
                <>
                  <p className="text-xs text-white/50 bg-black/40 p-3 rounded-lg mb-4">Model: {cameraResult.model_name || "Camera Engine"}</p>
                  {renderEvidence(cameraResult.evidence || [], false)}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-white/40 text-sm italic">Movement data not yet captured.</p>
              <Link href="/screening/camera" className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                Run Assessment <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* IMU Sensor Assessment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-3xl relative overflow-hidden border-t-2 border-t-orange-500/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
          <h3 className="text-sm font-bold tracking-wider text-orange-400 uppercase mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> IMU Sensor Assessment
          </h3>
          <div className="flex flex-col items-start gap-3">
            <p className="text-white/40 text-sm font-semibold">Not available &mdash; insufficient validated data.</p>
          </div>
        </motion.div>
      </div>
      {/* FINAL RECOMMENDATION PANEL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.5, duration: 0.6 }}
        className={`mt-10 p-8 rounded-3xl border-2 ${recommendXRay ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/30' : 'bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border-emerald-500/30'} flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden`}
      >
        <div className={`w-24 h-24 shrink-0 rounded-full flex items-center justify-center border-4 ${recommendXRay ? 'border-red-500/50 bg-red-500/20' : 'border-emerald-500/50 bg-emerald-500/20'}`}>
          {recommendXRay ? <AlertCircle className="w-10 h-10 text-red-400" /> : <ShieldCheck className="w-10 h-10 text-emerald-400" />}
        </div>
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            {viewMode === "patient" ? (
              recommendXRay ? "What should I do? â†’ Get an X-Ray" : "What should I do? â†’ Routine Monitoring"
            ) : (
              recommendXRay ? "Radiographic Evaluation Recommended" : "Routine Monitoring Recommended"
            )}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            {recommendXRay 
              ? "One or more evidence streams indicate an elevated likelihood of structural issues or symptomatic progression. A confirmatory X-Ray or MRI is strongly advised."
              : "All completed evidence streams indicate a low risk profile. Continue routine conservative monitoring and maintain physical activity levels."
            }
          </p>
          
          {viewMode === "doctor" && (
            <div className="mt-6 flex gap-4">
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Accept AI Assessment
              </button>
              <button className="bg-transparent border border-white/20 hover:bg-white/5 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Add Clinical Notes
              </button>
            </div>
          )}
        </div>
      </motion.div>
      
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-white/30 uppercase tracking-widest text-center max-w-xl mx-auto">
        <Info className="w-4 h-4 shrink-0" />
        This is an experimental AI screening tool. Model trained primarily on end-stage hip OA data; results are intended for screening and clinical decision support, not diagnosis.
      </div>


            {/* DEBUG AUDIT BLOCK */}
      {viewMode === "doctor" && (
        <div className="mt-12 bg-black/80 border border-red-500/30 p-6 rounded-xl overflow-x-auto text-xs font-mono text-green-400">
          <h4 className="text-red-400 font-bold mb-4 uppercase tracking-widest border-b border-red-500/30 pb-2">Debug Audit / Assessment Provenance</h4>
          <pre>{JSON.stringify({
            clinical: clinicalResult || "None",
            metabolic: metabolicResult || "None",
            camera: cameraResult || "None"
          }, null, 2)}</pre>
        </div>
      )}

      {/* DOMAIN GAP DISCLAIMER */}
      <div className="mt-8 bg-black/40 border border-white/10 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-sm text-white/60">
          <strong className="text-white/80">Clinical Disclaimer:</strong> This AI result is a screening aid and requires clinical interpretation. Models may be based on high-precision research datasets (e.g. Vicon motion capture) which are being adapted to webcam-derived kinematics. This is not a definitive diagnostic tool.
        </p>
      </div>
    </div>
  );
}



