"use client";
import Link from "next/link";
import { BookOpen, ArrowLeft, HeartPulse, Apple, Activity, CheckCircle, Download, FileText, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function EducatePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const modules = [
    {
      id: "know-oa",
      icon: <BookOpen className="w-6 h-6" />,
      title: "Know Osteoarthritis",
      summary: "Understand the fundamentals of Osteoarthritis (OA) and how it affects joint cartilage over time.",
      content: "Osteoarthritis is a degenerative joint disease where the protective cartilage that cushions the ends of bones wears down over time. It most commonly affects joints in your hands, knees, hips and spine. Symptoms include pain, stiffness, tenderness, and loss of flexibility."
    },
    {
      id: "symptoms",
      icon: <HeartPulse className="w-6 h-6" />,
      title: "Recognizing Symptoms",
      summary: "Learn to identify early warning signs of joint degradation.",
      content: "Early symptoms often include pain during or after movement, joint stiffness upon waking up, and a grating sensation when you use the joint. Identifying these early allows for proactive management."
    },
    {
      id: "diet",
      icon: <Apple className="w-6 h-6" />,
      title: "Nutrition & Diet",
      summary: "Discover which foods reduce inflammation and support joint health.",
      content: "An anti-inflammatory diet is crucial. Omega-3 fatty acids (salmon, chia seeds), antioxidants (berries, spinach), and Vitamin C help protect cartilage. Avoid processed foods and excessive sugar."
    },
    {
      id: "exercise",
      icon: <Activity className="w-6 h-6" />,
      title: "Exercise Protocols",
      summary: "Safe physical activities to strengthen muscles around the joints.",
      content: "Low-impact exercises like swimming, cycling, and walking are highly recommended. Strengthening the muscles around your joints takes the pressure off the cartilage. Always consult a physiotherapist before starting a new routine."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 relative selection:bg-emerald-500/30 overflow-y-auto">
      <div className="max-w-6xl mx-auto pt-12">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Hub
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Educational Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Osteoarthritis Masterclass
            </h1>
            <p className="text-white/50 max-w-2xl text-lg">
              Complete the modules below to understand your joint health and earn your certification.
            </p>
          </div>
          
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Download className="w-5 h-5" /> Download Certificate
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, idx) => {
            const isActive = activeModule === mod.id;
            return (
              <div 
                key={mod.id}
                onClick={() => setActiveModule(isActive ? null : mod.id)}
                className={`cursor-pointer border rounded-2xl p-6 transition-all duration-300 ${isActive ? 'bg-white/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/50'}`}>
                    {mod.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-emerald-400">Module 0{idx + 1}</span>
                      {isActive && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{mod.title}</h3>
                    <p className={`text-sm transition-all ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                      {mod.summary}
                    </p>
                    
                    {isActive && (
                      <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top-2 fade-in duration-300">
                        <p className="text-sm leading-relaxed text-white/70">
                          {mod.content}
                        </p>
                        <button className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-lg transition-colors">
                          <FileText className="w-4 h-4" /> Take Module Quiz <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}
