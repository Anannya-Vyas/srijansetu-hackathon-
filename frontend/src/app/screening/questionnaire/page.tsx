"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Loader2, ChevronRight, User, HeartPulse, Bone, Info, AlertCircle } from "lucide-react";
import { useScreening } from "@/context/ScreeningContext";

const WOMAC_QUESTIONS = [
  { id: "p1", category: "Pain", text: "Walking on a flat surface" },
  { id: "p2", category: "Pain", text: "Going up or down stairs" },
  { id: "p3", category: "Pain", text: "At night while in bed" },
  { id: "p4", category: "Pain", text: "Sitting or lying down" },
  { id: "p5", category: "Pain", text: "Standing upright" },
  { id: "s1", category: "Stiffness", text: "After first waking up in the morning" },
  { id: "s2", category: "Stiffness", text: "After sitting, lying, or resting later in the day" },
  { id: "f1", category: "Physical Function", text: "Descending stairs" },
  { id: "f2", category: "Physical Function", text: "Ascending stairs" },
  { id: "f3", category: "Physical Function", text: "Rising from sitting" },
  { id: "f4", category: "Physical Function", text: "Standing" },
  { id: "f5", category: "Physical Function", text: "Bending to floor" },
  { id: "f6", category: "Physical Function", text: "Walking on a flat surface" },
  { id: "f7", category: "Physical Function", text: "Getting in/out of car" },
  { id: "f8", category: "Physical Function", text: "Going shopping" },
  { id: "f9", category: "Physical Function", text: "Putting on socks/stockings" },
  { id: "f10", category: "Physical Function", text: "Rising from bed" },
  { id: "f11", category: "Physical Function", text: "Taking off socks/stockings" },
  { id: "f12", category: "Physical Function", text: "Lying in bed" },
  { id: "f13", category: "Physical Function", text: "Getting in/out of bath" },
  { id: "f14", category: "Physical Function", text: "Sitting" },
  { id: "f15", category: "Physical Function", text: "Getting on/off toilet" },
  { id: "f16", category: "Physical Function", text: "Heavy domestic duties" },
  { id: "f17", category: "Physical Function", text: "Light domestic duties" }
];

