"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Image as ImageIcon, X, Loader2, ArrowRight } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) return setError("Please upload an X-Ray.");
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patient_id", patient?.patientId || "Unknown");

      const response = await fetch("http://localhost:8000/api/analyze/osteoporosis_imaging", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to process image.");

      const osteoProb = result.probabilities && result.probabilities["Osteoporosis"] !== undefined
        ? result.probabilities["Osteoporosis"] / 100
        : (result.prediction === "Osteoporosis" ? result.confidence / 100 : (1 - (result.confidence / 100)));

      setImagingResult({
        status: "success",
        probability: osteoProb,
        threshold: 0.50,
        result: result.prediction,
        model_name: "ResNet18 5-Fold Ensemble"
      });

      router.push("/screening/osteoporosis/results");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-emerald-500" />
          Upload Osteoporosis X-Ray
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!preview ? (
          <div 
            className="w-full max-w-2xl border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-white/40 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Select X-Ray Image</h3>
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="w-full max-w-2xl relative rounded-2xl overflow-hidden border border-white/20">
            <img src={preview} alt="Preview" className="w-full object-contain max-h-[400px]" />
          </div>
        )}
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>

      <div className="mt-8 flex justify-end w-full max-w-2xl mx-auto">
        <button
          onClick={handleSubmit}
          disabled={!file || isUploading}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium ${file && !isUploading ? "bg-emerald-600 text-white" : "bg-white/10 text-white/30"}`}
        >
          {isUploading ? "Processing..." : "Process X-Ray"}
        </button>
      </div>
    </div>
  );
}
