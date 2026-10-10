"use client";

import { useEffect, useState } from "react";
import { api, MovementLabFrame } from "@/services/api";
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Activity } from "lucide-react";
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
      }, 50); // ~20fps mock playback
    }
    return () => clearInterval(interval);
  }, [isPlaying, frames]);

  if (frames.length === 0) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-accent animate-pulse mb-4" />
        <h2 className="text-xl text-white">Loading Movement Data...</h2>
      </div>
    );
  }

  const currentFrame = frames[currentFrameIdx];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <Link href="/screening/results" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-accent" />
          Movement Lab
        </h1>
        <p className="text-muted-foreground mt-1">Biomechanical frame-by-frame analysis of gait cycle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Simulated Output (Hardware Integration Pending) */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col items-center justify-center relative overflow-hidden bg-black/60">
          
          <div className="absolute top-4 left-4 text-xs font-mono text-white/50 bg-black/50 px-2 py-1 rounded">
            FRONT VIEW
          </div>
          <div className="absolute top-4 right-4 text-xs font-mono text-white bg-black/50 px-2 py-1 rounded border border-white/10">
            FRAME {currentFrame.frameIndex.toString().padStart(4, '0')} / {frames.length}
          </div>
          
          {/* Mock Stick Figure (Animated via CSS transforms driven by state) */}
          <div className="relative w-64 h-96 flex flex-col items-center">
            {/* Head & Torso */}
            <div className="w-8 h-8 rounded-full border-2 border-white/50 bg-white/10 absolute top-0" />
            <div className="w-1 h-32 bg-white/50 absolute top-8" />
            {/* Arms (Static for now) */}
            <div className="w-32 h-1 bg-white/30 absolute top-16" />
            <div className="w-1 h-24 bg-white/30 absolute top-16 -left-16 origin-top rotate-12" />
            <div className="w-1 h-24 bg-white/30 absolute top-16 left-16 origin-top -rotate-12" />
            
            {/* Hips */}
            <div className="w-16 h-1 bg-white/50 absolute top-40" />
            
            {/* Left Leg */}
            <div 
              className="w-1 h-24 bg-blue-400 absolute top-40 -left-8 origin-top transition-transform duration-75"
              style={{ transform: `rotate(${Math.sin(currentFrameIdx/10) * 15}deg)` }}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500 absolute -bottom-1 -left-1" />
              {/* Lower Leg */}
              <div 
                className="w-1 h-24 bg-blue-300 absolute top-24 origin-top transition-transform duration-75"
                style={{ transform: `rotate(${180 - currentFrame.leftKneeAngle}deg)` }}
              >
                <div className="w-3 h-3 rounded-full bg-blue-400 absolute -bottom-1 -left-1" />
              </div>
            </div>
            
            {/* Right Leg */}
            <div 
              className="w-1 h-24 bg-emerald-400 absolute top-40 left-8 origin-top transition-transform duration-75"
              style={{ transform: `rotate(${Math.sin(currentFrameIdx/10 + Math.PI) * 15}deg)` }}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-1 -left-1" />
              {/* Lower Leg */}
              <div 
                className="w-1 h-24 bg-emerald-300 absolute top-24 origin-top transition-transform duration-75"
                style={{ transform: `rotate(${180 - currentFrame.rightKneeAngle}deg)` }}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-400 absolute -bottom-1 -left-1" />
              </div>
            </div>
          </div>
          
          {/* Playback Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
            <button 
              onClick={() => setCurrentFrameIdx(0)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </button>
            <button 
              onClick={() => setCurrentFrameIdx(frames.length - 1)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-time Metrics Panel */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-sm uppercase tracking-widest text-white/50 font-medium mb-4">Instantaneous Kinematics</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Left Knee Flexion</span>
                  <span className="text-blue-400 font-mono">{currentFrame.leftKneeAngle.toFixed(1)}°</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${(currentFrame.leftKneeAngle / 180) * 100}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Right Knee Flexion</span>
                  <span className="text-emerald-400 font-mono">{currentFrame.rightKneeAngle.toFixed(1)}°</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${(currentFrame.rightKneeAngle / 180) * 100}%` }} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Dynamic Symmetry</span>
                  <span className={`text-xl font-medium ${currentFrame.symmetry < 85 ? "text-orange-400" : "text-white"}`}>
                    {currentFrame.symmetry.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6 flex-1 flex flex-col">
            <h3 className="text-sm uppercase tracking-widest text-white/50 font-medium mb-4">Knee Flexion Timeline</h3>
            <div className="flex-1 min-h-[200px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={frames} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="frameIndex" stroke="#666" tick={false} />
                  <YAxis domain={[100, 160]} stroke="#666" tick={{fill: '#999', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                  />
                  {/* Playhead Reference Line */}
                  <ReferenceLine x={currentFrame.frameIndex} stroke="#fff" strokeOpacity={0.5} />
                  <Line type="monotone" dataKey="leftKneeAngle" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="rightKneeAngle" stroke="#10b981" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/60">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm" /> Left Knee</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Right Knee</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

