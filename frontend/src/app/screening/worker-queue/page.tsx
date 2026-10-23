"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  DownloadIcon, 
  CheckCircledIcon, 
  ExclamationTriangleIcon, 
  PersonIcon, 
  MagicWandIcon, 
  FileTextIcon, 
  MixerHorizontalIcon, 
  LockClosedIcon,
  LayersIcon,
} from "@radix-ui/react-icons";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Home
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEFEA] text-[#E65100] border border-[#FFD8CC]">
          <MagicWandIcon className="w-3.5 h-3.5" /> Community Health Worker (ASHA / ANM) Portal
        </div>
      </div>

      {/* Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2">
            Rural Screening Camp Queue
          </h1>
          <p className="text-gray-600 max-w-xl text-sm md:text-base">
            Camp Location: <strong className="text-gray-900">Mullanpur Garibdass PHC (SAS Nagar, Punjab)</strong>. Rapid triage mode for frontline workers — screen walk-ins, filter by priority, and batch-export critical referrals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportRedBatch}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold text-xs transition-all shadow-[0_8px_20px_-4px_rgba(255,107,74,0.35)] hover:-translate-y-0.5"
          >
            <DownloadIcon className="w-4 h-4" />
            Export Red Referral Batch ({highRiskCount})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
          <span className="text-xs text-gray-500 uppercase font-semibold">Total Screened Today</span>
          <p className="text-3xl font-black text-gray-900 mt-2">{queue.length}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Average 3.2 min per patient</span>
        </div>

        <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
          <span className="text-xs text-rose-700 uppercase font-semibold">Red (Immediate Referral)</span>
          <p className="text-3xl font-black text-rose-600 mt-2">{highRiskCount}</p>
          <span className="text-[11px] text-rose-500 mt-1 block">Require DEXA & Ortho Triage</span>
        </div>

        <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
          <span className="text-xs text-amber-700 uppercase font-semibold">Yellow (Guarded)</span>
          <p className="text-3xl font-black text-amber-600 mt-2">{modRiskCount}</p>
          <span className="text-[11px] text-amber-600 mt-1 block">Calcium & Physio Routine</span>
        </div>

        <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
          <span className="text-xs text-emerald-700 uppercase font-semibold">Green (Healthy Baseline)</span>
          <p className="text-3xl font-black text-emerald-600 mt-2">{lowRiskCount}</p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Normal Age-Matched Arc</span>
        </div>
      </div>

      {/* Rural Cost & Access Callout */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border border-[#EBE8E3] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5 text-[#FF6B4A]" /> Rural Health Equity & Economic Impact
          </h3>
          <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
            Conventional DEXA scans cost <strong>₹ 1,500 – ₹ 3,000</strong> plus travel to urban tertiary centres. Swastik runs opportunistic triage on commodity phone cameras inside any browser for <strong>₹ 0 additional hardware cost</strong>, preventing unnecessary out-of-pocket rural expenditure.
          </p>
        </div>
        <div className="bg-[#FAF9F6] border border-[#EBE8E3] px-6 py-4 rounded-2xl text-center min-w-[200px]">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Est. Camp Savings</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹ 14,500+</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-gray-500 mr-2 flex items-center gap-1 font-semibold">
          <MixerHorizontalIcon className="w-3.5 h-3.5" /> Filter:
        </span>
        {["All", "High", "Moderate", "Low"].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterTier(tier)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              filterTier === tier
                ? "bg-[#FF6B4A] text-white shadow-sm"
                : "bg-white text-gray-600 hover:text-gray-900 hover:bg-[#FAF9F6] border border-[#EBE8E3]"
            }`}
          >
            {tier === "High" ? "Red (High Risk)" : tier === "Moderate" ? "Yellow (Moderate)" : tier === "Low" ? "Green (Low)" : "All Patients"}
          </button>
        ))}
      </div>

      {/* Patient Queue Table */}
      <div className="bg-white border border-[#EBE8E3] rounded-3xl overflow-hidden shadow-sm mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF9F6] text-xs text-gray-500 uppercase tracking-wider border-b border-[#EBE8E3]">
              <tr>
                <th className="py-4 px-6 font-semibold">Patient</th>
                <th className="py-4 px-6 font-semibold">Triage Level</th>
                <th className="py-4 px-6 font-semibold">Vitality Index</th>
                <th className="py-4 px-6 font-semibold">Flagged Biomechanical Concern</th>
                <th className="py-4 px-6 font-semibold">Village / Contact</th>
                <th className="py-4 px-6 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE8E3]">
              {filteredQueue.map((patient) => (
                <tr key={patient.id} className="hover:bg-[#FAF9F6] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 text-base">{patient.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {patient.id} • {patient.age}y ({patient.gender}) • {patient.timestamp}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      patient.riskTier === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : patient.riskTier === "Moderate"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        patient.riskTier === "High" ? "bg-rose-500 animate-pulse" : patient.riskTier === "Moderate" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      {patient.riskTier} Risk
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-black text-base text-gray-900">{patient.vitalityScore}%</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 text-xs max-w-xs leading-relaxed">
                    {patient.flaggedCondition}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-xs font-semibold text-gray-800">{patient.village}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{patient.contact}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href="/screening/osteoporosis/results"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-[#EBE8E3] hover:bg-[#FAF9F6] text-gray-800 transition-all shadow-sm"
                    >
                      <FileTextIcon className="w-3.5 h-3.5 text-[#FF6B4A]" /> View Slip
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
