"use client";

import React, { useEffect, useState } from "react";
import {
  Book,
  Settings,
  ScrollText
} from "lucide-react";
import logo from '../../assets/logo-teologia-2.svg'
import logo_white from '../../assets/logo-teologia-white.svg'

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "../bibleIA/components/ui/button-theme/button-theme";
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
      title: "Meu Devocional",
      url: "/bibleIA/devotional",
      icon: ScrollText,

    },
    {
      title: "Configurações",
      url: "/bibleIA/settings",
      icon: Settings,
    },

  ],

};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [myTheme, setMyTheme] = useState<string | undefined>('');
  useEffect(() => {
    setMyTheme(resolvedTheme)
  }, [resolvedTheme])
  return (
    <Sidebar  collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <Link href={"/"}> */}
          <Image alt='logo' src={myTheme === "light" ? logo : logo_white} width={140} height={200} />
        {/* </Link> */}
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
