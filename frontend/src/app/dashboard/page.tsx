"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  DrawingPinIcon, 
  DownloadIcon, 
  CheckCircledIcon, 
  ExclamationTriangleIcon, 
  MagicWandIcon, 
  MixerHorizontalIcon, 
  BarChartIcon, 
  ActivityLogIcon, 
  ReaderIcon,
  Cross2Icon
} from "@radix-ui/react-icons";

type DistrictData = {
  id: string;
  name: string;
  screened: number;
  osteoRiskPct: number;
  oaRiskPct: number;
  status: "Critical" | "Urgent" | "Moderate" | "Normal";
  dexaUnits: number;
  vanNeeded: boolean;
};

const PUNJAB_DISTRICTS: DistrictData[] = [
  { id: "mohali", name: "SAS Nagar (Mohali)", screened: 4120, osteoRiskPct: 28.4, oaRiskPct: 34.2, status: "Urgent", dexaUnits: 4, vanNeeded: true },
  { id: "ludhiana", name: "Ludhiana", screened: 6850, osteoRiskPct: 32.1, oaRiskPct: 39.5, status: "Critical", dexaUnits: 6, vanNeeded: true },
  { id: "bathinda", name: "Bathinda", screened: 2890, osteoRiskPct: 34.6, oaRiskPct: 37.8, status: "Critical", dexaUnits: 2, vanNeeded: true },
  { id: "patiala", name: "Patiala", screened: 3210, osteoRiskPct: 26.2, oaRiskPct: 29.4, status: "Moderate", dexaUnits: 3, vanNeeded: false },
  { id: "amritsar", name: "Amritsar", screened: 3940, osteoRiskPct: 24.8, oaRiskPct: 31.0, status: "Moderate", dexaUnits: 4, vanNeeded: false },
  { id: "jalandhar", name: "Jalandhar", screened: 4400, osteoRiskPct: 22.9, oaRiskPct: 27.5, status: "Normal", dexaUnits: 5, vanNeeded: false },
  { id: "chandigarh", name: "Chandigarh (UT)", screened: 5120, osteoRiskPct: 18.2, oaRiskPct: 22.4, status: "Normal", dexaUnits: 7, vanNeeded: false },
];

