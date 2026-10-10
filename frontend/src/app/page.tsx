"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Activity, Bone, X, User } from "lucide-react";
import { useState } from "react";
import { usePatient, generateScreeningId } from "@/context/PatientContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useScreening } from "@/context/ScreeningContext";

export default function LandingPage() {
  const { resetAll } = useScreening();
  
  // Wipe session aggressively on returning to landing page
  useEffect(() => {
    resetAll();
  }, [resetAll]);

  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const { setPatient } = usePatient();
  const router = useRouter();

  const handleStartScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientId.trim()) return;
    
    resetAll();
    setPatient({
      patientName,
      patientId,
      screeningId: generateScreeningId(),
      screeningStartedAt: new Date().toISOString()
    });
    router.push("/screening/questionnaire");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="z-10 flex flex-col items-center text-center max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <img src="/logo.jpg" alt="Swastik Logo" className="h-5 object-contain rounded-sm" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-6"
        >
          See movement <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">differently.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl font-light"
        >
          Advanced osteoarthritis screening through clinical assessment, movement analysis, and imaging.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button onClick={() => setShowModal(true)} className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-all">
            Start Screening
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
        </motion.div>
      </main>

      {/* Stylized UI Mockup representation */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl mt-20 px-6 relative"
      >
        <div className="w-full h-64 md:h-96 glass-panel flex items-center justify-center relative overflow-hidden border-t border-white/20">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <div className="flex flex-col items-center justify-center z-20 text-white/40">
                <Bone className="w-16 h-16 mb-4 animate-pulse" />
                <div className="text-sm tracking-[0.3em] font-light">BIOMECHANICAL ENGINE READY</div>
            </div>
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-xs font-medium tracking-widest text-gray-500 uppercase">
        <span>Video Analysis</span>
        <span>·</span>
        <span>Gait Biomechanics</span>
        <span>·</span>
        <span>AI Screening</span>
      </div>


      {/* Patient Intake Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
          >
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Patient Intake</h2>
                <p className="text-xs text-white/50 uppercase tracking-wider">New Screening Session</p>
              </div>
            </div>
            
            <form onSubmit={handleStartScreening} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Patient Full Name</label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Patient ID / MRN</label>
                <input 
                  type="text" 
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="e.g. PT-2023-891"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => {
                    resetAll();
                    setPatient({ patientName, patientId, screeningId: generateScreeningId(), screeningStartedAt: new Date().toISOString() });
                    router.push("/screening/questionnaire");
                  }}
                  disabled={!patientName.trim() || !patientId.trim()}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  Begin Osteoarthritis Screening <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    resetAll();
                    setPatient({ patientName, patientId, screeningId: generateScreeningId(), screeningStartedAt: new Date().toISOString() });
                    router.push("/screening/osteoporosis/questionnaire");
                  }}
                  disabled={!patientName.trim() || !patientId.trim()}
                  className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  Begin Osteoporosis Screening <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>

  );
}


