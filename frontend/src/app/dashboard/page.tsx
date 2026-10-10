"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, User, FileText, ChevronRight, Activity } from "lucide-react";

const MOCK_PATIENTS = [
  { id: "PAT-12345", name: "John Doe", date: "2026-08-31", risk: "Moderate Risk", score: 68 },
  { id: "PAT-98765", name: "Jane Smith", date: "2026-08-30", risk: "Low Risk", score: 22 },
  { id: "PAT-45678", name: "Robert Johnson", date: "2026-08-28", risk: "High Risk", score: 91 },
  { id: "PAT-33322", name: "Emily Davis", date: "2026-08-25", risk: "Moderate Risk", score: 55 },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-accent" />
            Clinical Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage patient OA screenings and biomechanical reports.</p>
        </div>
        
        <Link href="/screening/camera" className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Screening
        </Link>
      </div>

      <div className="glass-panel p-6 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-medium text-white">Recent Screenings</h2>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40">
          <table className="w-full text-sm text-left text-white/70">
            <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Risk Level</th>
                <th className="px-6 py-4 font-medium">OA Score</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{patient.name}</div>
                        <div className="text-xs text-white/40">{patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{patient.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      patient.risk === 'High Risk' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                      patient.risk === 'Moderate Risk' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                      'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}>
                      {patient.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${patient.score > 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${patient.score}%` }} />
                      </div>
                      <span className="font-mono text-white/50">{patient.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/screening/results" className="inline-flex items-center gap-1 text-accent hover:text-accent/80 transition-colors">
                      <FileText className="w-4 h-4" />
                      View Report
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPatients.length === 0 && (
            <div className="p-8 text-center text-white/40">
              No patients found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
