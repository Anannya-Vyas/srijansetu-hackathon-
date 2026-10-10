"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { useScreening } from "@/context/ScreeningContext";

export default function BasicQuestionnaire() {
  const router = useRouter();
  const { setClinicalResult } = useScreening();
  const [error, setError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Age: '', Gender: '', Race_Ethnicity: '', Body_Weight: 'Normal', Calcium_Intake: 'Adequate',
    Vitamin_D_Intake: 'Sufficient', Physical_Activity: 'Active', Smoking: 'No', Alcohol_Consumption: 'None',
    Hormonal_Changes: 'Normal', Family_History: 'No', Medical_Conditions: 'None', Medications: 'None', Prior_Fractures: 'No'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/analyze/osteoporosis_basic_clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Age: Number(formData.Age),
          Smoking: formData.Smoking,
          Physical_Activity: formData.Physical_Activity,
          Medications: formData.Medications,
          Vitamin_D_Intake: formData.Vitamin_D_Intake,
          Hormonal_Changes: formData.Hormonal_Changes,
          Gender: formData.Gender,
          Body_Weight: formData.Body_Weight,
          Prior_Fractures: formData.Prior_Fractures,
          Alcohol_Consumption: formData.Alcohol_Consumption
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to analyze basic clinical data");
      
      setClinicalResult({
        status: "success",
        probability: data.confidence / 100,
        threshold: 0.50,
        result: data.prediction,
        model_name: "10-Feature Clinical Ensemble"
      });
      
      router.push("/screening/osteoporosis/xray");
    } catch (err: any) {
      setError(err.message || "Failed to submit form.");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col items-center relative overflow-y-auto">
      <div className="w-full relative z-10 mb-8 flex flex-col items-center shrink-0 pt-8">
        <Activity className="w-12 h-12 text-emerald-500 mb-4" />
        <h1 className="text-3xl font-semibold tracking-tight text-white text-center">General Clinical Details</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-lg">Please fill out your basic medical history prior to X-Ray classification.</p>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        className="glass-panel p-6 md:p-10 w-full relative z-10 mb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Age</label>
            <input required type="number" name="Age" value={formData.Age} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Gender</label>
            <select required name="Gender" value={formData.Gender} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option value="">Select</option><option>Male</option><option>Female</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Race/Ethnicity</label>
            <input required type="text" name="Race_Ethnicity" value={formData.Race_Ethnicity} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Body Weight</label>
            <select name="Body_Weight" value={formData.Body_Weight} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>Underweight</option><option>Normal</option><option>Overweight</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Calcium Intake</label>
            <select name="Calcium_Intake" value={formData.Calcium_Intake} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>Low</option><option>Adequate</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Vitamin D Intake</label>
            <select name="Vitamin_D_Intake" value={formData.Vitamin_D_Intake} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>Insufficient</option><option>Sufficient</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Physical Activity</label>
            <select name="Physical_Activity" value={formData.Physical_Activity} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>Sedentary</option><option>Active</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Smoking</label>
            <select name="Smoking" value={formData.Smoking} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>No</option><option>Yes</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Alcohol Consumption</label>
            <select name="Alcohol_Consumption" value={formData.Alcohol_Consumption} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>None</option><option>Moderate</option><option>High</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Hormonal Changes</label>
            <select name="Hormonal_Changes" value={formData.Hormonal_Changes} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>Normal</option><option>Postmenopausal</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Family History</label>
            <select name="Family_History" value={formData.Family_History} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>No</option><option>Yes</option></select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-400 uppercase">Prior Fractures</label>
            <select name="Prior_Fractures" value={formData.Prior_Fractures} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none"><option>No</option><option>Yes</option></select>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-400 uppercase">Medical Conditions</label>
            <input required type="text" name="Medical_Conditions" value={formData.Medical_Conditions} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-gray-400 uppercase">Medications</label>
            <input required type="text" name="Medications" value={formData.Medications} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>

        <div className="mt-8 flex justify-end items-center border-t border-white/10 pt-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to X-Ray"}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
