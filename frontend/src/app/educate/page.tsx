"use client";

import Link from "next/link";
import { 
  ReaderIcon, 
  ArrowLeftIcon, 
  HeartFilledIcon, 
  ActivityLogIcon, 
  CheckCircledIcon, 
  DownloadIcon, 
  ChevronRightIcon,
  MagicWandIcon
} from "@radix-ui/react-icons";
import { useState } from "react";

export default function EducatePage() {
  const [activeModule, setActiveModule] = useState<string | null>("know-oa");

  const modules = [
    {
      id: "know-oa",
      icon: <ReaderIcon className="w-6 h-6" />,
      title: "Understanding Osteoarthritis & Bone Density",
      summary: "Understand the fundamentals of Osteoarthritis (OA) and progressive trabecular bone loss over time.",
      content: "Osteoarthritis is a whole-joint condition where articular cartilage cushions thin and subchondral bone remodels. When combined with osteoporosis (trabecular microarchitectural deterioration), fracture risks elevate significantly. Early screening and targeted physical conditioning preserve mobility."
    },
    {
      id: "symptoms",
      icon: <HeartFilledIcon className="w-6 h-6" />,
      title: "Recognizing Early Warning Signs",
      summary: "Learn to identify early functional signals of joint and bone degradation.",
      content: "Early symptoms often include morning stiffness lasting less than 30 minutes, crepitus on squatting, and balance hesitation. Non-invasive computer vision tracking catches compensatory gait asymmetry before permanent deformity sets in."
    },
    {
      id: "diet",
      icon: <MagicWandIcon className="w-6 h-6" />,
      title: "Nutrition & Mineral Fortification",
      summary: "Dietary strategies to support bone mineral density and reduce systemic inflammation.",
      content: "Ensure 1,000–1,200 mg daily dietary calcium combined with adequate midday sun exposure for Vitamin D3 synthesis. Anti-inflammatory foods rich in polyphenols and omega-3 fatty acids protect synovial joint health."
    },
    {
      id: "exercise",
      icon: <ActivityLogIcon className="w-6 h-6" />,
      title: "Targeted Kinetic Exercise Protocols",
      summary: "Safe weight-bearing and resistance activities to stimulate osteoblast bone formation.",
      content: "Weight-bearing exercises (brisk walking, tai chi) and progressive resistance training apply dynamic mechanical load that stimulates bone mineral deposition. Low-impact cycling and quadriceps strengthening stabilize the knee joint."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pt-24 pb-16 px-4 sm:px-6 md:px-10 max-w-6xl mx-auto">
      {/* Top Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium mb-8">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEFEA] border border-[#FFD8CC] text-[#E65100] text-xs font-semibold mb-3">
            <MagicWandIcon className="w-3.5 h-3.5" /> Patient & Community Education
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
            Joint & Bone Health Masterclass
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm md:text-base">
            Evidence-based educational modules calibrated for community health workers and patients to understand musculoskeletal preservation.
          </p>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-[#FF6B4A] hover:bg-[#E85938] text-white px-6 py-3.5 rounded-full font-semibold text-xs transition-all shadow-[0_8px_20px_-4px_rgba(255,107,74,0.35)]"
        >
          <DownloadIcon className="w-4 h-4" /> Download Education Handbook
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((mod, idx) => {
          const isActive = activeModule === mod.id;
          return (
            <div 
              key={mod.id}
              onClick={() => setActiveModule(isActive ? null : mod.id)}
              className={`cursor-pointer border rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
                isActive 
                  ? 'bg-white border-[#FF6B4A] shadow-md ring-2 ring-[#FF6B4A]/10' 
                  : 'bg-white border-[#EBE8E3] hover:border-gray-300 hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-[#FFEFEA] text-[#FF6B4A] border border-[#FFD8CC]' : 'bg-[#FAF9F6] border border-[#EBE8E3] text-gray-500'
                }`}>
                  {mod.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-[#E65100] font-semibold">Module 0{idx + 1}</span>
                    {isActive && <CheckCircledIcon className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{mod.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                    {mod.summary}
                  </p>
                  
                  {isActive && (
                    <div className="mt-5 pt-5 border-t border-[#EBE8E3] animate-fadeIn">
                      <p className="text-xs md:text-sm leading-relaxed text-gray-700">
                        {mod.content}
                      </p>
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#FF6B4A]">
                        <span>Clinical Guideline Verified</span>
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
