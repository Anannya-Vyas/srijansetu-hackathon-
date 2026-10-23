"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ActivityLogIcon, 
  ExclamationTriangleIcon, 
  CheckCircledIcon, 
  ArrowRightIcon, 
  ReloadIcon,
  InfoCircledIcon, 
  MixerHorizontalIcon
} from "@radix-ui/react-icons";
import { useScreening } from "@/context/ScreeningContext";
import type { IMUResult } from "@/context/ScreeningContext";

const IMU_SERVICE_URL = "http://localhost:8001";

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

  useEffect(() => {
    if (imuResult) {
      setResult(imuResult);
      setStatus("done");
    }
  }, [imuResult]);

  const runAssessment = async () => {
    setStatus("running");
    setErrorMsg(null);
    setResult(null);

    try {
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
        setErrorMsg("IMU sensor service is currently offline. You can proceed directly to results.");
      } else {
        setStatus("error");
        setErrorMsg(msg);
      }
    }
  };

  const riskColor = (level: string) => {
    if (level === "elevated") return "text-rose-600";
    if (level === "moderate") return "text-amber-600";
    return "text-emerald-600";
  };

  const riskBg = (level: string) => {
    if (level === "elevated") return "bg-rose-50 border-rose-200";
    if (level === "moderate") return "bg-amber-50 border-amber-200";
    return "bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
          Wearable Inertial Sensor (IMU) Gait Assessment
        </h1>
        <p className="text-gray-600 text-sm">
          Wearable inertial sensor gait analysis — knee and lower extremity movement patterns
        </p>
      </motion.div>

      {/* Hardware disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900"
      >
        <InfoCircledIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Demo note:</strong> This module runs the calibrated sensor signal pipeline. In the absence of live physical Bluetooth hardware, you may run virtual sensor simulation or proceed directly to consolidated results.
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)]"
      >
        {/* Idle state */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center py-8 gap-5 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#FFEFEA] text-[#FF6B4A] border border-[#FFD8CC] flex items-center justify-center">
              <ActivityLogIcon className="w-10 h-10" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-lg mb-1">Virtual IMU Telemetry Ready</p>
              <p className="text-gray-500 text-xs max-w-sm">
                Dual virtual sensors (Thigh + Shank) simulate 10 seconds of walking to calculate angular velocity and excursion patterns.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={runAssessment}
                className="flex items-center gap-2 bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold px-8 py-3.5 rounded-full shadow-md transition-all text-xs"
              >
                <ActivityLogIcon className="w-4 h-4" /> Start IMU Assessment
              </button>
              <button
                onClick={() => router.push("/screening/results")}
                className="px-6 py-3.5 rounded-full bg-white border border-[#EBE8E3] text-gray-700 hover:bg-[#FAF9F6] font-semibold text-xs transition-all"
              >
                Skip to Results
              </button>
            </div>
          </div>
        )}

        {/* Running */}
        {status === "running" && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <ReloadIcon className="w-10 h-10 text-[#FF6B4A] animate-spin" />
            <p className="text-gray-900 font-bold text-lg">Processing Sensor Telemetry...</p>
            <p className="text-gray-500 text-xs max-w-sm">
              Applying Butterworth filtering, quaternion angle transformation, and stance phase cadence detection.
            </p>
          </div>
        )}

        {/* Service unavailable */}
        {status === "unavailable" && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <InfoCircledIcon className="w-10 h-10 text-amber-500" />
            <p className="text-gray-900 font-bold text-lg">IMU Service Not Active</p>
            <p className="text-gray-500 text-xs max-w-sm">{errorMsg}</p>
            <button
              onClick={() => router.push("/screening/results")}
              className="mt-2 flex items-center gap-2 bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold px-8 py-3.5 rounded-full shadow-md text-xs transition-all"
            >
              Continue to Screening Results <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <ExclamationTriangleIcon className="w-10 h-10 text-rose-500" />
            <p className="text-gray-900 font-bold text-lg">Assessment Interrupted</p>
            <p className="text-rose-600 text-xs max-w-sm">{errorMsg}</p>
            <div className="flex gap-3">
              <button
                onClick={runAssessment}
                className="bg-[#FAF9F6] border border-[#EBE8E3] hover:bg-gray-100 text-gray-800 px-6 py-2.5 rounded-full text-xs font-semibold"
              >
                Retry
              </button>
              <button
                onClick={() => router.push("/screening/results")}
                className="bg-[#FF6B4A] hover:bg-[#E85938] text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {status === "done" && result && (
          <div className="flex flex-col gap-6">
            <div className={`flex items-center gap-4 p-5 rounded-2xl border ${riskBg(result.risk_level)}`}>
              <CheckCircledIcon className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Sensor Kinematic Triage</p>
                <p className={`text-2xl font-black capitalize ${riskColor(result.risk_level)}`}>
                  {result.risk_level} Risk
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Index: {(result.risk_score * 100).toFixed(0)}/100 • Profile: {result.simulation_profile}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Cadence", value: result.features.cadence_spm, unit: "spm", decimals: 1 },
                { label: "Knee ROM", value: result.features.knee_rom_deg, unit: "°", decimals: 1 },
                { label: "Peak Flexion", value: result.features.peak_knee_flexion_deg, unit: "°", decimals: 1 },
                { label: "Stance", value: result.features.stance_percentage, unit: "%", decimals: 1 },
                { label: "Swing", value: result.features.swing_percentage, unit: "%", decimals: 1 },
                { label: "Gait Cycles", value: result.features.cycle_count, unit: "", decimals: 0 },
              ].map(({ label, value, unit, decimals }) => (
                <div key={label} className="bg-[#FAF9F6] border border-[#EBE8E3] rounded-2xl p-4 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">{label}</p>
                  <p className="text-xl font-black text-gray-900">
                    {value !== null && value !== undefined
                      ? `${decimals === 0 ? value : Number(value).toFixed(decimals)}${unit}`
                      : "N/A"}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#EBE8E3]">
              <button
                onClick={() => router.push("/screening/results")}
                className="flex items-center gap-2 bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold px-8 py-3.5 rounded-full shadow-md text-xs transition-all"
              >
                View Full Diagnostic Results <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
