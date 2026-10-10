"use client";
import Link from "next/link";
import { UserCircle, ArrowLeft, FileText, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 relative selection:bg-purple-500/30 overflow-y-auto">
      <div className="max-w-6xl mx-auto pt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-purple-500/20 flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Anannya Vyas</h1>
            <p className="text-purple-400 font-mono text-sm">Patient ID: MRN-29381-IN</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400"/> Recent Diagnostic Reports</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-black/50 rounded-xl border border-white/5 hover:border-purple-500/30 cursor-pointer transition-colors">
                <div>
                  <p className="font-medium text-white">Full Joint Analysis (Knee)</p>
                  <p className="text-xs text-white/50 mt-1">Oct 11, 2026 - AI Assisted</p>
                </div>
                <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Normal</div>
              </div>
              <div className="flex justify-between items-center p-4 bg-black/50 rounded-xl border border-white/5 hover:border-purple-500/30 cursor-pointer transition-colors">
                <div>
                  <p className="font-medium text-white">Metabolic Screening</p>
                  <p className="text-xs text-white/50 mt-1">Sep 01, 2026</p>
                </div>
                <div className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">Review Needed</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400"/> Telemetry & Vitals</h3>
            <div className="p-4 bg-black/50 rounded-xl border border-white/5">
              <p className="text-sm text-white/70 mb-4">Your kinematic telemetry data from your last screening is securely stored on Tiger Data TimescaleDB.</p>
              <div className="h-32 bg-purple-500/5 rounded-lg border border-purple-500/10 flex items-center justify-center">
                <span className="text-purple-400/50 text-sm font-mono">[ Historical Kinematic Graph ]</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
