"use client";

import { ScreeningProvider } from "@/context/ScreeningContext";
import { PatientProvider } from "@/context/PatientContext";

export default function ScreeningLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#18181B] pt-24 pb-16">
      <ScreeningProvider>
        <PatientProvider>
          {children}
        </PatientProvider>
      </ScreeningProvider>
    </div>
  );
}

