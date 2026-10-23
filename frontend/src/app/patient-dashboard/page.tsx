"use client";

import Link from "next/link";
import { 
  PersonIcon, 
  ArrowLeftIcon, 
  FileTextIcon, 
  ActivityLogIcon, 
  MagicWandIcon,
  CheckCircledIcon, 
  ExclamationTriangleIcon
} from "@radix-ui/react-icons";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pt-24 pb-16 px-4 sm:px-6 md:px-10 max-w-6xl mx-auto">
      {/* Top Header */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium mb-8">
        <ArrowLeftIcon className="w-4 h-4" /> Back to Home
      </Link>
      
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-[0_15px_45px_-10px_rgba(0,0,0,0.03)]">
        <div className="w-20 h-20 rounded-2xl bg-[#FFEFEA] border border-[#FFD8CC] flex items-center justify-center text-[#FF6B4A]">
          <PersonIcon className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEFEA] text-[#E65100] border border-[#FFD8CC] mb-2">
            <MagicWandIcon className="w-3.5 h-3.5" /> Longitudinal Health Record
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Anannya Vyas</h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Patient Identifier: MRN-29381-IN • Age: 62 • Female</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-[#FF6B4A]"/> Recent Diagnostic Screenings
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-[#FAF9F6] rounded-2xl border border-[#EBE8E3] hover:border-[#FF6B4A]/50 cursor-pointer transition-colors">
              <div>
                <p className="font-bold text-gray-900 text-sm">Full Joint Analysis (Knee)</p>
                <p className="text-xs text-gray-500 mt-0.5">Oct 11, 2026 • AI Assisted Computer Vision</p>
              </div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">Normal</div>
            </div>
            <div className="flex justify-between items-center p-4 bg-[#FAF9F6] rounded-2xl border border-[#EBE8E3] hover:border-[#FF6B4A]/50 cursor-pointer transition-colors">
              <div>
                <p className="font-bold text-gray-900 text-sm">Osteoporosis Radiographic Screening</p>
                <p className="text-xs text-gray-500 mt-0.5">Oct 23, 2026 • DenseNet-121 + Grad-CAM</p>
              </div>
              <div className="text-xs font-bold text-[#E65100] bg-[#FFEFEA] border border-[#FFD8CC] px-3 py-1 rounded-full">Review Advised</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ActivityLogIcon className="w-5 h-5 text-[#FF6B4A]"/> Telemetry & Vitals
          </h3>
          <div className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EBE8E3]">
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Your kinematic telemetry data and trabecular attenuation profiles are securely indexed and exportable for tertiary orthopaedic referral.
            </p>
            <div className="h-32 bg-white rounded-xl border border-[#EBE8E3] flex items-center justify-center text-xs text-gray-400 font-mono">
              [ Historical Kinematic & BMD Tracking Chart ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
