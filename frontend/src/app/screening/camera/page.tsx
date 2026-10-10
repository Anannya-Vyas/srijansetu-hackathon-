"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera as CameraIcon, AlertCircle, Loader2, Play, CheckCircle2, ChevronRight } from "lucide-react";
import { PoseLandmarker, HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useScreening } from "@/context/ScreeningContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";

// ─── Angle helpers ─────────────────────────────────────────────────────────

function calcAngle(a: any, b: any, c: any): number {
  const ba = [a.x - b.x, a.y - b.y, a.z - b.z];
  const bc = [c.x - b.x, c.y - b.y, c.z - b.z];
  const dot = ba[0]*bc[0] + ba[1]*bc[1] + ba[2]*bc[2];
  const magBA = Math.sqrt(ba[0]**2 + ba[1]**2 + ba[2]**2);
  const magBC = Math.sqrt(bc[0]**2 + bc[1]**2 + bc[2]**2);
  const cos = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cos) * (180 / Math.PI);
}


function extractHandAngles(hands: any[][], stepId: string, buf: Record<string, number[]>) {
  const push = (key: string, val: number) => { if (!buf[key]) buf[key] = []; buf[key].push(val); };
  
  const lms = hands[0];
  if (!lms) return;

  if (stepId === "hand_a") {
    push("hand_a_Index", calcAngle(lms[5], lms[6], lms[7]));
    push("hand_a_Middle", calcAngle(lms[9], lms[10], lms[11]));
    push("hand_a_Ring", calcAngle(lms[13], lms[14], lms[15]));
    push("hand_a_Little", calcAngle(lms[17], lms[18], lms[19]));
    push("hand_a_Thumb", calcAngle(lms[2], lms[3], lms[4]));
  }

  if (stepId === "hand_b") {
    push("hand_b_Thumb_Index", calcDist(lms[4], lms[8]));
    push("hand_b_Thumb_Middle", calcDist(lms[4], lms[12]));
    push("hand_b_Thumb_Ring", calcDist(lms[4], lms[16]));
    push("hand_b_Thumb_Little", calcDist(lms[4], lms[20]));
  }
}

function calcDist(a: any, b: any): number {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
}

// ─── Joint step definitions ────────────────────────────────────────────────

type Step = {
  id: string;            // channel prefix (e.g. "shoulder_a")
  title: string;
  instruction: string;
  duration: number;      // ms
  keys: string[];        // exact backend channel names populated in this step
};

