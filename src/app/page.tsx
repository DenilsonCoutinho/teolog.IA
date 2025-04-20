"use client"
import { useEffect, useRef, useState } from 'react';
import data from '../../pt_acf.json' assert { type: "json" };
import nvi from '../../pt_nvi.json' assert { type: "json" };
import logo from '../assets/logo-teologia.svg'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import ReactMarkdown from "react-markdown";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Loader from './components/loading';
import { Hero } from './components/sections/hero';
import { Benefits } from './components/sections/benefits';
import { FAQ } from './components/sections/faq';
import { Footer } from './components/sections/footer';
import { HowItWorks } from './components/sections/howItWoks';

type PropsChapters = {
  number: number;
}
export default function Home() {
  const bible = nvi

  const [textSelected, setTextSelected] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [responseIa, setResponseIa] = useState<string>("")
  const [selectTextBookBible, setSelectTextBookBible] = useState<string[][]>([])
  const [selectNameBook, setSelectNameBook] = useState<string>('')
  const [selectChapter, setSelectChapter] = useState<PropsChapters[] | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectNumberChapter, setSelectNumberChapter] = useState<number | undefined>()
  function getChapterBible(chapter: string) {
    if (chapter === "") setSelectChapter(null)
    setSelectTextBookBible([])

    const versicleData = bible.find(e => e?.name === chapter)
    const chapters = versicleData?.chapters
    if (!chapters) return
    const formatedChapters = Object?.entries(chapters)?.map((_, index) => {
      return {
        number: index,
      }
    })
    setSelectChapter(formatedChapters || null)
    getTextBookBible(chapter)
  }

  function getTextBookBible(nameBook: string) {
    const versicleData = bible.find(e => e?.name === nameBook)
    if (!versicleData) return
    setSelectTextBookBible(versicleData?.chapters)
  }

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const selectedText = selection.toString().trim();
      const anchorNode = selection.anchorNode;

      if (ref.current?.contains(anchorNode)) {
        setIsDrawerOpen(true)
        setTextSelected(selectedText);
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp); // Para mobile

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    setSelectNumberChapter(0)
    const chapters = bible[0].chapters.map((_, index) => {
      return { number: index }
    })
    setSelectChapter(chapters)
    setSelectNameBook(bible[0].name)
    setSelectTextBookBible(bible[0].chapters)
  }, [])

  const send = async () => {
    setLoading(true)
    const messageUser = "livro:" + selectNameBook + " " + "Capitulo:" + (selectNumberChapter! + 1) + "\n" + "\n" + textSelected
    try {
      const res = await fetch('/api/resBible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageUser }),
      });
      if (!res.ok) {
        throw new Error("Erro ao gerar resposta!")
      }
      const data = await res.json();
      setResponseIa(data.res.choices[0].message.content);
      setTextSelected('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
    }

    return
  };

  return (
    <div className="">
      <Hero />
      <Benefits />
      <HowItWorks />
      <FAQ />
      <Footer />
    </div>
  );
}
