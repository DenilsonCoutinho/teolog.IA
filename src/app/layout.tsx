import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "../../auth";
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ResizeProvider } from "../../context/triggerResizeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Teolog.IA",
  description: "para um aprendizado continuo da palavra",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
           <ResizeProvider>
            {children}
           </ResizeProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
