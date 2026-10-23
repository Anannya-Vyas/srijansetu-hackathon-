"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  MagicWandIcon, 
  MixerHorizontalIcon, 
  SunIcon, 
  LockClosedIcon, 
  LayersIcon, 
  ActivityLogIcon, 
  HeartFilledIcon, 
  ArrowRightIcon 
} from "@radix-ui/react-icons";

export default function LifestyleSimulatorPage() {
  const [calcium, setCalcium] = useState(500); // mg/day (typical Indian baseline ~500mg)
  const [sunExposure, setSunExposure] = useState(10); // mins/day
  const [exerciseDays, setExerciseDays] = useState(1); // days/week
  const [isSmoker, setIsSmoker] = useState(false);
  const [age, setAge] = useState(62);
  const [baselineRisk, setBaselineRisk] = useState(68); // % baseline fracture risk

  // Calculate dynamic projected risk and bone health age
  const calciumFactor = Math.min((calcium - 400) / 800, 1.0) * 18;
  const sunFactor = Math.min(sunExposure / 30, 1.0) * 14;
  const exerciseFactor = Math.min(exerciseDays / 4, 1.25) * 22;
  const smokingPenalty = isSmoker ? 15 : 0;
  
  const totalReduction = Math.max(0, calciumFactor + sunFactor + exerciseFactor - smokingPenalty);
  const projectedRisk = Math.max(12, Math.min(95, baselineRisk - totalReduction));
  
  const boneAgeOffset = Math.round(totalReduction / 4.5);
  const currentBoneAge = age + 12; // Baseline impaired
  const simulatedBoneAge = Math.max(age - 2, currentBoneAge - boneAgeOffset);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Home
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEFEA] text-[#E65100] border border-[#FFD8CC]">
          <MagicWandIcon className="w-3.5 h-3.5" /> Interactive Prognostic Simulation
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
          What-If Lifestyle Simulator
        </h1>
        <p className="text-gray-600 max-w-2xl text-sm md:text-base">
          Adjust nutritional, exercise, and environmental parameters to observe projected fracture risk reduction and bone density preservation over a 5-year horizon.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Sliders Control Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6 bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)]">
          <h2 className="text-lg font-bold text-gray-900 border-b border-[#EBE8E3] pb-4 flex items-center gap-2">
            <MixerHorizontalIcon className="w-5 h-5 text-[#FF6B4A]" /> Modifiable Risk Factors
          </h2>

          {/* Slider 1: Calcium */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-700 font-semibold">
                <LayersIcon className="w-4 h-4 text-[#FF6B4A]" /> Daily Dietary Calcium
              </span>
              <span className="font-bold text-[#FF6B4A] text-base">{calcium} mg/day</span>
            </div>
            <input 
              type="range" 
              min={300} 
              max={1500} 
              step={50}
              value={calcium}
              onChange={(e) => setCalcium(Number(e.target.value))}
              className="w-full accent-[#FF6B4A] bg-gray-100 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>300 mg (Deficient)</span>
              <span>1,000 mg (Recommended RDA)</span>
              <span>1,500 mg</span>
            </div>
          </div>

          {/* Slider 2: Sunlight / Vitamin D */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-700 font-semibold">
                <SunIcon className="w-4 h-4 text-amber-500" /> Daily Midday Sun Exposure (Vit D3)
              </span>
              <span className="font-bold text-amber-600 text-base">{sunExposure} mins/day</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={60} 
              step={5}
              value={sunExposure}
              onChange={(e) => setSunExposure(Number(e.target.value))}
              className="w-full accent-amber-500 bg-gray-100 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>0 min</span>
              <span>20-30 min (Optimal Synthesis)</span>
              <span>60 min</span>
            </div>
          </div>

          {/* Slider 3: Weight-bearing Exercise */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-gray-700 font-semibold">
                <ActivityLogIcon className="w-4 h-4 text-emerald-600" /> Weight-Bearing & Resistance Exercise
              </span>
              <span className="font-bold text-emerald-600 text-base">{exerciseDays} days/week</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={7} 
              step={1}
              value={exerciseDays}
              onChange={(e) => setExerciseDays(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-gray-100 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>Sedentary (0)</span>
              <span>3-4 days (Osteogenic stimulus)</span>
              <span>Daily (7)</span>
            </div>
          </div>

          {/* Toggle: Smoking */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF9F6] border border-[#EBE8E3]">
            <div>
              <p className="text-sm font-bold text-gray-900">Active Tobacco / Nicotine Use</p>
              <p className="text-xs text-gray-500">Directly inhibits osteoblasts and accelerates bone resorption</p>
            </div>
            <button
              onClick={() => setIsSmoker(!isSmoker)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                isSmoker 
                  ? "bg-rose-50 text-rose-700 border border-rose-200" 
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {isSmoker ? "Yes (Active Smoker)" : "No (Non-Smoker)"}
            </button>
          </div>

          {/* Clinical Evidence Note */}
          <div className="text-xs text-gray-600 bg-[#FAF9F6] p-4 rounded-2xl border border-[#EBE8E3] flex items-start gap-2.5">
            <LockClosedIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Basis:</strong> Modeled after the WHO FRAX risk matrix and IOF (International Osteoporosis Foundation) intervention guidelines.
            </span>
          </div>
        </div>

        {/* Live Prognostic Gauge (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <h3 className="text-xs uppercase tracking-wider text-[#FF6B4A] font-bold mb-6 flex items-center gap-2">
              <HeartFilledIcon className="w-4 h-4 text-[#FF6B4A]" /> Projected Health Trajectory
            </h3>

            {/* Bone Health Age Comparison */}
            <div className="bg-[#FAF9F6] border border-[#EBE8E3] p-5 rounded-2xl mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-500 font-medium">Chronological Age</span>
                <span className="text-sm font-bold text-gray-900">{age} Years</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 font-medium">Current Bone Structural Age</span>
                <span className="text-sm font-bold text-rose-600">{currentBoneAge} Years (+12y)</span>
              </div>
              <div className="pt-3 border-t border-[#EBE8E3] flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-700">Simulated Bone Age</span>
                <span className="text-2xl font-black text-emerald-600">{simulatedBoneAge} Years</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                Potential biological rejuvenation: <strong>-{boneAgeOffset} Years</strong>
              </p>
            </div>

            {/* Fracture Risk Gauge */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-semibold">5-Year Fracture Risk Probability</span>
                <span className="font-black text-2xl text-[#FF6B4A]">{projectedRisk.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#FF6B4A] transition-all duration-300"
                  style={{ width: `${projectedRisk}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Baseline: {baselineRisk}%</span>
                <span className="text-emerald-600 font-bold">Reduction: -{totalReduction.toFixed(1)}%</span>
              </div>
            </div>

            {/* Dynamic Clinical Takeaway */}
            <div className="p-4 rounded-2xl bg-[#FFF8F6] border border-[#FFD8CC] text-xs text-gray-700 space-y-1">
              <p className="font-bold text-gray-900">Projected Clinical Outcome:</p>
              <p className="leading-relaxed">
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
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold text-sm transition-all shadow-[0_8px_20px_-4px_rgba(255,107,74,0.35)] hover:-translate-y-0.5"
              >
                Go to Community Screening Queue <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
