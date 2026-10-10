"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Activity } from "lucide-react";
import { api } from "@/services/api";
import { useScreening } from "@/context/ScreeningContext";

const STAGES = [
  "Video uploaded",
  "Pose detected",
  "Skeleton extracted",
  "Gait features calculated",
  "AI screening in progress",
  "Assessment ready"
];

export default function AnalyzePage() {
  const router = useRouter();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const { tempCameraAngles, setCameraResult, selectedJoint } = useScreening();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const runAnalysis = async () => {
      try {
        if (!tempCameraAngles || Object.keys(tempCameraAngles).length === 0) {
          throw new Error("No camera data found. Please run the Camera Assessment first.");
        }

        // Mock the UI progression quickly
        for (let i = 0; i < STAGES.length - 1; i++) {
          if (!isMounted) return;
          setCurrentStageIndex(i);
          await new Promise(r => setTimeout(r, 600)); // 600ms per fake step
        }
        
        // Wait for actual API response at the AI step
        if (!isMounted) return;
        // Send payload directly - tempCameraAngles already has the correct shape:
        // { left_knee_angles, right_knee_angles } for knee
        // { joint_angles: {...} } for everything else
        const cameraRes = await fetch(`http://localhost:8000/api/analyze/camera/${selectedJoint || "knee"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedJoint === "knee" ? tempCameraAngles : { joint_angles: tempCameraAngles })
        });
        
        if (!cameraRes.ok) {
          let errData: any;
          try { errData = await cameraRes.json(); } catch { errData = {}; }
          const detail = errData.detail;
          const msg = typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? `Validation error: ${detail.map((d: any) => d.msg).join(", ")}`
              : `Server error ${cameraRes.status}`;
          throw new Error(msg);
        }
        
        const data = await cameraRes.json();
        
        if (!isMounted) return;
        setCurrentStageIndex(STAGES.length - 1);
        
        setCameraResult({
          status: "success",
          // Handle both old-style (knee/hip) and new-style (hand/shoulder/spine) response fields
          probability: data.probability ?? data.camera_risk ?? 0.5,
          threshold: data.threshold ?? 0.5,
          result: data.result ?? data.camera_class ?? "Assessment complete",
          model_name: data.assessment_type === "movement_screening"
            ? `${selectedJoint}_movement_screening`
            : (selectedJoint === 'hip' ? "Model_C_Hip_RandomForest" : "Model_Stage2_Camera_RF"),
          evidence: data.evidence ?? []
        });
        
        setTimeout(() => {
          if (isMounted) router.push("/screening/imu");
        }, 1000);

      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to analyze movement data.");
        }
      }
    };
    
    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [tempCameraAngles, setCameraResult, router]);

  return (
    <div className="p-8 max-w-2xl mx-auto h-full flex flex-col items-center justify-center">
      
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-6 relative">
          <Activity className="w-10 h-10 text-accent relative z-10" />
          <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Analyzing Movement</h1>
        <p className="text-muted-foreground">Running Dual-Engine AI assessment on biomechanical data...</p>
      </div>

      <div className="w-full glass-panel p-8">
        <div className="space-y-6">
          {STAGES.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;
            const isPending = index > currentStageIndex;
            
            return (
              <motion.div 
                key={stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 ${isPending ? 'text-muted-foreground' : 'text-white'}`}
              >
                <div className="w-6 flex justify-center">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/20" />
                  )}
                </div>
                <span className={`text-lg ${isActive ? 'font-medium text-accent animate-pulse' : ''}`}>
                  {stage}
                </span>
              </motion.div>
            );
          })}
        </div>
        
        {error && (
          <div className="mt-8 p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-center font-medium">
            {error}
          </div>
        )}
      </div>
      
    </div>
  );
}

