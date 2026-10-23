"use client";

import { useEffect, useState } from "react";
import { api, MovementLabFrame } from "@/services/api";
import { 
  PlayIcon, 
  PauseIcon, 
  TrackPreviousIcon, 
  TrackNextIcon, 
  ArrowLeftIcon, 
  ActivityLogIcon 
} from "@radix-ui/react-icons";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function MovementLab() {
  const [frames, setFrames] = useState<MovementLabFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    api.getMovementLabData("PAT-12345").then(setFrames);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && frames.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIdx((prev) => (prev + 1) % frames.length);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, frames]);

  if (frames.length === 0) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <ActivityLogIcon className="w-10 h-10 text-[#FF6B4A] animate-pulse mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Loading Kinematic Telemetry...</h2>
      </div>
    );
  }

  const currentFrame = frames[currentFrameIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-6">
        <Link href="/screening/results" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium mb-3">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Results
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          <ActivityLogIcon className="w-7 h-7 text-[#FF6B4A]" />
          Kinematic Movement Lab
        </h1>
        <p className="text-gray-600 text-sm mt-1">Biomechanical frame-by-frame analysis of gait cycle and dynamic joint symmetry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Stick Figure View */}
        <div className="lg:col-span-2 bg-white border border-[#EBE8E3] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm min-h-[460px]">
          <div className="absolute top-4 left-4 text-xs font-mono font-semibold text-gray-500 bg-[#FAF9F6] border border-[#EBE8E3] px-3 py-1 rounded-full">
            FRONTAL PLANE
          </div>
          <div className="absolute top-4 right-4 text-xs font-mono font-semibold text-gray-800 bg-[#FAF9F6] border border-[#EBE8E3] px-3 py-1 rounded-full">
            FRAME {currentFrame.frameIndex.toString().padStart(4, '0')} / {frames.length}
          </div>
          
          {/* Stick Figure */}
          <div className="relative w-64 h-96 flex flex-col items-center mt-6">
            <div className="w-8 h-8 rounded-full border-2 border-gray-400 bg-gray-100 absolute top-0" />
            <div className="w-1.5 h-32 bg-gray-400 absolute top-8" />
            <div className="w-32 h-1.5 bg-gray-300 absolute top-16" />
            <div className="w-1.5 h-24 bg-gray-300 absolute top-16 -left-16 origin-top rotate-12" />
            <div className="w-1.5 h-24 bg-gray-300 absolute top-16 left-16 origin-top -rotate-12" />
            
            <div className="w-16 h-1.5 bg-gray-400 absolute top-40" />
            
            {/* Left Leg */}
            <div 
              className="w-1.5 h-24 bg-[#FF6B4A] absolute top-40 -left-8 origin-top transition-transform duration-75"
              style={{ transform: `rotate(${Math.sin(currentFrameIdx/10) * 15}deg)` }}
            >
              <div className="w-3 h-3 rounded-full bg-[#FF6B4A] absolute -bottom-1 -left-0.5" />
              <div 
                className="w-1.5 h-24 bg-[#FF9E87] absolute top-24 origin-top transition-transform duration-75"
                style={{ transform: `rotate(${180 - currentFrame.leftKneeAngle}deg)` }}
              >
                <div className="w-3 h-3 rounded-full bg-[#FF9E87] absolute -bottom-1 -left-0.5" />
              </div>
            </div>
            
            {/* Right Leg */}
            <div 
              className="w-1.5 h-24 bg-emerald-500 absolute top-40 left-8 origin-top transition-transform duration-75"
              style={{ transform: `rotate(${Math.sin(currentFrameIdx/10 + Math.PI) * 15}deg)` }}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-1 -left-0.5" />
              <div 
                className="w-1.5 h-24 bg-emerald-400 absolute top-24 origin-top transition-transform duration-75"
                style={{ transform: `rotate(${180 - currentFrame.rightKneeAngle}deg)` }}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-400 absolute -bottom-1 -left-0.5" />
              </div>
            </div>
          </div>
          
          {/* Playback Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-[#EBE8E3] shadow-md">
            <button 
              onClick={() => setCurrentFrameIdx(0)}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <TrackPreviousIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-[#FF6B4A] text-white rounded-full flex items-center justify-center hover:bg-[#E85938] transition-colors shadow-sm"
            >
              {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setCurrentFrameIdx(frames.length - 1)}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <TrackNextIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Metrics Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Instantaneous Kinematics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-600 font-semibold mb-1">
                  <span>Left Knee Flexion</span>
                  <span className="text-[#FF6B4A] font-bold">{currentFrame.leftKneeAngle.toFixed(1)}°</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6B4A] transition-all duration-75" style={{ width: `${(currentFrame.leftKneeAngle / 180) * 100}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-gray-600 font-semibold mb-1">
                  <span>Right Knee Flexion</span>
                  <span className="text-emerald-700 font-bold">{currentFrame.rightKneeAngle.toFixed(1)}°</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${(currentFrame.rightKneeAngle / 180) * 100}%` }} />
                </div>
              </div>
              
              <div className="pt-3 border-t border-[#EBE8E3]">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600">Dynamic Symmetry</span>
                  <span className={`text-lg font-black ${currentFrame.symmetry < 85 ? "text-[#FF6B4A]" : "text-emerald-600"}`}>
                    {currentFrame.symmetry.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-[#EBE8E3] rounded-3xl p-6 shadow-sm flex-1 flex flex-col">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-4">Knee Flexion Timeline</h3>
            <div className="flex-1 min-h-[180px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={frames} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="frameIndex" stroke="#999" tick={false} />
                  <YAxis domain={[100, 160]} stroke="#999" tick={{fill: '#666', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#EBE8E3', borderRadius: '12px', color: '#18181B', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <ReferenceLine x={currentFrame.frameIndex} stroke="#FF6B4A" strokeDasharray="2 2" />
                  <Line type="monotone" dataKey="leftKneeAngle" stroke="#FF6B4A" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="rightKneeAngle" stroke="#10b981" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-600 font-medium">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#FF6B4A] rounded-full" /> Left Knee</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Right Knee</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
