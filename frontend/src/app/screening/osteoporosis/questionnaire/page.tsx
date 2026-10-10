"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Loader2, ChevronRight, User, AlertCircle } from "lucide-react";
import { useScreening } from "@/context/ScreeningContext";
import { usePatient } from "@/context/PatientContext";

export default function OsteoporosisQuestionnaire() {
  const router = useRouter();
  const { setClinicalResult } = useScreening();
  const { patient } = usePatient();
  
  const [loading, setLoading] = useState(false);
  const [nextRoute, setNextRoute] = useState('/screening/osteoporosis/results');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fnt: 0, calcitriol: 0, uric: 0, alt: 0, bun: 0, crea: 0, fbg: 0, ldl_c: 0,
    l1_4t: 0, age: 65, hdl_c: 0, bmi: 24, ca: 0, p: 0, height: 170, ast: 0, weight: 70, calsium: 0, calcitonin: 0, as_: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("http://localhost:8000/api/analyze/osteoporosis_clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient?.patientId || "Unknown",
          ...formData
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Clinical API Error");
      
      setClinicalResult({
        status: "success",
        probability: data.confidence / 100,
        threshold: 0.50,
        result: data.prediction,
        model_name: "Osteoporosis XGBoost",
      });

      router.push(nextRoute);
    } catch (err: any) {
      setError(err.message || "Failed to process data.");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col items-center relative overflow-y-auto">
      <div className="w-full relative z-10 mb-8 flex flex-col items-center shrink-0 pt-8">
        <Activity className="w-12 h-12 text-emerald-500 mb-4" />
        <h1 className="text-3xl font-semibold tracking-tight text-white text-center">Osteoporosis Clinical Details</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-lg">Enter clinical lab values to assess osteoporosis risk.</p>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        className="glass-panel p-6 md:p-10 w-full relative z-10 mb-12"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(formData).map(key => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-gray-400 uppercase">{key}</label>
              <input 
                type="number" 
                name={key} 
                value={(formData as any)[key]} 
                onChange={handleChange} 
                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none" 
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-end items-center gap-4 border-t border-white/10 pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "I Have DEXA (Skip to Results)"}
          </button>
          
          <button 
            type="button" 
            onClick={() => router.push('/screening/osteoporosis/basic-questionnaire')}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            I Don't Have DEXA (Use Basic Clinical)
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </motion.form>
    </div>
  );
}
