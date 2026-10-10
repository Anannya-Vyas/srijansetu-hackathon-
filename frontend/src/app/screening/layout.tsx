import Link from "next/link";
import { ScreeningProvider } from "@/context/ScreeningContext";
import { PatientProvider } from "@/context/PatientContext";
import { LayoutDashboard, Settings, ArrowLeft } from "lucide-react";

export default function ScreeningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background to-[#111]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-md flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2"><img src="/logo.png" alt="Swastik Logo" className="h-10 object-contain rounded-sm" /></div>
          <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">Movement Lab</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink href="/" icon={<ArrowLeft size={18} />}>Back to Hub</NavLink>
          <NavLink href="/screening/joint-selection" icon={<LayoutDashboard size={18} />}>New Screening</NavLink>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <NavLink href="#" icon={<Settings size={18} />}>Settings</NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <ScreeningProvider>
          <PatientProvider>{children}</PatientProvider>
        </ScreeningProvider>
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
