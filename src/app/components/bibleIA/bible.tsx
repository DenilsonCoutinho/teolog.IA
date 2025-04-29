"use client"
import { useEffect, useRef, useState } from 'react';
import acf from '../../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../../pt_nvi.json' assert { type: "json" };
import ntlh from '../../../../pt_ntlh.json' assert { type: "json" };
import mark from '../../../assets/mark.svg'
import logo from '../../../assets/logo-teologia-2.svg'

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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import Image from 'next/image';
import ReactMarkdown from "react-markdown";
import { X } from 'lucide-react';
import ShinyText from '../ui/ShinyText';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Lora } from 'next/font/google';
import { useBibleStore } from '@/zustand/useBible';

export interface BibleBook {
    abbrev: string;
    name: string;
    chapters: string[][];
}
type PropsChapters = {
    number: number;
}

const lora = Lora({
    subsets: ["latin"],
});
export default function BibleIA() {
    const { data: session, status } = useSession();
    const [maintenance, setMaintenance] = useState<boolean>(false)
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
        setHasHydrated
    } = useBibleStore()

   
    const bible = ntlh as BibleBook[]
    const [textSelected, setTextSelected] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [responseIa, setResponseIa] = useState<string>("")
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedText, setSelectedText] = useState<string[]>([])

    function getChapterBible(chapter: string) {
        if (chapter === "") setSelectChapter(null)
        setSelectTextBookBible([])

        const versicleData = bible.find((e: BibleBook) => e?.name === chapter)
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

    function getTextSelected(index: number, text: string) {
        setSelectedText((prev) => prev.find(e => e === `${index + 1}` + " - " + text)
            ? prev.filter(e => e !== `${index + 1}` + " - " + text)
            : [...prev, `${index + 1}` + " - " + text])
    }

    useEffect(() => {
        if (!hasHydrated) return; // Espera até o Zustand terminar de hidratar

        if (!selectNameBook) {
            setSelectTextBookBible(bible[0]?.chapters)
            getChapterBible("Gênesis")
            setSelectNameBook("Gênesis")
            setSelectNumberChapter(0)
        }
    }, [hasHydrated])

    const send = async () => {
        setLoading(true)
        setResponseIa("");
        const TEXT_SELECTED_FORMATED = selectedText.join(" ")
        const messageUser =
            `livro: ${selectNameBook} Capítulo: ${selectNumberChapter + 1}\n\n${TEXT_SELECTED_FORMATED}`.trim();
        try {
            const stream = await fetch("/api/resBible", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageUser }),
            });

            if (!stream.ok) {
                throw new Error(`Erro ao gerar resposta: ${stream.statusText}`);
            }

            if (!stream.body) {
                throw new Error("Resposta da API não contém um corpo de stream válido");
            }

            const reader = stream.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                setResponseIa(fullResponse); // Atualiza a UI em tempo real
            }
            setSelectedText([])
            // setTextSelected("");
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert(error.message)
            }
        } finally {
            setLoading(false)
        }

        return
    };

    const handleVibration = () => {
        if (navigator.vibrate) {
            navigator.vibrate(90); // Vibra por 100ms
        }
    };
    if (maintenance) {
        return <div className='h-screen justify-center flex-col items-center flex bg-white'>
            <Image alt='logo' src={logo} />
            <h1 className='md:text-4xl text-center font-light text-black'>EM DESENVOLVIMENTO</h1>
        </div>
    }
    return (
        <div>
            {/* */}
            <div className=" flex flex-col items-center md:pl-20 justify-center max-w-[800px] mx-auto p-3 pb-28 md:gap-11 gap-10 mt-14">
                {selectedText.length > 0 && <button disabled={loading} onClick={() => { setIsDrawerOpen(!isDrawerOpen); send(); handleVibration() }} className='border-1 cursor-pointer rounded-full border-black shadow-md h-16 w-16 fixed bottom-10 right-10 roll-in-left'>
                    <Image alt='logo' src={mark} width={140} height={200} />
                </button>}
                <div className='flex items-center justify-between flex-row  gap-6 w-full'>
                    <Select value={selectNameBook} onValueChange={(e) => {
                        setSelectNameBook(e);
                        getChapterBible(e);
                        setSelectNumberChapter(0);
                        setSelectedText([])
                    }}>
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

                    {<Select value={String(selectNumberChapter)} onValueChange={(e) => { setSelectNumberChapter(Number(e)); setSelectedText([]) }}>
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
                <section>
                    <div className='flex flex-col gap-2'>
                        {selectTextBookBible[selectNumberChapter]?.map((texts, index) => {
                            return <div key={index} onClick={() => getTextSelected(index, texts)} className={`${selectedText.find(e => e === `${index + 1}` + " - " + texts) ? "bg-gradient-to-r from-purple-800 to-blue-600 text-white" : " "} cursor-pointer flex items-start gap-1 border border-slate-50 rounded-md p-1 shadow-xs`}>
                                <p className={`${lora.className} text-[16px] text-left`}>
                                    {index + 1} - <span className='font-normal '>{texts}</span>
                                </p>
                                {/* <ShinyText text={`${index + 1} - ${texts}`} speed={3} className='md:text-xl text-sm' /> */}

                            </div>
                        })}
                    </div>
                </section>

                <Dialog onOpenChange={(val) => {
                    if (val === false) {
                        return
                    }
                    setIsDrawerOpen(val)
                }} open={isDrawerOpen}>
                    <DialogContent className='px-3'>
                        <DialogHeader className='flex'>
                            <DialogTitle className='flex items-center  justify-between'>
                                Pergunte a nossa IA
                                <div className='cursor-pointer' onClick={() => { setIsDrawerOpen(!isDrawerOpen) }}><X className='w-5 bg text-black' /></div>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="mx-auto w-full h-[27rem] flex flex-col border rounded-xl ">
                            {/* Área das mensagens */}
                            <div className="flex-1 h-full overflow-y-auto mb-5 p-2 bg-gray-100">
                                {
                                    <>
                                        {!responseIa ? (
                                            <div className="h-full flex items-center justify-center text-gray-400 text-center">
                                                <p className="text-lg">Aguardando resposta...</p>
                                            </div>
                                        ) : (
                                            <div className="h-full">
                                                <div
                                                    className={` max-w-[100%] p-3  rounded-xl ${"bg-white mb-20 text-gray-800 self-start mr-auto border"
                                                        }`}
                                                >
                                                    <div className='text-sm leading-6 '>
                                                        <ReactMarkdown>{responseIa}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>}
                            </div>

                            <div className="border-t bg-white rounded-xl ">
                                {loading && <div className='bg-slate-600 rounded-xl px-2'>
                                    <ShinyText text="✝Buscando sabedoria nas Escrituras..." speed={3} className='md:text-xl text-sm' />
                                </div>}
                            </div>
                        </div>

                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}