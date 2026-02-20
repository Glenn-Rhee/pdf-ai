import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import Navbar from "@/src/components/Navbar";
import { AuthProvider } from "./authProvider";
import TrcProvider from "@/src/components/TrcProvider";
import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Glenn-AI",
  description: "An AI-powered web app that lets users upload PDFs and ask questions to instantly get contextual answers based on document content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "min-h-screen grainy",
        )}
      >
        <AuthProvider>
          <TrcProvider>
            <Toaster />
            <Navbar />
            {children}
          </TrcProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
