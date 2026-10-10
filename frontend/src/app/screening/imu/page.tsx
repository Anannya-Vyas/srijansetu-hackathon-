"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity, AlertCircle, CheckCircle2, ArrowRight, Loader2,
  WifiOff, Info, Cpu
} from "lucide-react";
import { useScreening } from "@/context/ScreeningContext";
import type { IMUResult } from "@/context/ScreeningContext";

const IMU_SERVICE_URL = "http://localhost:8001";

// Map selectedJoint to a profile — knee uses moderate_oa for demo relevance
const jointToProfile = (joint: string | null): string => {
  if (joint === "knee") return "moderate_oa";
  if (joint === "hip") return "moderate_oa";
  return "normal";
};

export default function IMUPage() {
  const router = useRouter();
  const { selectedJoint, setImuResult, imuResult } = useScreening();

  const [status, setStatus] = useState<"idle" | "running" | "done" | "unavailable" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<IMUResult | null>(imuResult);

  // If we already have a result from this session, show it immediately
  useEffect(() => {
    if (imuResult) {
      setResult(imuResult);
      setStatus("done");
    }
  }, []);

  const runAssessment = async () => {
    setStatus("running");
    setErrorMsg(null);
    setResult(null);

    try {
      // Step 1: simulate
      const profile = jointToProfile(selectedJoint);
      const simRes = await fetch(`${IMU_SERVICE_URL}/api/imu/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          duration_seconds: 10,
          sampling_rate_hz: 100,
          side: "LEFT",
          random_seed: 42,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!simRes.ok) {
        const err = await simRes.json().catch(() => ({}));
        throw new Error(err.detail || `Simulation failed: ${simRes.status}`);
      }

      const simData = await simRes.json();
      const sessionId: string = simData.session_id;

      // Step 2: assess
      const assessRes = await fetch(`${IMU_SERVICE_URL}/api/imu/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
        signal: AbortSignal.timeout(15000),
      });

      if (!assessRes.ok) {
        const err = await assessRes.json().catch(() => ({}));
        throw new Error(err.detail || `Assessment failed: ${assessRes.status}`);
      }

      const assessData: IMUResult = await assessRes.json();
      setResult(assessData);
      setImuResult(assessData);
      setStatus("done");
    } catch (err: any) {
      const msg: string = err?.message || String(err);
      if (
        msg.includes("fetch") ||
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("ECONNREFUSED") ||
        msg.includes("net::ERR")
      ) {
        setStatus("unavailable");
        setErrorMsg("IMU service is not reachable at port 8001. The assessment is marked unavailable. You can continue without it.");
      } else {
        setStatus("error");
        setErrorMsg(msg);
      }
    }
  };

  const riskColor = (level: string) => {
    if (level === "elevated") return "text-red-400";
    if (level === "moderate") return "text-orange-400";
    return "text-emerald-400";
  };

  const riskBg = (level: string) => {
    if (level === "elevated") return "bg-red-500/20 border-red-500/30";
    if (level === "moderate") return "bg-orange-500/20 border-orange-500/30";
    return "bg-emerald-500/20 border-emerald-500/30";
  };

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">IMU Sensor Assessment</h1>
        </div>
        <p className="text-muted-foreground text-base mt-1">
          Wearable inertial sensor gait analysis — knee movement patterns
        </p>
      </motion.div>

      {/* Hardware disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
      >
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-white/70">
          <span className="text-white/90 font-medium">Demo mode: </span>
          This assessment uses the validated IMU processing pipeline with simulated sensor data.
          Physical Bluetooth IMU hardware (ESP32 + MPU6050) is not connected in this demo.
          The signal processing, gait event detection, knee angle estimation, and feature extraction
          algorithms are identical to what would run with real hardware.
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 rounded-3xl flex-1 flex flex-col"
      >
        {/* Idle state */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 py-8">
            <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-lg mb-1">Virtual IMU — Ready</p>
              <p className="text-white/50 text-sm">
                Two virtual sensors (Thigh + Shank) will simulate 10 seconds of walking
                and extract knee gait features.
              </p>
            </div>
            <button
              onClick={runAssessment}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-8 py-3 rounded-full transition-colors"
            >
              <Activity className="w-5 h-5" /> Start IMU Assessment
            </button>
          </div>
        )}

        {/* Running */}
        {status === "running" && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            <p className="text-white font-medium text-lg">Running gait simulation pipeline...</p>
            <p className="text-white/50 text-sm text-center max-w-sm">
              Generating synthetic IMU data → Butterworth filtering → Quaternion orientation →
              Knee angle estimation → Gait event detection → Feature extraction
            </p>
          </div>
        )}

        {/* Service unavailable */}
        {status === "unavailable" && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
            <WifiOff className="w-12 h-12 text-yellow-400" />
            <p className="text-white font-semibold text-lg">IMU Service Unavailable</p>
            <p className="text-white/60 text-sm text-center max-w-md">{errorMsg}</p>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-300 text-center max-w-sm">
              You can continue the screening. The IMU assessment will appear as unavailable in the results.
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-8">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-white font-semibold text-lg">Assessment Failed</p>
            <p className="text-red-400 text-sm text-center max-w-md">{errorMsg}</p>
            <button
              onClick={runAssessment}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Done — show results */}
        {status === "done" && result && (
          <div className="flex flex-col gap-5">
            {/* Risk badge */}
            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${riskBg(result.risk_level)}`}>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Movement Risk Level</p>
                <p className={`text-2xl font-bold capitalize ${riskColor(result.risk_level)}`}>
                  {result.risk_level}
                </p>
                <p className="text-xs text-white/40">
                  Score: {(result.risk_score * 100).toFixed(0)}/100 · Profile: {result.simulation_profile}
                </p>
              </div>
            </div>

            {/* Gait metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Cadence", value: result.features.cadence_spm, unit: "spm", decimals: 1 },
                { label: "Knee ROM", value: result.features.knee_rom_deg, unit: "°", decimals: 1 },
                { label: "Peak Flexion", value: result.features.peak_knee_flexion_deg, unit: "°", decimals: 1 },
                { label: "Stance", value: result.features.stance_percentage, unit: "%", decimals: 1 },
                { label: "Swing", value: result.features.swing_percentage, unit: "%", decimals: 1 },
                { label: "Gait Cycles", value: result.features.cycle_count, unit: "", decimals: 0 },
              ].map(({ label, value, unit, decimals }) => (
                <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-white/40 mb-1">{label}</p>
                  <p className="text-xl font-bold text-white">
                    {value !== null && value !== undefined
                      ? `${decimals === 0 ? value : Number(value).toFixed(decimals)}${unit}`
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>

            {/* Evidence */}
            {result.evidence && result.evidence.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Gait Evidence</p>
                <div className="space-y-2">
                  {result.evidence.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-cyan-400 mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-white/30 text-center px-2">{result.disclaimer}</p>
          </div>
        )}
      </motion.div>

      {/* Continue button — always visible after idle */}
      {(status === "done" || status === "unavailable" || status === "error") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex justify-end"
        >
          <button
            onClick={() => router.push("/screening/results")}
            className="flex items-center gap-2 bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
