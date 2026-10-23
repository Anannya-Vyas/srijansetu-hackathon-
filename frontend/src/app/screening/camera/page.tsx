"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState, Suspense } from "react";
import Webcam from "react-webcam";
import { Camera as CameraIcon, AlertCircle, Loader2, Play, CheckCircle2, ChevronRight, RefreshCw, Zap } from "lucide-react";
import { PoseLandmarker, HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useScreening } from "@/context/ScreeningContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// ─── Angle helpers ─────────────────────────────────────────────────────────

function calcAngle(a: any, b: any, c: any): number {
  const ba = [a.x - b.x, a.y - b.y, a.z - b.z];
  const bc = [c.x - b.x, c.y - b.y, c.z - b.z];
  const dot = ba[0]*bc[0] + ba[1]*bc[1] + ba[2]*bc[2];
  const magBA = Math.sqrt(ba[0]**2 + ba[1]**2 + ba[2]**2);
  const magBC = Math.sqrt(bc[0]**2 + bc[1]**2 + bc[2]**2);
  const cos = Math.max(-1, Math.min(1, dot / (Math.max(magBA * magBC, 1e-6))));
  return Math.acos(cos) * (180 / Math.PI);
}

function calcDist(a: any, b: any): number {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
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
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
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
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const msg = new SpeechSynthesisUtterance(currentStep.instruction);
          msg.rate = 0.95;
          window.speechSynthesis.speak(msg);
        } catch {}
      }
    }
  }, [currentStepIdx, currentStep]);

  // ── MediaPipe ───────────────────────────────────────────────────────────
  useEffect(() => {
    let animationFrameId: number;
    let isCancelled = false;

    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        if (isCancelled) return;

        if (joint === "hand") {
          let handLm: HandLandmarker;
          try {
            handLm = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              numHands: 2,
            });
          } catch (gpuErr) {
            console.warn("MediaPipe GPU delegate failed, falling back to CPU", gpuErr);
            handLm = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numHands: 2,
            });
          }
          if (!isCancelled) {
            handLandmarkerRef.current = handLm;
            setIsReady(true);
          }
        } else {
          let poseLm: PoseLandmarker;
          try {
            poseLm = await PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              numPoses: 1,
            });
          } catch (gpuErr) {
            console.warn("MediaPipe GPU delegate failed, falling back to CPU", gpuErr);
            poseLm = await PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numPoses: 1,
            });
          }
          if (!isCancelled) {
            poseLandmarkerRef.current = poseLm;
            setIsReady(true);
          }
        }

        const draw = () => {
          const video = webcamRef.current?.video;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d")!;
            // Clear canvas overlay each frame (Webcam video is displayed natively underneath)
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const timestamp = performance.now();
            
            if (joint === "hand" && handLandmarkerRef.current) {
              try {
                const result = handLandmarkerRef.current.detectForVideo(video, timestamp);
                if (result.landmarks?.length > 0) {
                  if (isRecordingRef.current) {
                    extractHandAngles(result.landmarks, currentStepIdRef.current, allBuffersRef.current);
                    setFrameCount(f => f + 1);
                  }
                  const W = canvas.width; const H = canvas.height;
                  ctx.strokeStyle = "rgba(249,115,22,0.9)"; // Orange for hand
                  ctx.lineWidth = 3;
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
                      ctx.arc((1 - pt.x) * W, pt.y * H, 5, 0, 2*Math.PI);
                      ctx.fillStyle = "rgba(255,255,255,0.95)";
                      ctx.fill();
                    }
                  }
                }
              } catch (e) {
                // Ignore transient frame timestamp dropped frames
              }
            } else if (poseLandmarkerRef.current) {
              try {
                const result = poseLandmarkerRef.current.detectForVideo(video, timestamp);
                if (result.landmarks?.length > 0) {
                  const lms = result.landmarks[0];

                  if (isRecordingRef.current) {
                    extractAngles(lms, currentStepIdRef.current, allBuffersRef.current);
                    setFrameCount(f => f + 1);
                  }

                  const W = canvas.width; const H = canvas.height;
                  const CONNECTIONS = [
                    [11,12],[11,13],[13,15],[12,14],[14,16], // arms
                    [11,23],[12,24],[23,24], // torso
                    [23,25],[25,27],[24,26],[26,28], // legs
                    [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8], // face
                  ];
                  ctx.strokeStyle = "rgba(59,130,246,0.85)";
                  ctx.lineWidth = 3;
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
                    ctx.arc((1 - pt.x) * W, pt.y * H, i === 0 ? 7 : 5, 0, 2*Math.PI);
                    ctx.fillStyle = "rgba(16,185,129,0.95)";
                    ctx.fill();
                  }
                }
              } catch (e) {
                // Ignore transient dropped frame
              }
            }
          }
          if (!isCancelled) {
            animationFrameId = requestAnimationFrame(draw);
          }
        };
        draw();
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
        setError("Failed to load computer vision pose model. Please check network connectivity or use simulated demo mode.");
        setIsReady(true);
      }
    };

    const timer = setTimeout(init, 300);
    return () => { 
      isCancelled = true;
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId); 
      poseLandmarkerRef.current?.close(); 
      handLandmarkerRef.current?.close();
    };
  }, [joint]);

  // ── Per-joint angle extraction ──────────────────────────────────────────
  function extractAngles(lms: any[], stepId: string, buf: Record<string, number[]>) {
    const push = (key: string, val: number) => { if (!buf[key]) buf[key] = []; buf[key].push(val); };

    if (stepId.startsWith("knee")) {
      push("left_knee_angles", calcAngle(lms[23], lms[25], lms[27]));
      push("right_knee_angles", calcAngle(lms[24], lms[26], lms[28]));
    }

    if (stepId === "hip_walk") {
      push("LHipAngles_X", calcAngle(lms[11], lms[23], lms[25]));
      push("RHipAngles_X", calcAngle(lms[12], lms[24], lms[26]));
      push("LKneeAngles_X", calcAngle(lms[23], lms[25], lms[27]));
      push("RKneeAngles_X", calcAngle(lms[24], lms[26], lms[28]));
      const pelvisAngle = Math.abs(lms[23].y - lms[24].y) * 180;
      push("LPelvisAngles_X", pelvisAngle); push("RPelvisAngles_X", pelvisAngle);
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
      push("shoulder_a_L_Shoulder_Torso", calcAngle(lms[13], lms[11], lms[23]));
      push("shoulder_a_R_Shoulder_Torso", calcAngle(lms[14], lms[12], lms[24]));
    }

    if (stepId === "shoulder_b") {
      push("shoulder_b_L_Shoulder_Torso", calcAngle(lms[13], lms[11], lms[23]));
      push("shoulder_b_R_Shoulder_Torso", calcAngle(lms[14], lms[12], lms[24]));
    }

    if (stepId === "hand_b") {
      const dist = calcDist(lms[15], lms[16]) * 0.4;
      ["hand_b_Thumb_Index","hand_b_Thumb_Middle","hand_b_Thumb_Ring","hand_b_Thumb_Little"].forEach(k => push(k, dist));
    }

    if (stepId === "spine_a") {
      const mS = { x:(lms[11].x+lms[12].x)/2, y:(lms[11].y+lms[12].y)/2, z:(lms[11].z+lms[12].z)/2 };
      const mH = { x:(lms[23].x+lms[24].x)/2, y:(lms[23].y+lms[24].y)/2, z:(lms[23].z+lms[24].z)/2 };
      const mK = { x:(lms[25].x+lms[26].x)/2, y:(lms[25].y+lms[26].y)/2, z:(lms[25].z+lms[26].z)/2 };
      push("spine_a_Torso_Flexion", calcAngle(mS, mH, mK));
    }

    if (stepId === "spine_b") {
      push("spine_b_Lateral_Bend", Math.abs(lms[11].y - lms[12].y) * 180);
    }
  }

  // ── Synthetic Demonstration Motion Fallback ─────────────────────────────
  const handleSimulateMovement = () => {
    setError(null);
    const buf = allBuffersRef.current;
    
    // Inject calibrated realistic kinematics based on selected joint
    if (joint === "knee") {
      buf["left_knee_angles"] = [135, 128, 115, 95, 88, 92, 110, 125, 138, 142];
      buf["right_knee_angles"] = [132, 124, 110, 89, 82, 86, 105, 120, 134, 139];
    } else if (joint === "hand") {
      buf["hand_a_Index"] = [68, 62, 54, 42, 38, 44, 56, 65, 70];
      buf["hand_a_Middle"] = [70, 64, 52, 40, 36, 42, 55, 66, 72];
      buf["hand_a_Ring"] = [65, 59, 48, 38, 34, 40, 52, 62, 68];
      buf["hand_a_Little"] = [60, 55, 45, 35, 30, 38, 48, 58, 62];
      buf["hand_a_Thumb"] = [45, 40, 35, 28, 25, 30, 38, 42, 48];
      buf["hand_b_Thumb_Index"] = [0.15, 0.12, 0.08, 0.04, 0.03, 0.05, 0.10, 0.14];
    } else if (joint === "hip") {
      buf["LHipAngles_X"] = [32, 28, 22, 15, 12, 18, 26, 34, 38];
      buf["RHipAngles_X"] = [30, 25, 18, 12, 10, 15, 22, 30, 35];
      buf["LKneeAngles_X"] = [130, 115, 95, 85, 90, 110, 128];
      buf["RKneeAngles_X"] = [125, 110, 90, 80, 85, 105, 122];
    } else if (joint === "shoulder") {
      buf["shoulder_a_L_Shoulder_Torso"] = [45, 65, 95, 130, 155, 162, 140, 110, 75, 45];
      buf["shoulder_a_R_Shoulder_Torso"] = [42, 60, 88, 120, 142, 148, 130, 100, 70, 40];
    } else if (joint === "spine") {
      buf["spine_a_Torso_Flexion"] = [175, 160, 145, 130, 122, 120, 135, 155, 172];
      buf["spine_b_Lateral_Bend"] = [5, 12, 22, 28, 18, 8, 4, 15, 25, 20, 8];
    }

    setTempCameraAngles({ ...buf });
    setCompletedSteps(steps.map((_, i) => i));
    setFrameCount(45);
    setIsProcessing(true);
    setTimeout(() => {
      router.push("/screening/analyze");
    }, 600);
  };

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
    if (total < 10) {
      setError("Not enough movement frames captured. Stand 2-3 meters back and ensure your joint is fully visible, or click 'Simulate Motion' to proceed.");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-3 ${config.color}`}>
            <CameraIcon className="w-7 h-7" /> {config.label} Movement Assessment
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            MediaPipe AI pose tracking — {steps.length} guided test steps
          </p>
        </div>

        {/* Demo Fallback Quick-Run */}
        <button
          onClick={handleSimulateMovement}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-all"
        >
          <Zap className="w-4 h-4 text-emerald-400" />
          Test with Simulated Motion (Demo Mode)
        </button>
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
        <div className="col-span-2 relative bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center min-h-[420px]">
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
              <p className="text-sm text-white/70 font-medium">Initializing MediaPipe Vision Model…</p>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 text-white p-8 text-center gap-3">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-1" />
              <p className="font-bold text-lg text-white">Camera Access Required</p>
              <p className="text-sm text-gray-300 max-w-md">{cameraError}</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Ensure browser camera permissions are enabled in your address bar, or click below to simulate motion immediately.
              </p>
              <button
                onClick={handleSimulateMovement}
                className="mt-3 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> Run Assessment with Simulated Motion
              </button>
            </div>
          )}

          {/* Native hardware-accelerated visible webcam */}
          <Webcam 
            ref={webcamRef} 
            audio={false}
            mirrored={true}
            onUserMedia={() => {
              setCameraActive(true);
              setCameraError(null);
            }}
            onUserMediaError={(err: any) => {
              console.warn("Webcam blocked or unavailable:", err);
              setCameraError("Camera unavailable or permission denied. Please allow camera access in the address bar.");
            }}
            videoConstraints={{ facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }}
            className="w-full h-full object-cover" 
          />

          {/* Transparent skeletal overlay canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10" />

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
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse z-20">
              <div className="w-2 h-2 rounded-full bg-white" /> REC · {frameCount} frames
            </div>
          )}

          {/* Done overlay */}
          {phase === "done" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-20 backdrop-blur-sm">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
              <p className="text-white text-lg font-bold">{currentStep.title} Complete</p>
              <p className="text-white/60 text-sm mt-1">{frameCount} frames recorded</p>
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

              <p className="text-base font-bold text-white bg-blue-500/20 p-4 rounded-xl border border-blue-500/40 leading-relaxed shadow-lg">
                {currentStep.instruction}
              </p>

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
                <span className={isReady ? "text-emerald-400 font-medium" : "text-orange-400"}>
                  {isReady ? "Ready" : "Loading…"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Webcam Stream</span>
                <span className={cameraActive ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                  {cameraActive ? "Active" : "Connecting…"}
                </span>
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
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => { setPhase("idle"); setError(null); }} className="text-xs text-white/80 underline">
                    Try again
                  </button>
                  <button onClick={handleSimulateMovement} className="text-xs text-emerald-400 font-bold underline">
                    Use simulated demo motion
                  </button>
                </div>
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
