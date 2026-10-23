"use client";

import { usePatient } from "@/context/PatientContext";
import { 
  FileTextIcon, 
  ArrowLeftIcon, 
  ClockIcon, 
  ArrowRightIcon,
  DownloadIcon,
  PersonIcon
} from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ReportsPage() {
  const { patient } = usePatient();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("swastik_reports_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pt-24 pb-16 px-4 sm:px-6 md:px-10 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-[#FAF9F6] rounded-full transition-colors border border-[#EBE8E3]">
          <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileTextIcon className="w-7 h-7 text-[#FF6B4A]" />
            Clinical Reports History
          </h1>
        </div>
      </div>

      {/* Patient Profile Card */}
      <div className="bg-white border border-[#EBE8E3] p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <PersonIcon className="w-4 h-4 text-[#FF6B4A]" /> Active Patient Context
        </h2>
        {patient ? (
          <div className="flex flex-wrap gap-8 text-gray-800 bg-[#FAF9F6] p-4 rounded-2xl border border-[#EBE8E3]">
            <div><span className="text-gray-500 text-xs block font-semibold uppercase">Name</span><strong className="text-sm">{patient.patientName}</strong></div>
            <div><span className="text-gray-500 text-xs block font-semibold uppercase">Patient ID</span><strong className="text-sm font-mono">{patient.patientId}</strong></div>
          </div>
        ) : (
          <p className="text-gray-500 text-xs">No active patient session currently open.</p>
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ClockIcon className="w-4 h-4 text-gray-500" /> Past Clinical Assessments
      </h2>

      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((report, i) => (
            <div key={i} className="p-4 bg-white border border-[#EBE8E3] rounded-2xl flex justify-between items-center hover:bg-[#FAF9F6] transition-colors shadow-sm">
              <div>
                <p className="text-gray-900 font-bold text-sm">{report.date || "Recent Session"} • {report.joint || "Assessment"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Patient: {report.patientName || "Walk-in"}</p>
              </div>
              <button className="text-[#FF6B4A] text-xs font-semibold px-4 py-2 bg-[#FFEFEA] border border-[#FFD8CC] rounded-full hover:bg-[#FFE0D6] transition-colors flex items-center gap-1.5">
                <DownloadIcon className="w-3.5 h-3.5" /> View PDF
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-[#EBE8E3] rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <FileTextIcon className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm font-medium">No archived reports found in local browser storage.</p>
          <Link 
            href="/screening/joint-selection" 
            className="mt-4 inline-flex items-center gap-2 bg-[#FF6B4A] hover:bg-[#E85938] text-white px-6 py-3 rounded-full text-xs font-semibold shadow-md transition-all"
          >
            Launch a new assessment <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
