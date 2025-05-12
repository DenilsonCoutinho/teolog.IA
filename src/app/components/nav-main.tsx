"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useLayoutEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBibleStore } from "@/zustand/useBible"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const {
    setSelectNameBook,
    selectNameBook,
    setSelectChapter,
    selectChapter,
    setSelectTextBookBible,
    selectTextBookBible,
    setSelectNumberChapter,
    selectNumberChapter,
    hasHydrated,
    setHasHydrated,
    selectTranslation,
    setSelectTranslation
  } = useBibleStore();
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {

          return <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <Link href={`${item.url || "#"}`}>
                  <SidebarMenuButton tooltip={item.title} className={`${pathname === item.url ? "dark:bg-gray-600 bg-gray-300" : ""} cursor-pointer`}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </CollapsibleTrigger>
              <CollapsibleContent>

              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        })}
      <SidebarGroupLabel>Tradução</SidebarGroupLabel>
        <Collapsible
          asChild
          className="group/collapsible"
        >
          <Select value={selectTranslation} onValueChange={(e) => {
            setSelectTranslation(e)
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar Livro" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Selecionar Tradução</SelectLabel>
                <SelectItem className="text-black dark:text-white" value={"NTLH"}>
                  NTLH
                </SelectItem>
                <SelectItem className="text-black dark:text-white" value={"NVI"}>
                  NVI
                </SelectItem>
                <SelectItem className="text-black dark:text-white" value={"ACF"}>
                  ACF
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}
