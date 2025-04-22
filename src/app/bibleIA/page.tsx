"use client"
import { useEffect, useRef, useState } from 'react';
import acf from '../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../pt_nvi.json' assert { type: "json" };
import ntlh from '../../../pt_ntlh.json' assert { type: "json" };
import logo from '../../assets/logo-teologia.svg'
import mark from '../../assets/mark.svg'

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

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import ReactMarkdown from "react-markdown";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Loader from '../components/loading';
import { DialogClose } from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import ShinyText from '../components/ShinyText';


export interface BibleBook {
    abbrev: string;
    name: string;
    chapters: string[][];
}
type PropsChapters = {
    number: number;
}
export default function BibleIA() {
    const [maintenance, setMaintenance] = useState<boolean>(false)


    const bible = ntlh as BibleBook[]
    const [textSelected, setTextSelected] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [responseIa, setResponseIa] = useState<string>("")
    const [selectTextBookBible, setSelectTextBookBible] = useState<string[][]>([])
    const [selectNameBook, setSelectNameBook] = useState<string>('')
    const [selectChapter, setSelectChapter] = useState<PropsChapters[] | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectNumberChapter, setSelectNumberChapter] = useState<number>(0)
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
        setSelectedText((prev) => prev.find(e => e === `${index + 1}` + " - " + text) ? prev.filter(e => e !== `${index + 1}` + " - " + text) : [...prev, `${index + 1}` + " - " + text])
    }

    const ref = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     const handleMouseUp = () => {
    //         const selection = window.getSelection();
    //         if (!selection || selection.isCollapsed) return;

    //         const selectedText = selection.toString().trim();
    //         const anchorNode = selection.anchorNode;

    //         if (ref.current?.contains(anchorNode)) {
    //             setIsDrawerOpen(true)
    //             setTextSelected(selectedText);
    //         }
    //     };
    //     document.addEventListener("mouseup", handleMouseUp);
    //     document.addEventListener("touchend", handleMouseUp); // Para mobile

    //     return () => {
    //         document.removeEventListener("mouseup", handleMouseUp);
    //         document.removeEventListener("touchend", handleMouseUp);
    //     };
    // }, []);

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
        setResponseIa("");
        const TEXT_SELECTED_FORMATED = selectedText.join(" ")
        console.log(TEXT_SELECTED_FORMATED)
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



    if (maintenance) {
        return <div className='h-screen justify-center flex-col items-center flex bg-white'>
            <Image alt='logo' src={logo} />
            <h1 className='md:text-4xl text-center font-light text-black'>EM DESENVOLVIMENTO</h1>
        </div>
    }
    return (
        <div>
            <div className='h-14 w-full shadow-md p-3 fixed top-0 bg-white z-50'>
                <Image alt='logo' src={logo} width={140} height={200} />
            </div>
            <div className=" flex flex-col items-center justify-center max-w-[600px] mx-auto p-3 pb-28 md:gap-16 gap-10 mt-14">
                {selectedText.length > 0 && <div onClick={() => { setIsDrawerOpen(!isDrawerOpen); send() }} className='border-1 cursor-pointer rounded-full border-purple-800 shadow-md h-16 w-16 fixed bottom-10 right-10 roll-in-left'>
                    <Image alt='logo' src={mark} width={140} height={200} />
                </div>}
                <div className='flex items-center justify-between flex-row  gap-6 w-full'>
                    <Select value={selectNameBook} onValueChange={(e) => { setSelectNameBook(e); getChapterBible(e); setSelectNumberChapter(0) }}>
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
                <section
                    ref={ref}>
                    <div className='flex flex-col gap-2'>
                        {selectTextBookBible[selectNumberChapter]?.map((texts, index) => {
                            return <div key={index} onClick={() => getTextSelected(index, texts)} className={`${selectedText.find(e => e === `${index + 1}` + " - " + texts) ? "bg-gradient-to-r from-purple-800 to-blue-600 text-white" : ""} flex items-start gap-1 border border-slate-50 rounded-md p-1 shadow-xs`}>
                                <p className='font-medium text-[16px]'>
                                    {index + 1} - <span className='font-normal '>{texts}</span>
                                </p>

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
                            <div className="flex-1 h-full overflow-y-auto mb-5 p-4 bg-gray-100">
                                {
                                    <>
                                        {!responseIa ? (
                                            <div className="h-full flex items-center justify-center text-gray-400 text-center">
                                                <p className="text-lg">Comece uma conversa...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-  h-full">
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

                            {/* Input e botões */}
                            <div className="py- border-t bg-white rounded-xl ">
                                {loading && <div className='bg-slate-600 rounded-xl px-2'>
                                    <ShinyText text="Buscando sabedoria nas Escrituras..." speed={3} />
                                </div>}
                                <div className="flex gap-4 flex-col">
                                    {/* <Textarea
                                        onChange={(e) => setTextSelected(e.target.value)}
                                        value={textSelected}
                                        className="max-h-32 text-wrap"
                                    />
                                    <Button
                                        className='cursor-pointer'
                                        id="buttoReq"
                                        onClick={() => send()}
                                        disabled={!textSelected || loading}
                                    >
                                        Pesquisar
                                    </Button> */}
                                </div>
                            </div>
                        </div>

                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}