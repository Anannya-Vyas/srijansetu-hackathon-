"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, ArrowLeft, Plus, Download, CheckCircle2, AlertTriangle, 
  MapPin, Phone, Filter, Sparkles, FileText, ArrowRight, ShieldCheck 
} from "lucide-react";

type QueuePatient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  village: string;
  riskTier: "High" | "Moderate" | "Low";
  vitalityScore: number;
  flaggedCondition: string;
  contact: string;
  timestamp: string;
};

const INITIAL_QUEUE: QueuePatient[] = [
  {
    id: "RUR-PB-081",
    name: "Smt. Paramjit Kaur",
    age: 67,
    gender: "Female",
    village: "Mullanpur Garibdass, Mohali",
    riskTier: "High",
    vitalityScore: 32,
    flaggedCondition: "Severe Trabecular Thinning + Bilateral Knee OA",
    contact: "+91 98765-11029",
    timestamp: "10:14 AM"
  },
  {
    id: "RUR-PB-082",
    name: "Sh. Harpreet Singh",
    age: 54,
    gender: "Male",
    village: "Majri, SAS Nagar",
    riskTier: "Moderate",
    vitalityScore: 58,
    flaggedCondition: "Early Osteopenia + Antalgic Gait Asymmetry",
    contact: "+91 94172-88201",
    timestamp: "10:45 AM"
  },
  {
    id: "RUR-PB-083",
    name: "Smt. Gurmeet Devi",
    age: 71,
    gender: "Female",
    village: "Kurali, Mohali",
    riskTier: "High",
    vitalityScore: 28,
    flaggedCondition: "Critical Fracture Risk (<4s Single Leg Stance)",
    contact: "+91 98141-55032",
    timestamp: "11:20 AM"
  },
  {
    id: "RUR-PB-084",
    name: "Smt. Sunita Sharma",
    age: 38,
    gender: "Female",
    village: "Kharar, Punjab",
    riskTier: "Low",
    vitalityScore: 88,
    flaggedCondition: "Healthy Joint Excursion & Bone Density",
    contact: "+91 97800-44910",
    timestamp: "11:50 AM"
  },
  {
    id: "RUR-PB-085",
    name: "Sh. Balwinder Singh",
    age: 63,
    gender: "Male",
    village: "Siswan, Punjab",
    riskTier: "High",
    vitalityScore: 36,
    flaggedCondition: "Subchondral Sclerosis + Restricted Extension",
    contact: "+91 98722-66190",
    timestamp: "12:15 PM"
  },
  {
    id: "RUR-PB-086",
    name: "Smt. Jasbir Kaur",
    age: 49,
    gender: "Female",
    village: "Mullanpur, Mohali",
    riskTier: "Moderate",
    vitalityScore: 61,
    flaggedCondition: "Mild Hip Flexion Guarding",
    contact: "+91 94630-11234",
    timestamp: "12:40 PM"
  }
];