export default function QuestionnairePage() {
  const router = useRouter();
  const { setClinicalResult, setMetabolicResult, resetAll } = useScreening();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    age: 65,
    height: 170, // cm
    weight: 70,  // kg
    gender: 0, 
    vas_score: 4,
    unknown_metabolic: false,
    Hypertension_treatment: 0,
    History_of_Diabetes_Mellitis: 0,
    SMOKER: 0,
    TC: 180,
    HDL: 50,
  });

  const [womacAnswers, setWomacAnswers] = useState<Record<string, number>>(
    Object.fromEntries(WOMAC_QUESTIONS.map(q => [q.id, 0]))
  );

  const handleWomacChange = (id: string, val: number) => {
    setWomacAnswers(prev => ({ ...prev, [id]: val }));
  };

  const totalWomac = useMemo(() => {
    return Object.values(womacAnswers).reduce((sum, val) => sum + val, 0);
  }, [womacAnswers]);

  const calculatedBMI = useMemo(() => {
    if (formData.height > 0) {
      return formData.weight / Math.pow(formData.height / 100, 2);
    }
    return 0;
  }, [formData.height, formData.weight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" || type === "range" || e.target.tagName === 'SELECT' ? Number(value) : value
    }));
  };

  const handleNext = () => setStep(s => s + 1);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Phase 6: Clinical Validation
    if (!formData.age || !formData.weight || !formData.height || formData.vas_score === undefined) {
      setError("Required information missing. Please fill all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    resetAll();
    
    try {
      // 1. Call Clinical Endpoint
      const clinRes = await fetch("http://localhost:8000/api/analyze/clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: formData.age,
          gender: formData.gender,
          BMI: calculatedBMI,
          womac_score: totalWomac,
          vas_score: formData.vas_score
        })
      });
      const clinData = await clinRes.json();
      if (!clinRes.ok) throw new Error(clinData.detail || "Clinical API Error");
      setClinicalResult(clinData);

      // 2. Call Metabolic Endpoint ONLY if they know their numbers
      if (!formData.unknown_metabolic) {
        try {
          const metabRes = await fetch("http://localhost:8000/api/analyze/metabolic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              AGE: formData.age,
              GENDER: formData.gender,
              BMI: calculatedBMI,
              Hypertension_treatment: formData.Hypertension_treatment,
              History_of_Diabetes_Mellitis: formData.History_of_Diabetes_Mellitis,
              SMOKER: formData.SMOKER,
              TC: formData.TC,
              HDL: formData.HDL
            })
          });
          const metabData = await metabRes.json();
          if (!metabRes.ok) throw new Error(metabData.detail || "Metabolic API Error");
          setMetabolicResult(metabData);
        } catch (metabErr) {
          console.error("Metabolic fetch failed", metabErr);
          // Continue without metabolic result
          setMetabolicResult(null);
        }
      }

      // Route to Stage 2
      router.push("/screening/joint-selection");

    } catch (err: any) {
      setError(err.message || "Failed to process data.");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col items-center relative overflow-y-auto">
      <div className="w-full relative z-10 mb-8 flex flex-col items-center shrink-0 pt-8">
        <div className="absolute right-0 top-0 mt-4 mr-4"><button type="button" onClick={() => { if(confirm('Clear current session?')) { resetAll(); window.location.reload(); } }} className="text-xs bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-md border border-white/10 transition-colors flex items-center gap-2">Start New Assessment</button></div><Activity className="w-12 h-12 text-accent mb-4" />
        <h1 className="text-3xl font-semibold tracking-tight text-white text-center">Stage 1 Assessment</h1>
        <p className="text-muted-foreground mt-2 text-center max-w-lg">Complete the clinical questionnaire to establish baseline radiographic and metabolic risk factors.</p>
        
        <div className="flex gap-2 mt-8 w-64">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-white/10'} transition-colors duration-300`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-white/10'} transition-colors duration-300`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-accent' : 'bg-white/10'} transition-colors duration-300`} />
        </div>
      </div>

      <motion.form 
        onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
        className="glass-panel p-6 md:p-10 w-full relative z-10 overflow-visible mb-12"
      >
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                <User className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-medium text-white">Demographics</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required />
                </div>
                <div className="space-y-2 relative group">
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    Sex assigned at birth
                    <Info className="w-4 h-4 text-gray-500 cursor-help" />
                  </label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required>
                    <option value={0}>Female</option>
                    <option value={1}>Male</option>
                  </select>
                  <div className="absolute top-full left-0 mt-2 p-3 bg-black/90 border border-white/10 rounded shadow-xl text-xs text-gray-300 w-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Doctor AI models were trained on historical medical datasets. This relies on sex assigned at birth to assess baseline bone density and hormonal risk factors.
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required />
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center mt-4">
                <span className="text-sm text-gray-400">Calculated BMI</span>
                <span className="text-lg font-mono text-accent">{calculatedBMI.toFixed(1)} kg/m²</span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <Bone className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-medium text-white">Clinical Symptoms</h2>
              </div>
              
              {/* VAS */}
              <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-end">
                  <label className="text-base text-white font-medium">How much does your knee hurt right now?</label>
                  <span className="text-xl font-bold text-accent">{formData.vas_score}</span>
                </div>
                <input type="range" name="vas_score" min="0" max="10" step="0.5" value={formData.vas_score} onChange={handleChange} className="w-full accent-accent cursor-pointer" />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0 = No pain</span>
                  <span>10 = Worst possible pain</span>
                </div>
              </div>

              {/* WOMAC */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-base text-white font-medium">WOMAC Assessment</label>
                  <span className="text-xs font-mono bg-accent/20 text-accent px-3 py-1 rounded-full border border-accent/30">Total: {totalWomac}/96</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">Please rate your pain, stiffness, and difficulty with the following activities in the last 48 hours. (0 = None, 4 = Extreme)</p>
                
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                  {["Pain", "Stiffness", "Physical Function"].map(category => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-sm uppercase tracking-widest text-accent font-semibold sticky top-0 bg-[#161616]/90 backdrop-blur py-2 z-10 border-b border-white/5">{category}</h3>
                      {WOMAC_QUESTIONS.filter(q => q.category === category).map(q => (
                        <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                          <span className="text-sm text-gray-300 flex-1">{q.text}</span>
                          <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleWomacChange(q.id, val)}
                                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                                  womacAnswers[q.id] === val 
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                                    : 'bg-black/50 text-gray-500 hover:bg-white/10'
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-5 h-5 text-accent" />
                  <h2 className="text-xl font-medium text-white">Metabolic Profile</h2>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
                <input 
                  type="checkbox" 
                  name="unknown_metabolic" 
                  id="unknown_metabolic"
                  checked={formData.unknown_metabolic}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/20 bg-black/50 accent-yellow-500 cursor-pointer shrink-0"
                />
                <label htmlFor="unknown_metabolic" className="text-sm text-yellow-500/90 cursor-pointer">
                  I don't know my exact bloodwork numbers. (This will skip the metabolic severity assessment, but you can still proceed with the clinical assessment).
                </label>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-300 ${formData.unknown_metabolic ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Treated for Hypertension?</label>
                  <select name="Hypertension_treatment" value={formData.Hypertension_treatment} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required={!formData.unknown_metabolic}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">History of Diabetes?</label>
                  <select name="History_of_Diabetes_Mellitis" value={formData.History_of_Diabetes_Mellitis} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required={!formData.unknown_metabolic}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Current Smoker?</label>
                  <select name="SMOKER" value={formData.SMOKER} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required={!formData.unknown_metabolic}>
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Total Cholesterol (mg/dL)</label>
                  <input type="number" name="TC" value={formData.TC} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required={!formData.unknown_metabolic} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-400">HDL Cholesterol (mg/dL)</label>
                  <input type="number" name="HDL" value={formData.HDL} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-accent focus:outline-none transition-colors" required={!formData.unknown_metabolic} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(s => s - 1)} className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full border border-transparent hover:border-white/10">
              Back
            </button>
          ) : <div />}
          
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 3 ? "Process Assessments" : "Continue"}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </motion.form>
      
      {/* Global styles for custom scrollbar hidden in globals.css, applied locally here */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}} />
    </div>
  );
}
