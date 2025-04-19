"use client"
import { useEffect, useRef, useState } from 'react';
import data from '../../pt_acf.json' assert { type: "json" };
import nvi from '../../pt_nvi.json' assert { type: "json" };
import logo from '../assets/logo-teologia.svg'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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

type PropsChapters = {
  number: number;
}
export default function Home() {
  const bible = nvi

  const [textSelected, setTextSelected] = useState<string>("")
  const [message, setMessage] = useState<string[]>([])
  const [responseIa, setResponseIa] = useState<string>("")
  const [selectTextBible, setSelectTextBible] = useState<string[][]>([])
  const [selectNameVersicle, setSelectNameVersicle] = useState<string>('')
  const [selectChapter, setSelectChapter] = useState<PropsChapters[] | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectNumberChapter, setSelectNumberChapter] = useState<number | undefined>()
  function getChapterBible(chapter: string) {
    if (chapter === "") setSelectChapter(null)
    setSelectTextBible([])

    const versicleData = bible.find(e => e.name === chapter)
    const chapters = versicleData?.chapters
    if (!chapters) return
    const formatedVercicle = Object?.entries(chapters)?.map((_, index) => {
      return {
        number: index,
      }
    })
    setSelectChapter(formatedVercicle || null)
    getTextBible(chapter)
  }

  function getTextBible(nameVersicle: string) {
    const versicleData = bible.find(e => e.name === nameVersicle)
    if (!versicleData) return
    setSelectTextBible(versicleData?.chapters)
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

  const send = async () => {
    const messageUser = "livro:" + selectNameVersicle + " " + "Capitulo:" + (selectNumberChapter! + 1) + "\n" + "\n" + textSelected
    const res = await fetch('/api/resBible', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageUser }),
    });

    const data = await res.json();
    console.log(data)
    setResponseIa(data.res.choices[0].message.content || 'Erro ao gerar resposta.');
    return
    setTextSelected('')
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-[600px] m-auto p-8 pb-20 gap-16 ">
      <div className='flex items-center justify-between flex-row  gap-6 w-full'>
        <Select onValueChange={(e) => { setSelectNameVersicle(e); getChapterBible(e); setSelectNumberChapter(undefined) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecionar Livro" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Selecionar Livro</SelectLabel>
              {
                bible?.map((e) => {
                  return <SelectItem key={e.name} className="text-black" value={e.name}>{e.name}</SelectItem>
                })
              }
            </SelectGroup>
          </SelectContent>
        </Select>


        {selectNameVersicle && <Select value={String(selectNumberChapter)} onValueChange={(e) => setSelectNumberChapter(Number(e))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecionar capítulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Selecionar capítulo</SelectLabel>
              {
                selectChapter?.map((e) => {
                  return <SelectItem key={e.number} className="text-black" value={String(e.number)}>{e.number + 1}</SelectItem>
                })
              }
            </SelectGroup>
          </SelectContent>
        </Select>}
      </div>
      <section ref={ref}>
        <div className='flex flex-col gap-1  '>
          {selectTextBible[selectNumberChapter!]?.map((texts, index) => {
            return <div key={index} className='flex items-start gap-1'>
              <p className='font-medium text-xs'>
                {index + 1} - <span className='font-normal text-xs'>{texts}</span>
              </p>
              
            </div>
          })}
        </div>
      </section>

      <Dialog onOpenChange={setIsDrawerOpen} open={isDrawerOpen}>
        <DialogContent  className='px-3 h-screen'>
          <DialogHeader>
            <DialogTitle>Pergunte a nossa IA</DialogTitle>
          </DialogHeader>

          <div className="mx-auto w-full h-[32rem] flex flex-col border rounded-xl ">
            {/* Área das mensagens */}
            <div className="flex-1 h-[59rem] overflow-y-auto p-4 bg-gray-100">
              {responseIa.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-center">
                  <p className="text-lg">Comece uma conversa...</p>
                </div>
              ) : (
                <div className="space-y-4 h-[59rem]">
                  {
                    <div
                      className={`md:max-w-[80%] max-w-[100%] p-3 rounded-xl ${"bg-white text-gray-800 self-start mr-auto border"
                        }`}
                    >
                     <div className='text-sm leading-6'>
                      <ReactMarkdown>{responseIa}</ReactMarkdown> 
                      </div>
                    </div>
                 }
                </div>
              )}
            </div>

            {/* Input e botões */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-4 flex-col">
                
                <Textarea
                  onChange={(e) => setTextSelected(e.target.value)}
                  value={textSelected}
                  className="max-h-40 text-wrap"
                />
                <Button
                  id="buttoReq"
                  onClick={() => send()}
                  disabled={!textSelected}
                >
                  Pesquisar
                </Button>
              </div>
            </div>
          </div>
          
        </DialogContent>
      </Dialog>
    </div>
  );
}
