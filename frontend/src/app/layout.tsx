import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScreeningProvider } from "@/context/ScreeningContext";
import { PatientProvider } from "@/context/PatientContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swastik | Unified Healthcare",
  description: "Rural healthcare ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        <ScreeningProvider>
          <PatientProvider>
            {children}
          </PatientProvider>
        </ScreeningProvider>
      </body>
    </html>
  );
}