const JOINT_STEPS: Record<string, { label: string; color: string; steps: Step[] }> = {
  knee: {
    label: "Knee", color: "text-blue-400",
    steps: [
      {
        id: "knee_walk", title: "Walking Gait Test",
        instruction: "Step back so your FULL body is visible from head to toe (sideways profile). Walk slowly across the frame from left to right.",
        duration: 6000,
        keys: ["left_knee_angles", "right_knee_angles"],
      },
      {
        id: "knee_squat", title: "Squat Assessment",
        instruction: "Face the camera. Slowly bend your knees (shallow squat) and return to standing. Repeat continuously.",
        duration: 5000,
        keys: ["left_knee_angles", "right_knee_angles"],
      },
    ],
  },
  hip: {
    label: "Hip", color: "text-purple-400",
    steps: [
      {
        id: "hip_walk", title: "Hip Gait Analysis",
        instruction: "Step back so your FULL body is visible sideways. Walk slowly across the frame — the AI tracks your hip, pelvis, and knee trajectories.",
        duration: 8000,
        keys: ["LHipAngles_X", "RHipAngles_X", "LKneeAngles_X", "RKneeAngles_X"],
      },
      {
        id: "hip_lateral", title: "Hip Lateral Flexion",
        instruction: "Stand facing the camera. Slowly tilt your body to the left, then to the right. Keep your arms at your sides.",
        duration: 6000,
        keys: ["LPelvisAngles_X", "RPelvisAngles_X", "LHipAngles_Y", "RHipAngles_Y"],
      },
    ],
  },
  shoulder: {
    label: "Shoulder", color: "text-emerald-400",
    steps: [
      {
        id: "shoulder_a", title: "Test A — Bilateral Arm Raise",
        instruction: "Face the camera. Raise BOTH arms above your head, then lower them. Repeat slowly and fully.",
        duration: 6000,
        keys: ["shoulder_a_L_Shoulder_Torso", "shoulder_a_R_Shoulder_Torso"],
      },
      {
        id: "shoulder_b", title: "Test B — Single Arm Raise",
        instruction: "Raise your LEFT arm as high as possible, then lower. Then raise your RIGHT arm as high as possible. Hold each for 2 seconds.",
        duration: 6000,
        keys: ["shoulder_b_L_Shoulder_Torso", "shoulder_b_R_Shoulder_Torso"],
      },
    ],
  },
  hand: {
    label: "Hand / Wrist", color: "text-orange-400",
    steps: [
      {
        id: "hand_a", title: "Test A — Finger Flexion",
        instruction: "Hold one hand open in front of the camera. Fully open and close your fingers repeatedly. Keep your hand centered in the frame.",
        duration: 6000,
        keys: ["hand_a_Index", "hand_a_Middle", "hand_a_Ring", "hand_a_Little", "hand_a_Thumb"],
      },
      {
        id: "hand_b", title: "Test B — Thumb Opposition",
        instruction: "Touch your thumb tip to each fingertip one by one (index → middle → ring → little), then reverse. Repeat continuously.",
        duration: 6000,
        keys: ["hand_b_Thumb_Index", "hand_b_Thumb_Middle", "hand_b_Thumb_Ring", "hand_b_Thumb_Little"],
      },
    ],
  },
  spine: {
    label: "Spine", color: "text-rose-400",
    steps: [
      {
        id: "spine_a", title: "Test A — Forward Flexion",
        instruction: "Face the camera. Slowly bend forward as far as comfortable, then stand upright. Repeat 3–4 times.",
        duration: 6000,
        keys: ["spine_a_Torso_Flexion"],
      },
      {
        id: "spine_b", title: "Test B — Lateral Side Bend",
        instruction: "Stand facing the camera. Slowly bend your torso to the LEFT, return to center, then bend to the RIGHT. Repeat.",
        duration: 6000,
        keys: ["spine_b_Lateral_Bend"],
      },
    ],
  },
};

// ─── Component ─────────────────────────────────────────────────────────────