export default function PublicHealthDashboard() {
  const [activeTab, setActiveTab] = useState<"heatmap" | "camp" | "economics">("heatmap");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData>(PUNJAB_DISTRICTS[0]);
  const [showQrPrintModal, setShowQrPrintModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pt-24 pb-16 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium transition-colors">
              <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-semibold text-[#E65100] bg-[#FFEFEA] border border-[#FFD8CC] px-2.5 py-0.5 rounded-full">
              District Health Officer (DHO) Command Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Public Health & Camp Intelligence
          </h1>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex items-center gap-1 bg-white border border-[#EBE8E3] p-1.5 rounded-full shadow-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === "heatmap" 
                ? "bg-[#FF6B4A] text-white shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-[#FAF9F6]"
            }`}
          >
            District Risk Heatmap
          </button>
          <button
            onClick={() => setActiveTab("camp")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === "camp" 
                ? "bg-[#FF6B4A] text-white shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-[#FAF9F6]"
            }`}
          >
            Screening Camp Mode
          </button>
          <button
            onClick={() => setActiveTab("economics")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              activeTab === "economics" 
                ? "bg-[#FF6B4A] text-white shadow-sm" 
                : "text-gray-600 hover:text-gray-900 hover:bg-[#FAF9F6]"
            }`}
          >
            DEXA Health Economics
          </button>
        </div>
      </div>

      {/* ─── TAB 1: DISTRICT RISK HEATMAP ─────────────────────────────────── */}
      {activeTab === "heatmap" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Simulated Cohort Notice */}
          <div className="p-4 rounded-2xl bg-[#FFEFEA] border border-[#FFD8CC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9C3818]">
            <span className="flex items-center gap-2">
              <MagicWandIcon className="w-4 h-4 text-[#FF6B4A] flex-shrink-0" />
              <span><strong>District Epidemiological Surveillance:</strong> Visualizing population-level musculoskeletal frailty clusters across Punjab & Chandigarh.</span>
            </span>
            <span className="font-semibold bg-white border border-[#FFD8CC] text-[#E65100] px-3 py-1 rounded-full text-[11px] self-start sm:self-auto">
              Simulated DHO Cohort
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Districts List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <DrawingPinIcon className="w-4 h-4 text-[#FF6B4A]" /> Monitored Districts (Punjab & UT)
              </h2>

              {PUNJAB_DISTRICTS.map((district) => {
                const isSelected = selectedDistrict.id === district.id;
                return (
                  <div
                    key={district.id}
                    onClick={() => setSelectedDistrict(district)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-white border-[#FF6B4A] shadow-md ring-2 ring-[#FF6B4A]/10 -translate-y-0.5" 
                        : "bg-white border-[#EBE8E3] hover:border-gray-300 hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <h3 className="font-bold text-gray-900 text-sm">{district.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        district.status === "Critical" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        district.status === "Urgent" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {district.status} Priority
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Screened: <strong className="text-gray-900 font-semibold">{district.screened.toLocaleString()}</strong></span>
                      <span>Osteo Prevalence: <strong className="text-[#FF6B4A] font-semibold">{district.osteoRiskPct}%</strong></span>
                    </div>

                    {/* Mini Prevalence Bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          district.osteoRiskPct > 30 ? "bg-rose-500" : district.osteoRiskPct > 25 ? "bg-[#FF6B4A]" : "bg-emerald-500"
                        }`}
                        style={{ width: `${district.osteoRiskPct * 2}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected District Deep-Dive (7 cols) */}
            <div className="lg:col-span-7 space-y-6 bg-white border border-[#EBE8E3] p-6 md:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-start border-b border-[#EBE8E3] pb-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">District Profile</span>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">{selectedDistrict.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Mobile Screening Status</span>
                  <p className={`font-bold text-xs mt-0.5 ${selectedDistrict.vanNeeded ? "text-[#FF6B4A]" : "text-emerald-700"}`}>
                    {selectedDistrict.vanNeeded ? "Mobile Screening Van Dispatched" : "Fixed PHC Capacity Sufficient"}
                  </p>
                </div>
              </div>

              {/* District Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#EBE8E3]">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Screened Cohort</span>
                  <p className="text-2xl font-black text-gray-900 mt-1">{selectedDistrict.screened.toLocaleString()}</p>
                </div>
                <div className="bg-[#FFF8F6] p-4 rounded-2xl border border-[#FFD8CC]">
                  <span className="text-[11px] font-semibold text-[#E65100] uppercase">Osteoporosis Rate</span>
                  <p className="text-2xl font-black text-[#FF6B4A] mt-1">{selectedDistrict.osteoRiskPct}%</p>
                </div>
                <div className="bg-[#F0FDF4] p-4 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase">Knee OA Burden</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{selectedDistrict.oaRiskPct}%</p>
                </div>
              </div>

              {/* DHO Tactical Recommendation */}
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#EBE8E3] text-xs text-gray-700 space-y-2.5">
                <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <ActivityLogIcon className="w-4 h-4 text-[#FF6B4A]" /> District Health Officer (DHO) Action Directive:
                </p>
                <p className="leading-relaxed">
                  Based on cluster analysis across rural Primary Health Centres in {selectedDistrict.name}, 
                  {selectedDistrict.osteoRiskPct > 30 
                    ? " urgent deployment of mobile BMD screening teams and community calcium fortification camps is recommended for blocks with high prevalence."
                    : " routine monthly ASHA frontline surveillance is maintaining baseline joint health stability."}
                </p>
                <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-[#EBE8E3] text-gray-600 font-medium">
                  <span>DEXA Infrastructure: <strong className="text-gray-900">{selectedDistrict.dexaUnits} Registered Scanners</strong></span>
                  <span>Estimated Scan Deficit: <strong className="text-gray-900">{Math.round(selectedDistrict.screened * (selectedDistrict.osteoRiskPct/100) - selectedDistrict.dexaUnits * 120)} scans/mo</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SCREENING CAMP MODE ───────────────────────────────────── */}
      {activeTab === "camp" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Camp Header Card */}
          <div className="bg-white border border-[#EBE8E3] p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Camp Status: Active & Operational
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Mullanpur Garibdass PHC Rural Camp
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Camp ID: <strong className="text-gray-800">CAMP-PB-2026-MOH04</strong> • Supervising Medical Officer: Dr. H. S. Dhillon, MD
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowQrPrintModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-[#EBE8E3] hover:bg-[#FAF9F6] text-gray-800 font-semibold text-xs transition-all shadow-sm"
              >
                <ReaderIcon className="w-4 h-4 text-[#FF6B4A]" />
                Print Camp Poster QR
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold text-xs transition-all shadow-md"
              >
                <DownloadIcon className="w-4 h-4" />
                End-of-Day Summary Report
              </button>
            </div>
          </div>

          {/* End-of-Day Camp Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
              <span className="text-xs text-gray-500 uppercase font-semibold">Total Walk-ins Screened</span>
              <p className="text-3xl font-black text-gray-900 mt-2">74 Patients</p>
              <span className="text-[11px] text-gray-400 mt-1 block">100% on phone browsers</span>
            </div>
            <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
              <span className="text-xs text-rose-700 uppercase font-semibold">Critical Red Referrals</span>
              <p className="text-3xl font-black text-rose-600 mt-2">18 Cases</p>
              <span className="text-[11px] text-rose-500 mt-1 block">Batch referred to Fortis/PGI</span>
            </div>
            <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
              <span className="text-xs text-amber-700 uppercase font-semibold">Moderate Interventions</span>
              <p className="text-3xl font-black text-amber-600 mt-2">31 Cases</p>
              <span className="text-[11px] text-amber-600 mt-1 block">Vit-D + Calcium dispensed</span>
            </div>
            <div className="bg-white border border-[#EBE8E3] p-6 rounded-3xl shadow-sm">
              <span className="text-xs text-emerald-700 uppercase font-semibold">Camp Cost Savings</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">₹ 1,12,000</p>
              <span className="text-[11px] text-emerald-600 mt-1 block">Unnecessary DEXAs prevented</span>
            </div>
          </div>

          {/* Frontline Workflow Steps */}
          <div className="bg-white border border-[#EBE8E3] p-6 md:p-8 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Frontline Rural Operational Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#EBE8E3] space-y-2">
                <span className="w-7 h-7 rounded-full bg-[#FFEFEA] text-[#FF6B4A] font-bold flex items-center justify-center text-xs">1</span>
                <p className="font-bold text-gray-900">Poster QR Registration</p>
                <p className="text-xs text-gray-600 leading-relaxed">Patient or ASHA worker scans the printed camp QR on their phone. No mobile app download needed.</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#EBE8E3] space-y-2">
                <span className="w-7 h-7 rounded-full bg-[#FFEFEA] text-[#FF6B4A] font-bold flex items-center justify-center text-xs">2</span>
                <p className="font-bold text-gray-900">30-Second Movement & X-Ray</p>
                <p className="text-xs text-gray-600 leading-relaxed">Phone camera evaluates gait/squat kinematics. Existing clinical X-rays are photographed & evaluated.</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#EBE8E3] space-y-2">
                <span className="w-7 h-7 rounded-full bg-[#FFEFEA] text-[#FF6B4A] font-bold flex items-center justify-center text-xs">3</span>
                <p className="font-bold text-gray-900">Instant Color Triage & e-Slip</p>
                <p className="text-xs text-gray-600 leading-relaxed">Patient receives color-coded triage slip. Red referrals batch-exported directly to the district hospital.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: HEALTH ECONOMICS & DEXA TRIAGE ─────────────────────────── */}
      {activeTab === "economics" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Strategic Positioning Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-white border border-[#EBE8E3] shadow-sm">
            <span className="text-xs uppercase font-bold text-[#FF6B4A] tracking-wider">
              Strategic Health Policy Positioning
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1 mb-3">
              Pre-Screening to Protect Scarce Diagnostic Infrastructure
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-3xl leading-relaxed">
              We do <strong>not replace DEXA</strong>. DEXA is the definitive gold-standard diagnostic. 
              Instead, Swastik acts as a <strong>rapid upstream triage sieve</strong>, ensuring scarce, high-cost hospital scanners are reserved for individuals with verified high pre-test probability, while sparing healthy rural citizens unnecessary travel and out-of-pocket costs.
            </p>
          </div>

          {/* 3-Strategy Comparison Table */}
          <div className="bg-white border border-[#EBE8E3] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#EBE8E3]">
              <h3 className="text-lg font-bold text-gray-900">Economic Health Technology Assessment (HTA) Model</h3>
              <p className="text-xs text-gray-500">Modeled for a standardized population cohort of 1,000 at-risk rural citizens (Age ≥ 50)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9F6] text-xs text-gray-500 uppercase border-b border-[#EBE8E3]">
                  <tr>
                    <th className="py-4 px-6 font-semibold">Strategy</th>
                    <th className="py-4 px-6 font-semibold">Primary Approach</th>
                    <th className="py-4 px-6 font-semibold">Total Direct Cost</th>
                    <th className="py-4 px-6 font-semibold">DEXA Scanner Load</th>
                    <th className="py-4 px-6 text-right font-semibold">Economic Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE8E3] font-sans">
                  {/* Strategy 1 */}
                  <tr className="hover:bg-[#FAF9F6]/50">
                    <td className="py-4 px-6 font-bold text-gray-800">Strategy 1: Universal DEXA</td>
                    <td className="py-4 px-6 text-xs text-gray-600">Send all 1,000 citizens directly for hospital DEXA scans</td>
                    <td className="py-4 px-6 font-bold text-rose-600">₹ 25,00,000</td>
                    <td className="py-4 px-6 text-xs text-rose-700">1,000 scans (Severe 5-month backlog)</td>
                    <td className="py-4 px-6 text-right text-xs text-gray-500">Prohibitively expensive</td>
                  </tr>

                  {/* Strategy 2: SWASTIK */}
                  <tr className="bg-[#FFF8F6]">
                    <td className="py-4 px-6 font-bold text-[#FF6B4A] flex items-center gap-2">
                      <MagicWandIcon className="w-4 h-4 text-[#FF6B4A]" /> Strategy 2: Swastik 2-Stage Triage
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-700">
                      Pre-screen 1,000 via browser (₹0 hardware). Only refer 280 high-risk cases to DEXA.
                    </td>
                    <td className="py-4 px-6 font-bold text-[#FF6B4A] text-base">₹ 7,00,000</td>
                    <td className="py-4 px-6 text-xs text-emerald-700 font-semibold">280 scans (72% load reduction)</td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-600 text-sm">
                      Saves ₹ 18,00,000 (72% Savings)
                    </td>
                  </tr>

                  {/* Strategy 3 */}
                  <tr className="hover:bg-[#FAF9F6]/50">
                    <td className="py-4 px-6 font-bold text-gray-800">Strategy 3: Status Quo (Do Nothing)</td>
                    <td className="py-4 px-6 text-xs text-gray-600">Zero screening. Treat only after catastrophic hip/spine fracture.</td>
                    <td className="py-4 px-6 font-bold text-rose-600">₹ 45,00,000+</td>
                    <td className="py-4 px-6 text-xs text-gray-500">Emergency orthopaedic surgeries</td>
                    <td className="py-4 px-6 text-right text-xs text-rose-600">High mortality & disability</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Printable Poster QR Modal */}
      {showQrPrintModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE8E3] rounded-3xl max-w-md w-full p-8 text-center shadow-2xl relative">
            <button 
              onClick={() => setShowQrPrintModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Cross2Icon className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-1">Camp Walk-In Poster QR</h3>
            <p className="text-xs text-gray-500 mb-6">Mullanpur Garibdass PHC • Camp ID: PB-2026-MOH04</p>

            <div className="bg-[#FAF9F6] border border-[#EBE8E3] p-6 rounded-2xl inline-block mb-6">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=https://swastik.health/camp/mullanpur-pb" 
                alt="Camp Walk-In QR"
                className="w-48 h-48 mx-auto rounded-lg"
              />
              <p className="text-[11px] font-bold text-gray-700 mt-3 uppercase tracking-wider">
                Scan to Register Walk-in Patient
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3.5 rounded-full bg-[#FF6B4A] hover:bg-[#E85938] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <DownloadIcon className="w-4 h-4" /> Print Camp Poster
              </button>
              <button
                onClick={() => setShowQrPrintModal(false)}
                className="px-6 py-3.5 rounded-full bg-white border border-[#EBE8E3] text-gray-700 hover:bg-[#FAF9F6] text-sm font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
