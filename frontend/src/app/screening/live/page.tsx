"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { api, ScreeningResult } from "@/services/api";
import { Camera as CameraIcon, Activity, AlertCircle, Loader2, Play, Square } from "lucide-react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useScreening } from "@/context/ScreeningContext";
import { useRouter } from "next/navigation";

export default function LiveScreeningPage() {
  const { setCameraResult } = useScreening();
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [leftAngles, setLeftAngles] = useState<number[]>([]);
  const [rightAngles, setRightAngles] = useState<number[]>([]);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;

    const initTasksVision = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        
        poseLandmarkerRef.current = landmarker;
        setIsReady(true);
        predictWebcam();
      } catch (err) {
        console.error("Tasks Vision Init Error:", err);
      }
    };

    const predictWebcam = () => {
      const video = webcamRef.current?.video;
      const canvas = canvasRef.current;
      const landmarker = poseLandmarkerRef.current;
      
      if (!video || !canvas || !landmarker) {
        animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }

      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        lastVideoTime = video.currentTime;
        
        const startTimeMs = performance.now();
        const results = landmarker.detectForVideo(video, startTimeMs);

        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (results.landmarks && results.landmarks.length > 0) {
            const lms = results.landmarks[0];
            
            // Basic Drawing
            ctx.fillStyle = "#FF0000";
            for (const lm of lms) {
              ctx.beginPath();
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
              ctx.fill();
            }

            // Calculate angles if recording
            if (isRecordingRef.current) {
              const calculateAngle = (a: any, b: any, c: any) => {
                const ba = [a.x - b.x, a.y - b.y, a.z - b.z];
                const bc = [c.x - b.x, c.y - b.y, c.z - b.z];
                const dotProduct = ba[0]*bc[0] + ba[1]*bc[1] + ba[2]*bc[2];
                const magBA = Math.sqrt(ba[0]*ba[0] + ba[1]*ba[1] + ba[2]*ba[2]);
                const magBC = Math.sqrt(bc[0]*bc[0] + bc[1]*bc[1] + bc[2]*bc[2]);
                let cosTheta = dotProduct / (magBA * magBC);
                cosTheta = Math.max(-1.0, Math.min(1.0, cosTheta));
                return Math.acos(cosTheta) * (180.0 / Math.PI);
              };

              // Left: Hip(23), Knee(25), Ankle(27)
              // Right: Hip(24), Knee(26), Ankle(28)
              // Note: tasks-vision visibility is in 'visibility' but sometimes 'presence'
              const lAngle = calculateAngle(lms[23], lms[25], lms[27]);
              const rAngle = calculateAngle(lms[24], lms[26], lms[28]);

              setLeftAngles((prev) => [...prev, lAngle]);
              setRightAngles((prev) => [...prev, rAngle]);
            }
          }
          ctx.restore();
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    setTimeout(initTasksVision, 1000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  const handleStartRecording = () => {
    setLeftAngles([]);
    setRightAngles([]);
    setResult(null);
    setError(null);
    
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setIsRecording(true);
        isRecordingRef.current = true;
        
        setTimeout(() => {
          setIsRecording(false);
          isRecordingRef.current = false;
          document.getElementById('hidden-stop-btn')?.click();
        }, 5000);
      }
    }, 1000);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    
    setLeftAngles(currentLeftAngles => {
      setRightAngles(currentRightAngles => {
        if (currentLeftAngles.length < 10) {
          setError("Recording too short or legs were not visible. Please try again.");
          return currentRightAngles;
        }
        
        setIsProcessing(true);
        api.analyzeLiveCamera(currentLeftAngles, currentRightAngles)
          .then((res: any) => {
            setCameraResult({
              status: "success",
              probability: res.riskScore,
              threshold: 0.75,
              result: res.riskLevel,
              model_name: "Model_Stage2_Camera_RF (Live API)"
            });
            router.push("/screening/results");
          })
          .catch(err => setError(err.message || "Failed to analyze live feed."))
          .finally(() => setIsProcessing(false));
          
        return currentRightAngles;
      });
      return currentLeftAngles;
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" /> Live Real-Time Assessment
          </h1>
          <p className="text-muted-foreground mt-2">
            Walk sideways in front of the camera to extract joint kinematics and detect OA risk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        <div className="col-span-2 relative bg-black rounded-3xl overflow-hidden border border-border shadow-2xl flex items-center justify-center min-h-[480px]">
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p>Loading AI Models (Tasks-Vision API)...</p>
            </div>
          )}
          
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={true}
            videoConstraints={{ facingMode: "user" }}
            className="w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          />
          
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
              <span className="text-9xl font-black text-white drop-shadow-2xl animate-pulse">
                {countdown}
              </span>
            </div>
          )}

          {isRecording && (
            <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-white" /> RECORDING
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <CameraIcon className="w-5 h-5 text-primary" /> Controls
            </h2>
            
            <button 
                id="hidden-stop-btn" 
                onClick={handleStopRecording} 
                style={{display: 'none'}} 
            >Stop</button>
            
            {countdown !== null ? (
              <button disabled className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                Starting in {countdown}...
              </button>
            ) : !isRecording ? (
              <button 
                onClick={handleStartRecording}
                disabled={!isReady || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {isProcessing ? "Analyzing Data..." : "Start Walk Test"}
              </button>
            ) : (
              <button 
                disabled
                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 opacity-80 cursor-not-allowed"
              >
                <Loader2 className="w-5 h-5 animate-spin" /> Recording (Auto-Stops)
              </button>
            )}

            <p className="text-sm text-muted-foreground mt-2">
              <strong>Instructions:</strong> Stand back so your full body is visible in profile (sideways). Click Start, wait for the countdown, and walk across the screen for 5 seconds.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-card border-2 border-blue-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
              <h3 className="text-sm font-bold tracking-wider text-blue-500 uppercase mb-4">
                Analysis Complete
              </h3>
              
              <div className="flex items-end gap-4 mb-6">
                <div className="text-5xl font-black text-foreground">
                  {(result.riskScore * 100).toFixed(1)}<span className="text-2xl text-muted-foreground ml-1">%</span>
                </div>
                <div className="pb-1">
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${result.riskScore >= 0.75 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                    {result.riskLevel}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Live kinematics analysis completed using a 5-second precise motion window. Confidence score: {(result.confidence * 100).toFixed(1)}%.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