export default function WorkerQueuePage() {
  const [queue, setQueue] = useState<QueuePatient[]>(INITIAL_QUEUE);
  const [filterTier, setFilterTier] = useState<string>("All");
  const [batchExported, setBatchExported] = useState(false);

  const filteredQueue = filterTier === "All" 
    ? queue 
    : queue.filter(p => p.riskTier === filterTier);

  const highRiskCount = queue.filter(p => p.riskTier === "High").length;
  const modRiskCount = queue.filter(p => p.riskTier === "Moderate").length;
  const lowRiskCount = queue.filter(p => p.riskTier === "Low").length;

  const handleExportRedBatch = () => {
    setBatchExported(true);
    // Trigger CSV export
    const highRiskPatients = queue.filter(p => p.riskTier === "High");
    const headers = "Patient ID,Name,Age,Gender,Village,Vitality Score,Flagged Condition,Contact,Referral Destination\n";
    const rows = highRiskPatients.map(p => 
      `"${p.id}","${p.name}",${p.age},"${p.gender}","${p.village}",${p.vitalityScore}%,"${p.flaggedCondition}","${p.contact}","PGIMER Chandigarh / Fortis Mohali"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ASHA_Red_Referral_Batch_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto text-white">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Community Health Worker (ASHA / ANM) Portal
        </div>
      </div>

      {/* Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-emerald-400" />
            Rural Screening Camp Queue
          </h1>
          <p className="text-gray-400 max-w-xl text-sm md:text-base">
            Camp Location: <strong>Mullanpur Garibdass PHC (SAS Nagar, Punjab)</strong>. Fast triage mode for frontline workers — scan patient after patient, filter by priority, and batch-export critical referrals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportRedBatch}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/40 hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Export Red Referral Batch ({highRiskCount})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <span className="text-xs text-gray-400 uppercase font-semibold">Total Screened Today</span>
          <p className="text-3xl font-extrabold text-white mt-1">{queue.length}</p>
          <span className="text-[11px] text-gray-500">Average 3.2 min per patient</span>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl">
          <span className="text-xs text-rose-300 uppercase font-semibold">Red (Immediate Referral)</span>
          <p className="text-3xl font-extrabold text-rose-400 mt-1">{highRiskCount}</p>
          <span className="text-[11px] text-rose-400/80">Require DEXA & Ortho Triage</span>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl">
          <span className="text-xs text-amber-300 uppercase font-semibold">Yellow (Guarded / Follow-up)</span>
          <p className="text-3xl font-extrabold text-amber-400 mt-1">{modRiskCount}</p>
          <span className="text-[11px] text-amber-400/80">Calcium & Physio Routine</span>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl">
          <span className="text-xs text-emerald-300 uppercase font-semibold">Green (Healthy Baseline)</span>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1">{lowRiskCount}</p>
          <span className="text-[11px] text-emerald-400/80">Normal Age-Matched Arc</span>
        </div>
      </div>

      {/* Rural Cost & Access Comparison Callout */}
      <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-black border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Rural Health Equity & Economic Impact
          </h3>
          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            Conventional DEXA scans cost <strong>₹ 1,500 – ₹ 3,000</strong> plus travel to urban tertiary centres. Swastik runs opportunistic triage on commodity phone cameras inside any browser for <strong>₹ 0 additional hardware cost</strong>, preventing unnecessary out-of-pocket rural expenditure.
          </p>
        </div>
        <div className="bg-black/60 border border-white/10 px-5 py-3 rounded-2xl text-center min-w-[180px]">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">Est. Camp Savings</span>
          <p className="text-2xl font-black text-emerald-400 mt-0.5">₹ 14,500+</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-gray-400 mr-2 flex items-center gap-1 font-semibold">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {["All", "High", "Moderate", "Low"].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterTier(tier)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterTier === tier
                ? "bg-white text-black shadow-md"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            {tier === "High" ? "Red (High Risk)" : tier === "Moderate" ? "Yellow (Moderate)" : tier === "Low" ? "Green (Low)" : "All Patients"}
          </button>
        ))}
      </div>

      {/* Patient Queue Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs text-gray-400 uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Patient</th>
                <th className="py-4 px-6">Triage Level</th>
                <th className="py-4 px-6">Vitality Index</th>
                <th className="py-4 px-6">Flagged Biomechanical Concern</th>
                <th className="py-4 px-6">Village / Contact</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredQueue.map((patient) => (
                <tr key={patient.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-base">{patient.name}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      {patient.id} • {patient.age}y ({patient.gender}) • {patient.timestamp}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      patient.riskTier === "High"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : patient.riskTier === "Moderate"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        patient.riskTier === "High" ? "bg-rose-400 animate-pulse" : patient.riskTier === "Moderate" ? "bg-amber-400" : "bg-emerald-400"
                      }`} />
                      {patient.riskTier} Risk
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-white">{patient.vitalityScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300 text-xs max-w-xs">
                    {patient.flaggedCondition}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs text-white">{patient.village}</div>
                    <div className="text-[11px] text-gray-400 font-mono mt-0.5">{patient.contact}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href="/screening/osteoporosis/results"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Slip
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
