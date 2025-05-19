import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "../components/app-sidebar";
import { ThemeProvider } from "../components/theme-provider";
import { ResizeProvider } from "../../../context/triggerResizeContext";


export const metadata: Metadata = {
  title: "Teolog.IA",
  description: "para um aprendizado continuo da palavra",
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className=" w-full bg-[#181818]">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
      >
        <SidebarProvider >
          <AppSidebar />
          <SidebarTrigger />
            {children}
        </SidebarProvider>
        <Toaster />
      </ThemeProvider>
    </div>
  );
}
