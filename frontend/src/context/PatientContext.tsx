"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type PatientInfo = {
  patientName: string;
  patientId: string;
  screeningId: string;
  screeningStartedAt: string; // ISO string
  age?: number;
  gender?: string;
  [key: string]: any;
};

type PatientContextType = {
  patient: PatientInfo | null;
  setPatient: (info: PatientInfo | null) => void;
  clearPatient: () => void;
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

function generateScreeningId(): string {
  return "SCR-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<PatientInfo | null>(null);
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("oa_patient");
      if (stored) setPatientState(JSON.parse(stored));
    } catch {}
    setIsInit(true);
  }, []);

  useEffect(() => {
    if (!isInit) return;
    try {
      if (patient) window.localStorage.setItem("oa_patient", JSON.stringify(patient));
      else window.localStorage.removeItem("oa_patient");
    } catch {}
  }, [patient, isInit]);

  const setPatient = (info: PatientInfo | null) => setPatientState(info);
  const clearPatient = () => {
    setPatientState(null);
    window.localStorage.removeItem("oa_patient");
  };

  return (
    <PatientContext.Provider value={{ patient, setPatient, clearPatient }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}

export { generateScreeningId };
