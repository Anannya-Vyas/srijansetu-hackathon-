"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type AIResult = {
  status: string;
  probability: number;
  threshold: number;
  result: string;
  model_name: string;
  evidence?: { feature: string, value: number, contribution: number }[] | string[];
  gradcam_image?: string;
  bone_health_age?: number;
  probabilities?: Record<string, number>;
  screening_tier?: string;
  quality_passed?: boolean;
  quality_metrics?: Record<string, any>;
  original_preview?: string;
  [key: string]: any;
};

export type IMUResult = {
  status: string;
  session_id: string;
  source: string;
  joint: string;
  simulation_profile: string;
  risk_level: "low" | "moderate" | "elevated";
  risk_score: number;
  features: {
    cadence_spm: number | null;
    knee_rom_deg: number | null;
    peak_knee_flexion_deg: number | null;
    stance_percentage: number | null;
    swing_percentage: number | null;
    cycle_count: number | null;
    signal_variability: number | null;
    low_quality_warning: boolean;
  };
  evidence: string[];
  disclaimer: string;
};

type ScreeningContextType = {
  clinicalResult: AIResult | null;
  setClinicalResult: (res: AIResult | null) => void;
  metabolicResult: AIResult | null;
  setMetabolicResult: (res: AIResult | null) => void;
  tempCameraAngles: Record<string, number[]> | null;
  selectedJoint: string | null;
  setSelectedJoint: (joint: string | null) => void;
  setTempCameraAngles: (angles: Record<string, number[]> | null) => void;
  cameraResult: AIResult | null;
  setCameraResult: (res: AIResult | null) => void;
  imagingResult: AIResult | null;
  setImagingResult: (res: AIResult | null) => void;
  imuResult: IMUResult | null;
  setImuResult: (res: IMUResult | null) => void;
  resetAll: () => void;
};

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading localStorage key ", key, error);
    return defaultValue;
  }
};

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  const [clinicalResult, setClinicalResult] = useState<AIResult | null>(null);
  const [metabolicResult, setMetabolicResult] = useState<AIResult | null>(null);
  const [tempCameraAngles, setTempCameraAngles] = useState<Record<string, number[]> | null>(null);
  const [selectedJoint, setSelectedJoint] = useState<string | null>(null);
  const [cameraResult, setCameraResult] = useState<AIResult | null>(null);
  const [imagingResult, setImagingResult] = useState<AIResult | null>(null);
  const [imuResult, setImuResult] = useState<IMUResult | null>(null);

  useEffect(() => {
    setClinicalResult(loadFromStorage("oa_clinicalResult", null));
    setMetabolicResult(loadFromStorage("oa_metabolicResult", null));
    setSelectedJoint(loadFromStorage("oa_selectedJoint", null));
    setCameraResult(loadFromStorage("oa_cameraResult", null));
    setTempCameraAngles(loadFromStorage("oa_tempCameraAngles", null));
    setImagingResult(loadFromStorage("oa_imagingResult", null));
    setImuResult(loadFromStorage("oa_imuResult", null));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (clinicalResult) window.localStorage.setItem("oa_clinicalResult", JSON.stringify(clinicalResult));
      else window.localStorage.removeItem("oa_clinicalResult");

      if (metabolicResult) window.localStorage.setItem("oa_metabolicResult", JSON.stringify(metabolicResult));
      else window.localStorage.removeItem("oa_metabolicResult");

      if (selectedJoint) window.localStorage.setItem("oa_selectedJoint", JSON.stringify(selectedJoint));
      else window.localStorage.removeItem("oa_selectedJoint");

      if (cameraResult) window.localStorage.setItem("oa_cameraResult", JSON.stringify(cameraResult));
      else window.localStorage.removeItem("oa_cameraResult");
      window.localStorage.removeItem("oa_tempCameraAngles");

      if (tempCameraAngles) window.localStorage.setItem("oa_tempCameraAngles", JSON.stringify(tempCameraAngles));
      else window.localStorage.removeItem("oa_tempCameraAngles");

      if (imagingResult) window.localStorage.setItem("oa_imagingResult", JSON.stringify(imagingResult));
      else window.localStorage.removeItem("oa_imagingResult");

      if (imuResult) window.localStorage.setItem("oa_imuResult", JSON.stringify(imuResult));
      else window.localStorage.removeItem("oa_imuResult");
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }, [clinicalResult, metabolicResult, selectedJoint, cameraResult, imagingResult, imuResult, isInitialized]);

  const resetAll = () => {
    setClinicalResult(null);
    setMetabolicResult(null);
    setCameraResult(null);
    setImagingResult(null);
    setImuResult(null);
    setSelectedJoint(null);
    setTempCameraAngles(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("oa_clinicalResult");
      window.localStorage.removeItem("oa_metabolicResult");
      window.localStorage.removeItem("oa_selectedJoint");
      window.localStorage.removeItem("oa_cameraResult");
      window.localStorage.removeItem("oa_tempCameraAngles");
      window.localStorage.removeItem("oa_imagingResult");
      window.localStorage.removeItem("oa_imuResult");
    }
  };

  return (
    <ScreeningContext.Provider
      value={{
        clinicalResult,
        setClinicalResult,
        metabolicResult,
        setMetabolicResult,
        tempCameraAngles,
        setTempCameraAngles,
        selectedJoint,
        setSelectedJoint,
        cameraResult,
        setCameraResult,
        imagingResult,
        setImagingResult,
        imuResult,
        setImuResult,
        resetAll,
      }}
    >
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (context === undefined) {
    throw new Error("useScreening must be used within a ScreeningProvider");
  }
  return context;
}
