"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Activity, MapPin, Users, Download, Printer, ShieldCheck, 
  DollarSign, TrendingDown, AlertTriangle, CheckCircle2, 
  Filter, QrCode, FileText, Sparkles, Building2, ChevronRight, ArrowLeft 
} from "lucide-react";

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
    <div className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto text-white">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <span className="text-gray-600">•</span>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              District Health Officer (DHO) Command Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3">
            <Activity className="w-10 h-10 text-emerald-400" />
            Public Health & Camp Intelligence
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "heatmap" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            District Risk Heatmap
          </button>
          <button
            onClick={() => setActiveTab("camp")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "camp" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            Screening Camp Mode
          </button>
          <button
            onClick={() => setActiveTab("economics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "economics" ? "bg-emerald-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            DEXA Health Economics
          </button>
        </div>
      </div>

      {/* ─── TAB 1: DISTRICT RISK HEATMAP ─────────────────────────────────── */}
      {activeTab === "heatmap" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Simulated Data Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-300">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <strong>District Epidemiological Surveillance:</strong> Visualizing population-level musculoskeletal frailty clusters across Punjab & Chandigarh.
            </span>
            <span className="font-mono bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 rounded text-[10px]">
              SIMULATED DHO COHORT
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Districts List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" /> Monitored Districts (Punjab & UT)
              </h2>

              {PUNJAB_DISTRICTS.map((district) => {
                const isSelected = selectedDistrict.id === district.id;
                return (
                  <div
                    key={district.id}
                    onClick={() => setSelectedDistrict(district)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-white/10 border-emerald-500/50 shadow-lg scale-102" 
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <h3 className="font-bold text-white text-base">{district.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        district.status === "Critical" ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                        district.status === "Urgent" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}>
                        {district.status} Priority
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Screened: <strong className="text-white font-mono">{district.screened.toLocaleString()}</strong></span>
                      <span>Osteo Prevalence: <strong className="text-amber-400 font-mono">{district.osteoRiskPct}%</strong></span>
                    </div>

                    {/* Mini Prevalence Bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          district.osteoRiskPct > 30 ? "bg-rose-500" : district.osteoRiskPct > 25 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${district.osteoRiskPct * 2}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected District Deep-Dive (7 cols) */}
            <div className="lg:col-span-7 space-y-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">District Profile</span>
                  <h3 className="text-2xl font-extrabold text-white mt-0.5">{selectedDistrict.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Mobile Screening Status</span>
                  <p className={`font-bold text-sm ${selectedDistrict.vanNeeded ? "text-rose-400" : "text-emerald-400"}`}>
                    {selectedDistrict.vanNeeded ? "Mobile DEXA Van Dispatched" : "Fixed PHC Capacity Sufficient"}
                  </p>
                </div>
              </div>

              {/* District Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[11px] text-gray-400 uppercase">Screened Cohort</span>
                  <p className="text-2xl font-black font-mono text-white mt-1">{selectedDistrict.screened.toLocaleString()}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[11px] text-amber-400 uppercase">Osteoporosis Rate</span>
                  <p className="text-2xl font-black font-mono text-amber-400 mt-1">{selectedDistrict.osteoRiskPct}%</p>
                </div>
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                  <span className="text-[11px] text-blue-400 uppercase">Knee OA Burden</span>
                  <p className="text-2xl font-black font-mono text-blue-400 mt-1">{selectedDistrict.oaRiskPct}%</p>
                </div>
              </div>

              {/* DHO Tactical Recommendation */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-gray-300 space-y-2">
                <p className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> District Health Officer (DHO) Action Directive:
                </p>
                <p className="leading-relaxed">
                  Based on cluster analysis across rural Primary Health Centres in {selectedDistrict.name}, 
                  {selectedDistrict.osteoRiskPct > 30 
                    ? " urgent deployment of mobile BMD screening teams and community calcium fortification camps is recommended for blocks with high prevalence."
                    : " routine monthly ASHA frontline surveillance is maintaining baseline joint health stability."}
                </p>
                <div className="flex items-center gap-4 pt-2 border-t border-emerald-500/20 text-gray-400">
                  <span>DEXA Infrastructure: <strong>{selectedDistrict.dexaUnits} Registered Scanners</strong></span>
                  <span>Estimated Scan Deficit: <strong>{Math.round(selectedDistrict.screened * (selectedDistrict.osteoRiskPct/100) - selectedDistrict.dexaUnits * 120)} scans/mo</strong></span>
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
          <div className="bg-gradient-to-r from-emerald-950/40 via-black to-blue-950/30 border border-emerald-500/30 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
                Camp Status: Active & Operational
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Mullanpur Garibdass PHC Rural Camp
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Camp ID: <strong>CAMP-PB-2026-MOH04</strong> • Supervising Medical Officer: Dr. H. S. Dhillon, MD
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowQrPrintModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                Print Camp Poster QR
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg"
              >
                <Download className="w-4 h-4" />
                End-of-Day Summary Report
              </button>
            </div>
          </div>

          {/* End-of-Day Camp Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-xs text-gray-400 uppercase font-semibold">Total Walk-ins Screened</span>
              <p className="text-3xl font-black text-white mt-1">74 Patients</p>
              <span className="text-[11px] text-gray-500">100% on phone browsers</span>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl">
              <span className="text-xs text-rose-300 uppercase font-semibold">Critical Red Referrals</span>
              <p className="text-3xl font-black text-rose-400 mt-1">18 Cases (24.3%)</p>
              <span className="text-[11px] text-rose-300/80">Batch referred to Fortis/PGI</span>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl">
              <span className="text-xs text-amber-300 uppercase font-semibold">Moderate Interventions</span>
              <p className="text-3xl font-black text-amber-400 mt-1">31 Cases (41.8%)</p>
              <span className="text-[11px] text-amber-300/80">Vit-D + Calcium dispensed</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl">
              <span className="text-xs text-emerald-300 uppercase font-semibold">Camp Cost Savings</span>
              <p className="text-3xl font-black text-emerald-400 mt-1">₹ 1,12,000</p>
              <span className="text-[11px] text-emerald-300/80">Unnecessary DEXAs prevented</span>
            </div>
          </div>

          {/* Camp Walk-in Workflow Steps */}
          <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4">Frontline Rural Operational Workflow</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">1</span>
                <p className="font-bold text-white">Poster QR Registration</p>
                <p className="text-xs text-gray-400">Patient or ASHA worker scans the printed camp QR on their phone. No app download needed.</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">2</span>
                <p className="font-bold text-white">30-Second Movement & X-Ray</p>
                <p className="text-xs text-gray-400">Phone camera evaluates gait/squat kinematics. Existing clinical X-rays are photographed & evaluated.</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">3</span>
                <p className="font-bold text-white">Instant Color Triage & e-Slip</p>
                <p className="text-xs text-gray-400">Patient receives color-coded triage slip. Red referrals batch-exported directly to the district hospital.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: HEALTH ECONOMICS & DEXA TRIAGE ─────────────────────────── */}
      {activeTab === "economics" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Strategic Positioning Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950/50 via-purple-950/30 to-black border border-white/10">
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
              Strategic Health Policy Positioning
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1 mb-2">
              Pre-Screening to Protect Scarce Diagnostic Infrastructure
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed">
              We do <strong>not replace DEXA</strong>. DEXA is the definitive gold-standard diagnostic. 
              Instead, Swastik acts as a <strong>rapid upstream triage sieve</strong>, ensuring scarce, high-cost hospital scanners are reserved for individuals with verified high pre-test probability, while sparing healthy rural citizens unnecessary travel and out-of-pocket costs.
            </p>
          </div>

          {/* 3-Strategy Comparison Table */}
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Economic Health Technology Assessment (HTA) Model</h3>
              <p className="text-xs text-gray-400">Modeled for a standardized population cohort of 1,000 at-risk rural citizens (Age ≥ 50)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs text-gray-400 uppercase border-b border-white/10">
                  <tr>
                    <th className="py-4 px-6">Strategy</th>
                    <th className="py-4 px-6">Primary Approach</th>
                    <th className="py-4 px-6">Total Direct Cost</th>
                    <th className="py-4 px-6">DEXA Scanner Load</th>
                    <th className="py-4 px-6 text-right">Economic Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {/* Strategy A */}
                  <tr className="hover:bg-white/5">
                    <td className="py-4 px-6 font-bold text-gray-300">Strategy 1: Universal DEXA</td>
                    <td className="py-4 px-6 text-xs text-gray-400">Send all 1,000 citizens directly for hospital DEXA scans</td>
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">₹ 25,00,000</td>
                    <td className="py-4 px-6 text-xs text-rose-300">1,000 scans (Severe 5-month backlog)</td>
                    <td className="py-4 px-6 text-right text-xs text-gray-500">Prohibitively expensive</td>
                  </tr>

                  {/* Strategy B: SWASTIK */}
                  <tr className="bg-emerald-500/10 border-emerald-500/30">
                    <td className="py-4 px-6 font-bold text-emerald-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Strategy 2: Swastik 2-Stage Triage
                    </td>
                    <td className="py-4 px-6 text-xs text-emerald-200">
                      Pre-screen 1,000 via browser (₹0 hardware). Only refer 280 high-risk cases to DEXA.
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-emerald-400 text-base">₹ 7,00,000</td>
                    <td className="py-4 px-6 text-xs text-emerald-300">280 scans (72% load reduction)</td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400 text-sm">
                      Saves ₹ 18,00,000 (72% Savings)
                    </td>
                  </tr>

                  {/* Strategy C */}
                  <tr className="hover:bg-white/5">
                    <td className="py-4 px-6 font-bold text-gray-300">Strategy 3: Status Quo (Do Nothing)</td>
                    <td className="py-4 px-6 text-xs text-gray-400">Zero screening. Treat only after catastrophic hip/spine fracture.</td>
                    <td className="py-4 px-6 font-mono font-bold text-rose-400">₹ 45,00,000+</td>
                    <td className="py-4 px-6 text-xs text-gray-400">Emergency orthopaedic surgeries</td>
                    <td className="py-4 px-6 text-right text-xs text-rose-400">High mortality & disability</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Printable Poster QR Modal */}
      {showQrPrintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-white/10 rounded-3xl max-w-md w-full p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-1">Camp Walk-In Poster QR</h3>
            <p className="text-xs text-gray-400 mb-6">Mullanpur Garibdass PHC • Camp ID: PB-2026-MOH04</p>

            <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl mb-6">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=https://swastik.health/camp/mullanpur-pb" 
                alt="Camp Walk-In QR"
                className="w-48 h-48 mx-auto"
              />
              <p className="text-[11px] font-bold text-gray-800 font-mono mt-3 uppercase tracking-wider">
                Scan to Register Walk-in Patient
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Camp Poster
              </button>
              <button
                onClick={() => setShowQrPrintModal(false)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium"
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
