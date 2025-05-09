"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Book,
  SquareTerminal,
  Settings
} from "lucide-react";
import logo from '../../assets/logo-teologia-2.svg'
import logo_white from '../../assets/logo-teologia-white.svg'

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "../bibleIA/components/button-theme/button-theme";
import { useTheme } from "next-themes";


// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Biblia IA",
      url: "/bibleIA",
      icon: Book,
      isActive: true,

    },
    {
      title: "Configurações",
      url: "/bibleIA/settings",
      icon: Settings,
    },

  ],

};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setTheme, theme } = useTheme()
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href={"/"}>
          <Image alt='logo' src={theme === "light" ? logo : logo_white} width={140} height={200} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
