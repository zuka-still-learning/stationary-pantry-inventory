import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import "@/app/globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"]
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Inventory Management System",
  description: "Excel-backed inventory management for Stationary and Pantry stock."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable}`}>
        <div className="min-h-screen">
          <div className="mx-auto flex max-w-[1700px] flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
            <AppSidebar />
            <main className="surface-grid min-h-[calc(100vh-2rem)] flex-1 rounded-[36px] border border-white/60 bg-white/65 p-5 shadow-panel backdrop-blur-xl lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
