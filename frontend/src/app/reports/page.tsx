"use client";

import { usePatient } from "@/context/PatientContext";
import { FileText, ArrowLeft, Clock } from "lucide-react";
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
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-accent" />
          Reports History
        </h1>
      </div>

      <div className="glass-panel p-6 mb-8">
        <h2 className="text-xl text-white font-medium mb-2">Current Patient</h2>
        {patient ? (
          <div className="flex gap-8 text-gray-300 bg-white/5 p-4 rounded-xl border border-white/10">
            <div><span className="text-gray-500 text-sm block">Name</span>{patient.name}</div>
            <div><span className="text-gray-500 text-sm block">Patient ID</span>{patient.id}</div>
          </div>
        ) : (
          <p className="text-gray-400">No active patient session. Start a new screening to begin.</p>
        )}
      </div>

      <h2 className="text-xl text-white font-medium mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-400" />
        Past Assessments
      </h2>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((report, i) => (
            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
              <div>
                <p className="text-white font-medium">{report.date || "Unknown Date"} - {report.joint || "Assessment"}</p>
                <p className="text-sm text-gray-400">Patient: {report.patientName || "Unknown"}</p>
              </div>
              <button className="text-accent text-sm font-medium px-4 py-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors">
                View PDF
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center">
          <FileText className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400">No reports generated yet.</p>
          <Link href="/screening/questionnaire" className="mt-4 text-accent hover:underline">
            Start a new assessment
          </Link>
        </div>
      )}
    </div>
  );
}
