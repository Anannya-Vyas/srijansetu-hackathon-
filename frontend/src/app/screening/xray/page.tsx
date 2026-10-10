"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Image as ImageIcon, X, Loader2, ArrowRight } from "lucide-react";
import { useScreening } from "@/context/ScreeningContext";

export default function XRayPage() {
  const router = useRouter();
  const { setImagingResult, selectedJoint } = useScreening();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("joint", selectedJoint || "knee");

      const response = await fetch("http://localhost:8000/api/analyze/imaging", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image.");
      }

      const result = await response.json();
      setImagingResult({
        status: "success",
        probability: result.structural_risk,
        threshold: 0.50,
        result: result.finding,
        model_name: result.model || "PyTorch ResNet-18"
      });

      router.push("/screening/results");
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    setImagingResult(null);
    router.push("/screening/results");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center justify-center gap-3">
          <ImageIcon className="w-8 h-8 text-accent" />
          X-Ray / MRI Upload
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload an existing radiographic image to enhance your assessment accuracy.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {!preview ? (
          <div 
            className="w-full max-w-2xl border-2 border-dashed border-white/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-16 h-16 text-white/40 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Drag and drop your image here</h3>
            <p className="text-muted-foreground mb-6">PNG, JPG, DICOM supported</p>
            <button className="px-6 py-2 bg-white/10 rounded-full text-white text-sm font-medium hover:bg-white/20">
              Browse Files
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="w-full max-w-2xl relative rounded-2xl overflow-hidden border border-white/20 bg-black/40">
            <button 
              onClick={() => { setPreview(null); setFile(null); }}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white/70 hover:text-white hover:bg-black/80 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={preview} alt="X-Ray Preview" className="w-full max-h-[500px] object-contain" />
          </div>
        )}

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>

      <div className="mt-8 flex justify-between items-center w-full max-w-2xl mx-auto">
        <button 
          onClick={handleSkip}
          className="text-white/60 hover:text-white px-4 py-2"
        >
          Skip this step
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!file || isUploading}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
            file && !isUploading 
              ? "bg-accent text-white hover:bg-accent/90" 
              : "bg-white/10 text-white/30 cursor-not-allowed"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing AI...
            </>
          ) : (
            <>
              Process Image <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