function CameraAssessmentInner() {
  const { setTempCameraAngles, setSelectedJoint } = useScreening();
  const router = useRouter();
  const searchParams = useSearchParams();
  const joint = searchParams.get("joint") || "knee";
  const config = JOINT_STEPS[joint] ?? JOINT_STEPS.knee;
  const steps = config.steps;

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const isRecordingRef = useRef(false);
  const currentStepIdRef = useRef<string>("");
  const allBuffersRef = useRef<Record<string, number[]>>({});

  const [isReady, setIsReady] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "countdown" | "recording" | "done" | "finished">("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentStep = steps[currentStepIdx];
  const isLastStep = currentStepIdx === steps.length - 1;

  useEffect(() => {
    setSelectedJoint(joint);
  }, [joint, setSelectedJoint]);

  useEffect(() => {
    if (currentStep && currentStep.instruction) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(currentStep.instruction);
        msg.rate = 0.95;
        window.speechSynthesis.speak(msg);
      }
    }
  }, [currentStepIdx, currentStep]);

  // ── MediaPipe ───────────────────────────────────────────────────────────
  useEffect(() => {
    let animationFrameId: number;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        if (joint === "hand") {
          const handLm = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
          });
          handLandmarkerRef.current = handLm;
        } else {
          const poseLm = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          });
          poseLandmarkerRef.current = poseLm;
        }
        setIsReady(true);

        const draw = () => {
          const video = webcamRef.current?.video;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState >= 2) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d")!;
            // Mirror
            ctx.save(); ctx.scale(-1,1); ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height); ctx.restore();

            const timestamp = performance.now();
            
            if (joint === "hand" && handLandmarkerRef.current) {
              const result = handLandmarkerRef.current.detectForVideo(video, timestamp);
              if (result.landmarks?.length > 0) {
                if (isRecordingRef.current) {
                  extractHandAngles(result.landmarks, currentStepIdRef.current, allBuffersRef.current);
                  setFrameCount(f => f + 1);
                }
                const W = canvas.width; const H = canvas.height;
                ctx.strokeStyle = "rgba(249,115,22,0.8)"; // Orange for hand
                ctx.lineWidth = 2;
                const HAND_CONN = [
                  [0,1],[1,2],[2,3],[3,4],
                  [0,5],[5,6],[6,7],[7,8],
                  [5,9],[9,10],[10,11],[11,12],
                  [9,13],[13,14],[14,15],[15,16],
                  [13,17],[17,18],[18,19],[19,20],
                  [0,17]
                ];
                for (const lms of result.landmarks) {
                  for (const [a,b] of HAND_CONN) {
                    if (!lms[a] || !lms[b]) continue;
                    ctx.beginPath();
                    ctx.moveTo((1 - lms[a].x) * W, lms[a].y * H);
                    ctx.lineTo((1 - lms[b].x) * W, lms[b].y * H);
                    ctx.stroke();
                  }
                  for (const pt of lms) {
                    ctx.beginPath();
                    ctx.arc((1 - pt.x) * W, pt.y * H, 4, 0, 2*Math.PI);
                    ctx.fillStyle = "rgba(255,255,255,0.9)";
                    ctx.fill();
                  }
                }
              }
            } else if (poseLandmarkerRef.current) {
              const result = poseLandmarkerRef.current.detectForVideo(video, timestamp);
              if (result.landmarks?.length > 0) {
                const lms = result.landmarks[0];

                if (isRecordingRef.current) {
                  extractAngles(lms, currentStepIdRef.current, allBuffersRef.current);
                  setFrameCount(f => f + 1);
                }

                // Draw skeleton: connections
                const W = canvas.width; const H = canvas.height;
                const CONNECTIONS = [
                  [11,12],[11,13],[13,15],[12,14],[14,16], // arms
                  [11,23],[12,24],[23,24], // torso
                  [23,25],[25,27],[24,26],[26,28], // legs
                  [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8], // face
                ];
                ctx.strokeStyle = "rgba(99,179,237,0.6)";
                ctx.lineWidth = 2;
                for (const [a,b] of CONNECTIONS) {
                  if (!lms[a] || !lms[b]) continue;
                  ctx.beginPath();
                  ctx.moveTo((1 - lms[a].x) * W, lms[a].y * H);
                  ctx.lineTo((1 - lms[b].x) * W, lms[b].y * H);
                  ctx.stroke();
                }
                for (let i = 0; i < lms.length; i++) {
                  const pt = lms[i];
                  ctx.beginPath();
                  ctx.arc((1 - pt.x) * W, pt.y * H, i === 0 ? 7 : 4, 0, 2*Math.PI);
                  ctx.fillStyle = "rgba(59,130,246,0.9)";
                  ctx.fill();
                }
              }
            }
          }
          animationFrameId = requestAnimationFrame(draw);
        };
        draw();
      } catch (err) {
        console.error("MediaPipe error:", err);
        setError("Failed to load pose model. Please refresh.");
      }
    };

    setTimeout(init, 500);
    return () => { cancelAnimationFrame(animationFrameId); poseLandmarkerRef.current?.close(); };
  }, [joint]);

  // ── Per-joint angle extraction ──────────────────────────────────────────
  function extractAngles(lms: any[], stepId: string, buf: Record<string, number[]>) {
    const push = (key: string, val: number) => { if (!buf[key]) buf[key] = []; buf[key].push(val); };

    if (stepId.startsWith("knee")) {
      push("left_knee_angles", calcAngle(lms[23], lms[25], lms[27]));
      push("right_knee_angles", calcAngle(lms[24], lms[26], lms[28]));
    }

    if (stepId === "hip_walk") {
      // Hip angle: Shoulder→Hip→Knee
      push("LHipAngles_X", calcAngle(lms[11], lms[23], lms[25]));
      push("RHipAngles_X", calcAngle(lms[12], lms[24], lms[26]));
      // Knee for hip gait
      push("LKneeAngles_X", calcAngle(lms[23], lms[25], lms[27]));
      push("RKneeAngles_X", calcAngle(lms[24], lms[26], lms[28]));
      // Pelvis proxy: difference in hip heights
      const pelvisAngle = Math.abs(lms[23].y - lms[24].y) * 180;
      push("LPelvisAngles_X", pelvisAngle); push("RPelvisAngles_X", pelvisAngle);
      // Y/Z fill
      push("LHipAngles_Y", calcAngle(lms[23], lms[25], lms[27]));
      push("RHipAngles_Y", calcAngle(lms[24], lms[26], lms[28]));
      push("LHipAngles_Z", 0); push("RHipAngles_Z", 0);
      push("LPelvisAngles_Y", 0); push("RPelvisAngles_Y", 0);
      push("LPelvisAngles_Z", 0); push("RPelvisAngles_Z", 0);
    }

    if (stepId === "hip_lateral") {
      const lateralAngle = Math.abs(lms[11].y - lms[12].y) * 180;
      push("LPelvisAngles_X", lateralAngle); push("RPelvisAngles_X", lateralAngle);
      push("LHipAngles_Y", calcAngle(lms[11], lms[23], lms[25]));
      push("RHipAngles_Y", calcAngle(lms[12], lms[24], lms[26]));
      push("LHipAngles_Z", 0); push("RHipAngles_Z", 0);
      push("LPelvisAngles_Y", 0); push("RPelvisAngles_Y", 0);
      push("LPelvisAngles_Z", 0); push("RPelvisAngles_Z", 0);
    }

    if (stepId === "shoulder_a") {
      // Both arms: elbow-shoulder-hip angle
      push("shoulder_a_L_Shoulder_Torso", calcAngle(lms[13], lms[11], lms[23]));
      push("shoulder_a_R_Shoulder_Torso", calcAngle(lms[14], lms[12], lms[24]));
    }

    if (stepId === "shoulder_b") {
      push("shoulder_b_L_Shoulder_Torso", calcAngle(lms[13], lms[11], lms[23]));
      push("shoulder_b_R_Shoulder_Torso", calcAngle(lms[14], lms[12], lms[24]));
    }

    if (stepId === "hand_a") {
      // Wrist flexion proxy: elbow-wrist-pinky
      const wristL = calcAngle(lms[13], lms[15], lms[17]);
      const wristR = calcAngle(lms[14], lms[16], lms[18]);
      const avg = (wristL + wristR) / 2;
      ["hand_a_Index","hand_a_Middle","hand_a_Ring","hand_a_Little","hand_a_Thumb"].forEach(k => push(k, avg));
    }

    if (stepId === "hand_b") {
      // Thumb opposition proxy: wrist-to-index distance
      const dist = calcDist(lms[15], lms[16]) * 0.4;
      ["hand_b_Thumb_Index","hand_b_Thumb_Middle","hand_b_Thumb_Ring","hand_b_Thumb_Little"].forEach(k => push(k, dist));
    }

    if (stepId === "spine_a") {
      // Torso flexion: shoulder midpoint - hip midpoint - knee midpoint
      const mS = { x:(lms[11].x+lms[12].x)/2, y:(lms[11].y+lms[12].y)/2, z:(lms[11].z+lms[12].z)/2 };
      const mH = { x:(lms[23].x+lms[24].x)/2, y:(lms[23].y+lms[24].y)/2, z:(lms[23].z+lms[24].z)/2 };
      const mK = { x:(lms[25].x+lms[26].x)/2, y:(lms[25].y+lms[26].y)/2, z:(lms[25].z+lms[26].z)/2 };
      push("spine_a_Torso_Flexion", calcAngle(mS, mH, mK));
    }

    if (stepId === "spine_b") {
      push("spine_b_Lateral_Bend", Math.abs(lms[11].y - lms[12].y) * 180);
    }
  }

  // ── Recording flow ──────────────────────────────────────────────────────
  const startStep = () => {
    setError(null);
    setFrameCount(0);
    currentStepIdRef.current = currentStep.id;

    let c = 3;
    setCountdown(c);
    setPhase("countdown");
    const ci = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(ci);
        setCountdown(null);
        setPhase("recording");
        isRecordingRef.current = true;

        setTimeout(() => {
          isRecordingRef.current = false;
          setPhase("done");
          setCompletedSteps(prev => [...prev, currentStepIdx]);
        }, currentStep.duration);
      }
    }, 1000);
  };

  const nextStep = () => {
    if (isLastStep) {
      submitAll();
    } else {
      setCurrentStepIdx(i => i + 1);
      setPhase("idle");
      setFrameCount(0);
    }
  };

  const submitAll = () => {
    const buf = allBuffersRef.current;
    const total = Object.values(buf).reduce((s, arr) => s + arr.length, 0);
    if (total < 20) {
      setError("Not enough data captured. Please redo the assessments with your full body visible.");
      return;
    }
    setIsProcessing(true);
    setTempCameraAngles({ ...buf });
    router.push("/screening/analyze");
  };

  // ─── UI ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-3 ${config.color}`}>
          <CameraIcon className="w-7 h-7" /> {config.label} Movement Assessment
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          MediaPipe AI pose tracking — {steps.length} guided test steps
        </p>
      </div>

      {/* Step progress bar */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex-1 flex flex-col gap-1">
            <div className={`h-1.5 rounded-full transition-all ${
              completedSteps.includes(i) ? "bg-emerald-500" :
              i === currentStepIdx ? "bg-blue-500" : "bg-white/10"}`} />
            <p className="text-xs text-muted-foreground truncate">{s.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Camera feed */}
        <div className="col-span-2 relative bg-black rounded-2xl overflow-hidden border border-border shadow-2xl flex items-center justify-center min-h-[420px]">
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white gap-3">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-sm text-white/60">Loading MediaPipe AI model…</p>
            </div>
          )}

          <Webcam ref={webcamRef} className="hidden" videoConstraints={{ facingMode: "user" }} />
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
              <motion.span
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="text-9xl font-black text-white drop-shadow-2xl"
              >{countdown}</motion.span>
            </div>
          )}

          {/* Recording badge */}
          {phase === "recording" && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-white" /> REC · {frameCount} frames
            </div>
          )}

          {/* Done overlay */}
          {phase === "done" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
              <p className="text-white text-lg font-bold">{currentStep.title} Complete</p>
              <p className="text-white/60 text-sm mt-1">{frameCount} frames captured</p>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Current step card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIdx}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col gap-4"
            >
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Step {currentStepIdx + 1} of {steps.length}
                </p>
                <h2 className={`text-lg font-bold ${config.color}`}>{currentStep.title}</h2>
              </div>

              <p className="text-lg font-bold text-white bg-blue-500/20 p-5 rounded-xl border border-blue-500/40 leading-relaxed shadow-lg">{currentStep.instruction}</p>

              {phase === "idle" && (
                <button
                  onClick={startStep}
                  disabled={!isReady || isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" /> Start Test
                </button>
              )}
              {phase === "countdown" && (
                <button disabled className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl">
                  Starting in {countdown}…
                </button>
              )}
              {phase === "recording" && (
                <button disabled className="w-full bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 opacity-80 cursor-not-allowed">
                  <Loader2 className="w-4 h-4 animate-spin" /> Recording…
                </button>
              )}
              {phase === "done" && (
                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  {isLastStep ? (isProcessing ? "Analysing…" : "Submit All Results") : "Next Step →"}
                </button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Status */}
          <div className="bg-card border border-border/50 rounded-2xl p-4 text-sm">
            <p className="font-semibold mb-3 text-muted-foreground uppercase tracking-wider text-xs">Live Status</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Model</span>
                <span className={isReady ? "text-emerald-400 font-medium" : "text-orange-400"}>{isReady ? "Ready" : "Loading…"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joint</span>
                <span className={`font-medium ${config.color}`}>{config.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Step</span>
                <span className="text-white font-mono text-xs">{currentStep.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frames</span>
                <span className="font-mono text-white">{frameCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Steps Done</span>
                <span className="text-emerald-400 font-medium">{completedSteps.length} / {steps.length}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-destructive text-sm font-medium">{error}</p>
                <button onClick={() => { setPhase("idle"); setError(null); }} className="text-xs text-destructive/70 mt-1 underline">
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CameraAssessment() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <CameraAssessmentInner />
    </Suspense>
  );
}
