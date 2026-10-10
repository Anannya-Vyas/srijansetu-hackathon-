"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft } from "lucide-react";

const joints = [
  { id: "knee", label: "Knee", icon: "🦵", status: "ready", desc: "Kinematic Gait & KAM Analysis" },
  { id: "hip", label: "Hip", icon: "🧍", status: "ready", desc: "Hip OA Gait Classification" },
  { id: "shoulder", label: "Shoulder", icon: "💪", status: "ready", desc: "ROM & Kinematics" },
  { id: "hand", label: "Hand/Wrist", icon: "🖐️", status: "ready", desc: "Tremor & Dexterity" },
  { id: "spine", label: "Spine", icon: "🦴", status: "ready", desc: "Posture & Scoliosis" },
];

export default function JointSelectionPage() {
  const router = useRouter();

  const handleSelect = (jointId: string, status: string) => {
    if (status !== "ready") return;
    router.push(`/screening/camera?joint=${jointId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-12 mt-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Clinical
        </button>
        <div className="flex items-center space-x-2 text-blue-500">
          <Activity className="w-6 h-6" />
          <span className="font-semibold text-lg tracking-wide">PHASE 2: MOVEMENT</span>
        </div>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Select Joint for Assessment
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Choose the primary area of concern to initiate the AI-assisted functional movement and kinematic analysis.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {joints.map((joint, idx) => (
          <motion.div
            key={joint.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleSelect(joint.id, joint.status)}
            className={`
              relative p-6 rounded-2xl border backdrop-blur-sm cursor-pointer transition-all duration-300
              ${joint.status === 'ready' 
                ? 'border-blue-500/30 bg-blue-900/10 hover:bg-blue-800/20 hover:border-blue-400 hover:-translate-y-1' 
                : 'border-gray-800 bg-gray-900/30 opacity-60 cursor-not-allowed'}
            `}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <span className="text-6xl mb-2">{joint.icon}</span>
              <h3 className="text-2xl font-bold text-white tracking-wide">{joint.label}</h3>
              <p className="text-gray-400 text-sm">{joint.desc}</p>
              
              {joint.status === 'coming_soon' && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 py-1 px-2 rounded-full">
                  Phase 6+
                </span>
              )}
              {joint.status === 'ready' && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 py-1 px-2 rounded-full">
                  Active Model
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
