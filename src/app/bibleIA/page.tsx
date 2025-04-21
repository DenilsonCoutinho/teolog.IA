"use client"
import { useEffect, useRef, useState } from 'react';
import data from '../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../pt_nvi.json' assert { type: "json" };
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
import Loader from '../components/loading';
import { DialogClose } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';


type PropsChapters = {
    number: number;
}
export default function BibleIA() {

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
            setResponseIa(data?.res?.text);
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


    const handleTouchUp = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const selectedText = selection.toString().trim();
        const anchorNode = selection.anchorNode;

        if (ref.current?.contains(anchorNode)) {
            setIsDrawerOpen(true)
            setTextSelected(selectedText);
        }
    };
    return (
        <div className="flex flex-col items-center justify-center max-w-[600px] m-auto p-8 pb-20 gap-16 ">
            {/* <div className='border rounded-full bg-slate-800 h-10 w-10 fixed bottom-10 right-10'></div> */}
            <div className='flex items-center justify-between flex-row  gap-6 w-full'>
                <Select value={selectNameBook} onValueChange={(e) => { setSelectNameBook(e); getChapterBible(e); setSelectNumberChapter(undefined) }}>
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

                {<Select value={String(selectNumberChapter)} onValueChange={(e) => setSelectNumberChapter(Number(e))}>
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
            <section onCopy={() => handleTouchUp()}
                ref={ref}>
                <div className='flex flex-col gap-1  '>
                    {selectTextBookBible[selectNumberChapter!]?.map((texts, index) => {
                        return <div key={index} className='flex items-start gap-1'>
                            <p className='font-medium text-xs'>
                                {index + 1} - <span className='font-normal text-xs'>{texts}</span>
                            </p>

                        </div>
                    })}
                </div>
            </section>

            <Dialog  onOpenChange={(val) => {
                if (val === false) {
                    return
                }
                setIsDrawerOpen(val)
            }} open={isDrawerOpen}>
                <DialogContent className='px-3'>
                    <DialogHeader className='flex'>
                        <DialogTitle className='flex items-center  justify-between'>
                            Pergunte a nossa IA
                            <div className='cursor-pointer' onClick={() => setIsDrawerOpen(!isDrawerOpen)}><X className='w-5 bg text-black' /></div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mx-auto w-full h-[26rem] flex flex-col border rounded-xl ">
                        {/* Área das mensagens */}
                        <div className="flex-1 h-full overflow-y-auto p-4 bg-gray-100">
                            {loading ? <div className='flex justify-center flex-col items-center'>
                                <Loader />
                                <h1>Gerando resposta...</h1>
                            </div> : <>
                                {!responseIa? (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-center">
                                        <p className="text-lg">Comece uma conversa...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 h-full">
                                        <div
                                            className={` max-w-[100%] p-3 rounded-xl ${"bg-white text-gray-800 self-start mr-auto border"
                                                }`}
                                        >
                                            <div className='text-sm leading-6'>
                                                <ReactMarkdown>{responseIa}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>}
                        </div>

                        {/* Input e botões */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex gap-4 flex-col">

                                <Textarea
                                    onChange={(e) => setTextSelected(e.target.value)}
                                    value={textSelected}
                                    className="max-h-32 text-wrap"
                                    disabled={!textSelected || loading}
                                />
                                <Button
                                    className='cursor-pointer'
                                    id="buttoReq"
                                    onClick={() => send()}
                                    disabled={!textSelected || loading}
                                >
                                    Pesquisar
                                </Button>
                            </div>
                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}