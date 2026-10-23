"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Image as ImageIcon, X, Loader2, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import { useScreening } from "@/context/ScreeningContext";
import { usePatient } from "@/context/PatientContext";

export default function OsteoporosisXRayPage() {
  const router = useRouter();
  const { setImagingResult } = useScreening();
  const { patient } = usePatient();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gatekeeperRejection, setGatekeeperRejection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setGatekeeperRejection(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please upload an X-Ray.");
    setIsUploading(true);
    setError(null);
    setGatekeeperRejection(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_id", patient?.patientId || "Unknown");
      formData.append("patient_age", String(patient?.age || 60));

      const response = await fetch("http://localhost:8000/api/analyze/osteoporosis_imaging", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || result.message || "Failed to process image.");

      // Check if Image Quality Gatekeeper rejected the radiograph
      if (result.status === "rejected") {
        setGatekeeperRejection(result.detail || "Image rejected by radiographic quality gatekeeper.");
        setIsUploading(false);
        return;
      }

      const osteoProb = result.probabilities && result.probabilities["Osteoporosis"] !== undefined
        ? result.probabilities["Osteoporosis"] / 100
        : (result.prediction === "Osteoporosis" ? result.confidence / 100 : (1 - (result.confidence / 100)));

      setImagingResult({
        status: "success",
        probability: osteoProb,
        threshold: 0.35, // Sensitivity-tuned screening threshold
        result: result.prediction,
        model_name: result.model_name || "DenseNet-121 Clean (CLAHE + Grad-CAM)",
        gradcam_image: result.gradcam_image || "",
        bone_health_age: result.bone_health_age || patient?.age || 60,
        probabilities: result.probabilities || {},
        screening_tier: result.screening_tier || "Screening Evaluation Complete",
        quality_passed: result.quality_passed,
        quality_metrics: result.quality_metrics,
        original_preview: preview || undefined
      });

      router.push("/screening/osteoporosis/results");
    } catch (err: any) {
      setError(err.message || "An error occurred during radiographic evaluation.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> DenseNet-121 Clean • CLAHE Trabecular Analysis • XAI Grad-CAM
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-emerald-500" />
          Upload Osteoporosis Radiograph
        </h1>
        <p className="text-gray-400 text-sm mt-1 max-w-lg mx-auto">
          Upload a knee, femoral, or distal radiograph. The system enhances bone microarchitecture with CLAHE and visualizes density loss using Grad-CAM attention heatmaps.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!preview ? (
          <div 
            className="w-full max-w-2xl border-2 border-dashed border-white/20 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all hover:border-emerald-500/40 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">Select Radiograph File</h3>
            <p className="text-gray-400 text-sm text-center max-w-xs mb-3">
              Standard digital X-Ray format (JPEG, PNG, DICOM-exported)
            </p>
            <span className="text-xs text-white/40 border border-white/10 px-3 py-1 rounded-full">
              Automated Quality Gatekeeper Active
            </span>
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="w-full max-w-2xl relative rounded-3xl overflow-hidden border border-white/20 bg-black/60 shadow-2xl">
            <img src={preview} alt="Radiograph Preview" className="w-full object-contain max-h-[380px] p-2" />
            <button 
              onClick={() => { setFile(null); setPreview(null); setGatekeeperRejection(null); }}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black p-2 rounded-full text-white/70 hover:text-white transition-all border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quality Gatekeeper Refusal Card */}
        {gatekeeperRejection && (
          <div className="w-full max-w-2xl mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 animate-fadeIn">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-200">Image Quality Gatekeeper Rejection</p>
              <p className="mt-0.5 text-amber-300/90">{gatekeeperRejection}</p>
              <p className="mt-2 text-xs text-gray-400">
                To guarantee diagnostic safety and eliminate hallucinated findings, our safety layer rejects motion-blurred or low-contrast inputs.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full max-w-2xl mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Patient-level grouped validation (No image leakage)</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file || isUploading}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg ${
            file && !isUploading 
              ? "bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 shadow-emerald-900/30" 
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Trabecular Matrix...</span>
            </>
          ) : (
            <span>Run Deep Radiographic AI</span>
          )}
        </button>
      </div>
    </div>
  );
}
