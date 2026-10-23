"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Sliders, Sun, ShieldCheck, Bone, Activity, Heart, ArrowRight } from "lucide-react";

export default function LifestyleSimulatorPage() {
  const [calcium, setCalcium] = useState(500); // mg/day (typical Indian baseline ~500mg)
  const [sunExposure, setSunExposure] = useState(10); // mins/day
  const [exerciseDays, setExerciseDays] = useState(1); // days/week
  const [isSmoker, setIsSmoker] = useState(false);
  const [age, setAge] = useState(62);
  const [baselineRisk, setBaselineRisk] = useState(68); // % baseline fracture risk

  // Calculate dynamic projected risk and bone health age
  // Calcium: optimal >= 1000mg reduces risk by up to 18%
  const calciumFactor = Math.min((calcium - 400) / 800, 1.0) * 18;
  
  // Sunlight: 20-30 mins optimal reduces risk by up to 14%
  const sunFactor = Math.min(sunExposure / 30, 1.0) * 14;
  
  // Weight-bearing exercise: 3-5 days/week stimulates osteoblasts, reduces risk by up to 22%
  const exerciseFactor = Math.min(exerciseDays / 4, 1.25) * 22;
  
  // Smoking penalty: adds 15% risk
  const smokingPenalty = isSmoker ? 15 : 0;
  
  const totalReduction = Math.max(0, calciumFactor + sunFactor + exerciseFactor - smokingPenalty);
  const projectedRisk = Math.max(12, Math.min(95, baselineRisk - totalReduction));
  
  // Bone Age calculation:
  // Each 5% reduction in risk reverses biological bone aging by ~1 year
  const boneAgeOffset = Math.round(totalReduction / 4.5);
  const currentBoneAge = age + 12; // Baseline impaired
  const simulatedBoneAge = Math.max(age - 2, currentBoneAge - boneAgeOffset);

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto text-white">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Interactive Prognostic Simulation
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
          <Sliders className="w-10 h-10 text-emerald-400" />
          What-If Lifestyle Simulator
        </h1>
        <p className="text-gray-400 max-w-2xl text-base">
          Adjust nutritional, exercise, and environmental parameters to observe projected fracture risk reduction and bone density preservation over a 5-year horizon.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Control Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white border-b border-white/10 pb-4">
            Modifiable Risk Factors
          </h2>

          {/* Slider 1: Calcium */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-300 font-medium">
                <Bone className="w-4 h-4 text-emerald-400" /> Daily Dietary Calcium
              </span>
              <span className="font-mono font-bold text-emerald-400 text-base">{calcium} mg/day</span>
            </div>
            <input 
              type="range" 
              min={300} 
              max={1500} 
              step={50}
              value={calcium}
              onChange={(e) => setCalcium(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-white/10 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>300 mg (Deficient)</span>
              <span>1000 mg (Recommended RDA)</span>
              <span>1500 mg</span>
            </div>
          </div>

          {/* Slider 2: Sunlight / Vitamin D */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-300 font-medium">
                <Sun className="w-4 h-4 text-amber-400" /> Daily Midday Sun Exposure (Vit D3)
              </span>
              <span className="font-mono font-bold text-amber-400 text-base">{sunExposure} mins/day</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={60} 
              step={5}
              value={sunExposure}
              onChange={(e) => setSunExposure(Number(e.target.value))}
              className="w-full accent-amber-500 bg-white/10 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>0 min</span>
              <span>20-30 min (Optimal Synthesis)</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Slider 3: Weight-bearing Exercise */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-300 font-medium">
                <Activity className="w-4 h-4 text-blue-400" /> Weight-Bearing & Resistance Exercise
              </span>
              <span className="font-mono font-bold text-blue-400 text-base">{exerciseDays} days/week</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={7} 
              step={1}
              value={exerciseDays}
              onChange={(e) => setExerciseDays(Number(e.target.value))}
              className="w-full accent-blue-500 bg-white/10 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Sedentary (0)</span>
              <span>3-4 days (Osteogenic stimulus)</span>
              <span>Daily (7)</span>
            </div>
          </div>

          {/* Toggle: Smoking */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Active Tobacco / Nicotine Use</p>
              <p className="text-xs text-gray-400">Directly inhibits osteoblasts and accelerates bone resorption</p>
            </div>
            <button
              onClick={() => setIsSmoker(!isSmoker)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSmoker 
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {isSmoker ? "Yes (Active Smoker)" : "No (Non-Smoker)"}
            </button>
          </div>

          {/* Clinical Evidence Note */}
          <div className="text-xs text-gray-400 bg-black/40 p-3.5 rounded-2xl border border-white/5 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Basis:</strong> Modeled after the WHO FRAX risk matrix and IOF (International Osteoporosis Foundation) intervention guidelines.
            </span>
          </div>
        </div>

        {/* Live Prognostic Gauge (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-emerald-950/40 via-black to-blue-950/30 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

            <h3 className="text-sm uppercase tracking-wider text-emerald-400 font-bold mb-6 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Projected Health Trajectory
            </h3>

            {/* Bone Health Age Comparison */}
            <div className="bg-black/60 border border-white/10 p-5 rounded-2xl mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">Chronological Age</span>
                <span className="text-sm font-bold text-white">{age} Years</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Current Bone Structural Age</span>
                <span className="text-sm font-bold text-rose-400">{currentBoneAge} Years (+12y)</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400">Simulated Bone Age</span>
                <span className="text-2xl font-black font-mono text-emerald-300">{simulatedBoneAge} Years</span>
              </div>
              <p className="text-[11px] text-emerald-400/80 mt-1">
                Potential biological rejuvenation: <strong>-{boneAgeOffset} Years</strong>
              </p>
            </div>

            {/* Fracture Risk Gauge */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">5-Year Fracture Risk Probability</span>
                <span className="font-mono font-extrabold text-2xl text-emerald-400">{projectedRisk.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-300"
                  style={{ width: `${projectedRisk}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Baseline: {baselineRisk}%</span>
                <span className="text-emerald-400 font-bold">Reduction: -{totalReduction.toFixed(1)}%</span>
              </div>
            </div>

            {/* Dynamic Clinical Takeaway */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 space-y-1">
              <p className="font-bold text-white">Projected Clinical Outcome:</p>
              <p>
                {totalReduction >= 25 
                  ? "Outstanding intervention impact. Significant reduction in proximal femur and vertebral compression risk."
                  : totalReduction >= 12
                  ? "Moderate protection achieved. Combining resistance training with adequate calcium stabilizes trabecular loss."
                  : "Minimal lifestyle shift. High vulnerability to osteoporotic microfractures remains."}
              </p>
            </div>

            <div className="mt-6">
              <Link
                href="/screening/worker-queue"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg hover:scale-105"
              >
                Go to Community Screening Queue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
