import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScreeningProvider } from "@/context/ScreeningContext";
import { PatientProvider } from "@/context/PatientContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swastik | Unified Healthcare Intelligence",
  description: "Rural healthcare musculoskeletal clinical decision platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FDFBF7] text-[#18181B] selection:bg-[#FF6B4A]/20 selection:text-[#EA580C] min-h-screen flex flex-col antialiased`}>
        <ScreeningProvider>
          <PatientProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
          </PatientProvider>
        </ScreeningProvider>
      </body>
    </html>
  );
}