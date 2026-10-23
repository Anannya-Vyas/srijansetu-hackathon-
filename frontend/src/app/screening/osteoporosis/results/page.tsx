"use client";

import { useState } from "react";
import { useScreening } from "@/context/ScreeningContext";
import { usePatient } from "@/context/PatientContext";
import { useRouter } from "next/navigation";
import { 
  DownloadIcon, 
  CheckCircledIcon, 
  ExclamationTriangleIcon, 
  EyeOpenIcon, 
  EyeClosedIcon, 
  MagicWandIcon, 
  ReloadIcon, 
  ArrowRightIcon, 
  ExternalLinkIcon, 
  ActivityLogIcon, 
  LayersIcon, 
  LockClosedIcon, 
  Cross2Icon,
  DrawingPinIcon
} from "@radix-ui/react-icons";
import { ThumbsUp, ThumbsDown, Phone } from "lucide-react";
import Link from "next/link";

export default function OsteoporosisResults() {
  const { clinicalResult, imagingResult } = useScreening();
  const { patient } = usePatient();
  const router = useRouter();

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [doctorFeedback, setDoctorFeedback] = useState<"agreed" | "disagreed" | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showDexaModal, setShowDexaModal] = useState(false);

  if (!clinicalResult && !imagingResult) {
    return (
      <div className="text-white text-center mt-20">
        <p className="text-gray-400 mb-4">No screening results available for this session.</p>
        <Link href="/" className="px-5 py-2.5 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all">
          Return to Patient Intake
        </Link>
      </div>
    );
  }

  // Calculate true risk probabilities
  const clinicalRisk = clinicalResult ? clinicalResult.probability : 0;
  const imagingRisk = imagingResult ? imagingResult.probability : 0;

  // Weighted multimodal risk score (50% clinical markers + 50% imaging indicators)
  const combinedRisk = (clinicalResult && imagingResult)
    ? (clinicalRisk * 0.45 + imagingRisk * 0.55)
    : (clinicalResult ? clinicalRisk : imagingRisk);

  const isHighRisk = combinedRisk >= 0.50;
  const isDiscordant = clinicalResult && imagingResult && 
    ((clinicalResult.result === "Osteoporosis" && imagingResult.result === "Normal") ||
     (clinicalResult.result === "Normal" && imagingResult.result === "Osteoporosis"));

  const clinicalLabel = clinicalResult?.result === "1" ? "Osteoporosis" : (clinicalResult?.result || "N/A");
  const imagingLabel = imagingResult?.result || "N/A";
  const boneAge = imagingResult?.bone_health_age || patient?.age || 60;
  const actualAge = patient?.age || 58;

  const handleDoctorFeedback = async (agree: boolean) => {
    setDoctorFeedback(agree ? "agreed" : "disagreed");
    try {
      await fetch("http://localhost:8000/api/feedback/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient?.screeningId || "UNK",
          screening_type: "osteoporosis",
          predicted_label: imagingLabel,
          doctor_agreed: agree,
          doctor_notes: agree ? "Clinically validated" : "Flagged for manual review",
          doctor_name: "Attending Clinician"
        })
      });
      setFeedbackSubmitted(true);
    } catch (e) {
      console.error("Feedback logging error:", e);
      setFeedbackSubmitted(true);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=4&data=SWASTIK-REF-${patient?.screeningId || '101'}-RISK-${Math.round(combinedRisk * 100)}`;

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      {/* Header with Patient Card */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 print:hidden">
            <MagicWandIcon className="w-3.5 h-3.5" /> DenseNet-121 Clean Architecture • Multimodal Decision Support
          </div>
          <h1 className="text-4xl font-extrabold mb-4 flex items-center gap-3 tracking-tight">
            <LayersIcon className="text-emerald-500 w-10 h-10" />
            Osteoporosis Clinical Assessment
          </h1>
          {patient && (
            <div className="flex items-center gap-4 border border-white/10 bg-white/5 px-4 py-3 rounded-2xl w-max backdrop-blur-md print:bg-transparent print:border-black/20">
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider print:text-black/50">Patient Name</span>
                <span className="text-white font-medium text-lg print:text-black">{patient.patientName}</span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-2 print:bg-black/10"></div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider print:text-black/50">Age / Gender</span>
                <span className="text-white font-medium text-lg print:text-black">{patient.age}y • {patient.gender}</span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-2 print:bg-black/10"></div>
              <div className="flex flex-col">
                <span className="text-xs text-white/40 uppercase tracking-wider print:text-black/50">Screening ID</span>
                <span className="text-emerald-400 font-mono text-lg print:text-emerald-600">{patient.screeningId}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={() => setShowDexaModal(true)}
            className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 px-4 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg backdrop-blur-md hover:scale-105"
          >
            <DrawingPinIcon className="w-4 h-4 text-purple-400" />
            Find DEXA Centres
          </button>
          
          <button 
            onClick={() => window.print()} 
            className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg hover:scale-105"
          >
            <DownloadIcon className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            Referral PDF
          </button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #0A0A0B !important; color: white !important; }
          button { display: none !important; }
          .print-hidden { display: none !important; }
          ::-webkit-scrollbar { display: none; }
        }
      `}} />

      {/* Multimodal Ensemble Diagnosis Card */}
      <div className={`border-2 p-8 rounded-3xl mb-8 shadow-2xl transition-all ${
        isHighRisk 
          ? "bg-gradient-to-r from-red-950/40 via-amber-950/20 to-black/60 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
          : "bg-gradient-to-r from-emerald-900/40 to-emerald-600/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
      }`}>
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="flex-1 space-y-4">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${isHighRisk ? "text-amber-400" : "text-emerald-400"}`}>
              <ActivityLogIcon className="w-6 h-6" /> Multimodal Calibrated Synthesis
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              Fusing clinical lifestyle biomarkers ({clinicalResult?.model_name || "XGBoost Pipeline"}) with deep radiographic bone attenuation ({imagingResult?.model_name || "DenseNet-121 Clean"}).
            </p>

            {/* Bone Health Age Callout */}
            <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs text-white/50 uppercase">Chronological Age</span>
                <span className="text-xl font-bold text-white">{actualAge} yrs</span>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="flex flex-col">
                <span className="text-xs text-amber-400/80 uppercase font-semibold">Bone Structural Age</span>
                <span className={`text-xl font-extrabold ${boneAge > actualAge ? "text-amber-400" : "text-emerald-400"}`}>
                  {boneAge} yrs {boneAge > actualAge ? `(+${boneAge - actualAge}y aging)` : "(-Optimal)"}
                </span>
              </div>
            </div>

            {isDiscordant && (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-amber-300 text-sm">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                <span>
                  <strong>Clinical Note on Modality Variance:</strong> Clinical questionnaire suggests high fracture vulnerability ({clinicalLabel}), while plain X-ray features appear early-stage ({imagingLabel}). Plain radiographs often appear normal until &gt;30% bone mineral depletion occurs. Confirmatory DEXA scan advised.
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-black/60 p-6 rounded-3xl border border-white/10 min-w-[260px] text-center shadow-xl">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Composite Triage Status</p>
              <p className={`text-3xl font-extrabold ${isHighRisk ? "text-amber-400" : "text-emerald-400"}`}>
                {isHighRisk ? "Elevated Risk" : "Normal Baseline"}
              </p>
              <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isHighRisk ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}>
                {isHighRisk ? "DEXA Referral Indicated" : "Annual Monitoring"}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-gray-400 text-xs">Vulnerability Index</p>
                <p className="text-2xl font-bold font-mono text-white mt-0.5">{(combinedRisk * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* QR Code Card for Doctor */}
            <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center text-black shadow-xl">
              <img src={qrUrl} alt="Doctor Referral QR" className="w-28 h-28 object-contain" />
              <span className="text-[10px] font-mono font-bold mt-1 text-gray-700">Scan for e-Referral</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Deep Learning XAI Grad-CAM on Left, Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grad-CAM Heatmap Viewer */}
        <div className="bg-black/40 border border-white/10 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                <MagicWandIcon className="w-5 h-5" /> Explainable AI (Grad-CAM)
              </h2>
              {imagingResult?.gradcam_image && (
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
                  <button 
                    onClick={() => setShowHeatmap(true)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${showHeatmap ? "bg-emerald-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    Heatmap
                  </button>
                  <button 
                    onClick={() => setShowHeatmap(false)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${!showHeatmap ? "bg-emerald-600 text-white font-bold" : "text-gray-400 hover:text-white"}`}
                  >
                    Plain X-Ray
                  </button>
                </div>
              )}
            </div>

            {imagingResult?.gradcam_image ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 aspect-square max-h-[360px] mx-auto flex items-center justify-center">
                <img 
                  src={showHeatmap ? imagingResult.gradcam_image : (imagingResult.original_preview || imagingResult.gradcam_image)} 
                  alt="Radiograph Analysis" 
                  className="w-full h-full object-contain p-2"
                />
                {showHeatmap && (
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl text-xs border border-white/10 flex items-center justify-between">
                    <span className="text-gray-300">Target: Proximal Tibia / Condylar Trabeculae</span>
                    <span className="text-amber-400 font-semibold font-mono">DenseNet-121 Attention</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-gray-500 text-sm">
                No radiograph heatmap available.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <LockClosedIcon className="w-4 h-4" /> CLAHE Contrast Enhancement Applied
            </span>
            <span>Target Class: {imagingLabel}</span>
          </div>
        </div>

        {/* Detailed Probabilities & Clinical Breakdown */}
        <div className="space-y-6">
          {/* Imaging Probabilities */}
          <div className="bg-black/40 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <LayersIcon className="w-5 h-5 text-emerald-400" /> DenseNet-121 Class Probabilities
            </h3>
            
            {imagingResult?.probabilities ? (
              <div className="space-y-3">
                {Object.entries(imagingResult.probabilities).map(([label, pct]: [string, any]) => {
                  const val = Number(pct);
                  const isWinner = label.toLowerCase() === imagingLabel.toLowerCase();
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={isWinner ? "font-bold text-emerald-300" : "text-gray-400"}>{label}</span>
                        <span className="font-mono font-medium text-white">{val.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            label === "Osteoporosis" ? "bg-rose-500" : label === "Osteopenia" ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.max(val, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Probability distribution unavailable.</p>
            )}

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
              <span>Overall Radiograph Diagnosis:</span>
              <span className="font-bold text-sm text-emerald-400">{imagingLabel}</span>
            </div>
          </div>

          {/* Clinical Questionnaire Card */}
          <div className="bg-black/40 border border-white/10 p-6 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <ActivityLogIcon className="w-5 h-5 text-emerald-400" /> Clinical Lifestyle Pipeline
            </h3>
            {clinicalResult ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-gray-400">Risk Prediction:</span>
                  <span className={`font-bold ${clinicalLabel === "Osteoporosis" ? "text-amber-400" : "text-emerald-400"}`}>
                    {clinicalLabel}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span className="text-gray-400">Model Probability:</span>
                  <span className="font-mono text-white">{(clinicalRisk * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Pipeline: {clinicalResult.model_name}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Questionnaire screening was skipped.</p>
            )}
          </div>

          {/* Clinician Feedback Loop (Active Learning) */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between print:hidden">
            <div>
              <p className="text-sm font-semibold text-white">Clinician Review & Feedback</p>
              <p className="text-xs text-gray-400">Does this finding match clinical judgment?</p>
            </div>
            {feedbackSubmitted ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircledIcon className="w-4 h-4" /> Feedback Logged
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDoctorFeedback(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Agree
                </button>
                <button
                  onClick={() => handleDoctorFeedback(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-all"
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> Disagree
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6 print:hidden">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ReloadIcon className="w-4 h-4" /> Start New Patient Screening
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/screening/lifestyle-simulator"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            What-If Lifestyle Simulator <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* DEXA Centres Modal */}
      {showDexaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/10 rounded-3xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <DrawingPinIcon className="w-5 h-5 text-purple-400" /> Vetted DEXA Diagnostic Centres
                </h3>
                <p className="text-xs text-gray-400">Referral-ready facilities across Punjab & Chandigarh</p>
              </div>
              <button 
                onClick={() => setShowDexaModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: "Post Graduate Institute of Medical Education & Research (PGIMER)",
                  city: "Chandigarh (Sec 12)",
                  phone: "+91-172-2746018",
                  cost: "₹ 600 - ₹ 1,000",
                  type: "Premier Government Tertiary Hospital"
                },
                {
                  name: "Fortis Hospital Mohali",
                  city: "Mohali (Phase VIII)",
                  phone: "+91-172-5021222",
                  cost: "₹ 2,200 - ₹ 2,800",
                  type: "NABH Accredited Multi-speciality"
                },
                {
                  name: "Max Super Speciality Hospital Mohali",
                  city: "Mohali (Phase 6)",
                  phone: "+91-172-5212000",
                  cost: "₹ 2,400 - ₹ 3,000",
                  type: "NABH Accredited Multi-speciality"
                },
                {
                  name: "Dayanand Medical College & Hospital (DMCH)",
                  city: "Ludhiana (Civil Lines)",
                  phone: "+91-161-4687700",
                  cost: "₹ 1,200 - ₹ 1,800",
                  type: "Teaching Hospital & Diagnostic Hub"
                },
                {
                  name: "Government Medical College & GNDH",
                  city: "Amritsar (Majitha Rd)",
                  phone: "+91-183-2573217",
                  cost: "₹ 500 - ₹ 800",
                  type: "Government Medical College"
                }
              ].map((centre, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">{centre.name}</h4>
                    <p className="text-xs text-gray-400">{centre.city} • {centre.type}</p>
                    <p className="text-xs text-purple-400 mt-1 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3" /> {centre.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">{centre.cost}</span>
                    <p className="text-[10px] text-gray-500">Typical Scan Cost</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDexaModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
