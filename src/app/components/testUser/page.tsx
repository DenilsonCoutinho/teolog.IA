"use client"
import { useEffect, useRef, useState } from 'react';
import acf from '../../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../../pt_nvi.json' assert { type: "json" };
import ntlh from '../../../../pt_ntlh.json' assert { type: "json" };
import mark from '../../../assets/mark.svg'
import logo from '../../../assets/logo-teologia-2.svg'

import { toast } from "sonner"
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
const lora = Lora({
    subsets: ["latin"],
});
import Image from 'next/image';
import { X } from 'lucide-react';

import { useBibleTestStore } from '@/zustand/useBible';
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js';

import DualRingSpinnerLoader from '../ui/DualRingSpinnerLoader';
import { Lora } from 'next/font/google';

export interface BibleBook {
    abbrev: string;
    name: string;
    chapters: string[][];
}

export default function BibleIAForTest() {
    const {
        setSelectNameBookTest,
        selectNameBookTest,
        setSelectChapterTest,
        selectChapterTest,
        setSelectTextBookBibleTest,
        selectTextBookBibleTest,
        setSelectNumberChapterTest,
        selectNumberChapterTest,
        hasHydrated
    } = useBibleTestStore()
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

    const bible = ntlh as BibleBook[]
    const [loading, setLoading] = useState<boolean>(true)
    const [responseIa, setResponseIa] = useState<string>("")
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedText, setSelectedText] = useState<string[]>([])
    useEffect(() => {
        if (responseIa) {
            const blocksFromHTML = convertFromHTML(responseIa);
            const contentState = ContentState.createFromBlockArray(
                blocksFromHTML.contentBlocks,
                blocksFromHTML.entityMap
            );
            setEditorState(EditorState.createWithContent(contentState));
        } else {
            setEditorState(EditorState.createEmpty());
        }
    }, [responseIa]);
    function getChapterBible(chapter: string) {
        if (chapter === "") setSelectChapterTest(null)
        setSelectTextBookBibleTest([])

        const versicleData = bible.find((e: BibleBook) => e?.name === chapter)
        const chapters = versicleData?.chapters
        if (!chapters) return
        const formatedChapters = Object?.entries(chapters)?.map((_, index) => {
            return {
                number: index,
            }
        })
        setSelectChapterTest(formatedChapters || null)
        getTextBookBible(chapter)
    }

    function getTextBookBible(nameBook: string) {
        const versicleData = bible.find(e => e?.name === nameBook)
        if (!versicleData) return
        setSelectTextBookBibleTest(versicleData?.chapters)
    }

    function getTextSelected(index: number, text: string) {
        setSelectedText((prev) => prev.find(e => e === `${index + 1}` + " - " + text)
            ? prev.filter(e => e !== `${index + 1}` + " - " + text)
            :
            [...prev, `${index + 1}` + " - " + text])
    }

    useEffect(() => {
        if (!hasHydrated) return; // Espera até o Zustand terminar de hidratar

        if (!selectNameBookTest) {
            setSelectTextBookBibleTest(bible[0]?.chapters)
            getChapterBible("Gênesis")
            setSelectNameBookTest("Gênesis")
            setSelectNumberChapterTest(0)
        }
    }, [hasHydrated])


    const send = async () => {
        setLoading(true);
        setResponseIa("");
        const TEXT_SELECTED_FORMATED = selectedText.join(" ");
        const messageUser = `livro: ${selectNameBookTest} Capítulo: ${selectNumberChapterTest + 1}\n\n${TEXT_SELECTED_FORMATED}`.trim();

        try {
            const stream = await fetch("/api/resBibleForTest", {
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

            setSelectedText([]);
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message)
                setSelectedText([]);
            }
            setIsDrawerOpen(false)
            console.error(error)
        } finally {
            setLoading(false);
        }
    };


    const handleVibration = () => {
        if (navigator.vibrate) {
            navigator.vibrate(90); // Vibra por 100ms
        }
    };

    return (
        <div id='' className='mb-16'>
            <h2 className="text-3xl text-purple-800 md:text-4xl font-bold text-center mt-10">
                Faça um teste!
            </h2>
            <p className="mt-2 mb-10 md:text-2xl text-md font-medium text-center text-gray-900">Selecione o versiculo e pesquise</p>
            <div className=" border rounded-md shadow-md flex flex-col items-center justify-center max-w-[600px] mx-auto p-3 pb-2 md:gap-10 gap-10 ">
                {selectedText.length > 0 && <div onClick={() => { send(); setIsDrawerOpen(!isDrawerOpen); handleVibration() }} className='border-1 cursor-pointer rounded-full border-black shadow-md h-16 w-16 fixed bottom-10 right-10 roll-in-left'>
                    <Image alt='logo' src={mark} width={140} height={200} />
                </div>}
                <div className='flex items-center justify-between flex-row  gap-6 w-full'>
                    <Select value={selectNameBookTest} onValueChange={(e) => {
                        setSelectNameBookTest(e);
                        getChapterBible(e);
                        setSelectNumberChapterTest(0);
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

                    {<Select value={String(selectNumberChapterTest)} onValueChange={(e) => { setSelectNumberChapterTest(Number(e)); setSelectedText([]) }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecionar capítulo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Selecionar capítulo</SelectLabel>
                                {
                                    selectChapterTest?.map((e) => {
                                        return <SelectItem key={e.number} className="text-black" value={String(e.number)}>{e.number + 1}</SelectItem>
                                    })
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>}

                </div>
                <section>
                    <div className='flex flex-col gap-2'>
                        {selectTextBookBibleTest[selectNumberChapterTest]?.map((texts, index) => {
                            return <div key={index} onClick={() => { getTextSelected(index, texts); handleVibration() }} className={`${selectedText.find(e => e === `${index + 1}` + " - " + texts) ? "bg-gradient-to-r from-purple-800 to-blue-600 text-white " : " text-black"} cursor-pointer flex items-start gap-1 border border-slate-50 rounded-md p-1 shadow-xs`}>
                                <p className={` font-medium text-[16px] ${lora.className}`}>
                                    {index + 1} - <span className='font-normal '>{texts}</span>
                                </p>

                            </div>
                        })}
                    </div>
                </section>

                <Dialog onOpenChange={(val) => { if (val === false) return; setIsDrawerOpen(val); }} open={isDrawerOpen}>
                    <DialogContent className='px-3'>
                        <DialogHeader className='flex'>
                            <DialogTitle className='flex items-center justify-between'>
                                <Image src={logo} alt='logo' width={100} />
                                {
                                    !loading &&
                                        <div className='cursor-pointer' onClick={() => { setIsDrawerOpen(!isDrawerOpen) }}>
                                            <X className='w-5 bg text-black' />
                                        </div>
                                }
                            </DialogTitle>
                        </DialogHeader>

                        <div className="w-full h-[27rem] flex flex-col border rounded-xl">
                            {/* Área das mensagens */}
                            <div className="flex-1 h-full overflow-y-auto mb-5 p-2 bg-gray-100">
                                {!responseIa ? (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-center">
                                        <div className='flex flex-col items-center'>
                                            <DualRingSpinnerLoader />
                                            <p>Buscando sabedoria nas Escrituras...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full">
                                        <div className={`max-w-[100%] p-3 rounded-xl bg-white mb-20 text-gray-800 self-start mr-auto border`}>
                                            <div className='text-sm leading-6'>
                                                <Editor
                                                    editorState={editorState}
                                                    onChange={setEditorState}
                                                    readOnly={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}