"use client";
import { useEffect, useRef, useState, useTransition } from 'react';
import acf from '../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../pt_nvi.json' assert { type: "json" };
import ntlh from '../../../pt_ntlh.json' assert { type: "json" };
import logo from '@/assets/logo-teologia-2.svg';
import logo_white from '@/assets/logo-teologia-white.svg'
import { driver } from "driver.js";

import "driver.js/dist/driver.css";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import crypto from 'crypto';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Lora } from 'next/font/google';
import { useBibleStore } from '@/zustand/useBible';
import DualRingSpinnerLoader from '../components/ui/DualRingSpinnerLoader';
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js';
import { ArrowLeft, ArrowRight, Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useResize } from '../../../context/triggerResizeContext';
import { Button } from '@/components/ui/button';
import { HasAskExisting } from '../../../service/getResExist';
import {
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from "react-share";
import UpdateNewUser from '../../../service/updateNewUser';
export interface BibleBook {
    abbrev: string;
    name: string;
    chapters: string[][]; // Representação dos capítulos como um array de arrays de strings
}

const lora = Lora({
    subsets: ["latin"],
});

export default function BibleIA() {

    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const { data: session } = useSession();
    const { resolvedTheme } = useTheme()
    const { innerHeight } = useResize()
    const [isPending, startTransition] = useTransition()
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
        selectTranslation,
        setLoadingLayout,
        loadingLayout,
    } = useBibleStore();
    const route = useRouter()

    const bible = selectTranslation === "ACF" ? acf as BibleBook[] :
        selectTranslation === "NTLH" ? ntlh as BibleBook[] :
            selectTranslation === "NVI" ? nvi as BibleBook[] : ntlh as BibleBook[]

    const [loading, setLoading] = useState<boolean>(false);
    const [responseIa, setResponseIa] = useState<string>("");
    const [currentHash, setCurrentHash] = useState<string>("");
    const [currentTitle, setCurrentTitle] = useState<string>("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    useEffect(() => {
        setLoadingLayout(true)
        if (!session?.user.id) {
            return route.replace("/")
        }
        setLoadingLayout(false)

    }, [])

    // Atualiza o editorState quando responseIa mudar
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

    useEffect(() => {
        async function initializeDriver() {
            await new Promise(resolve => setTimeout(resolve, 10));
            if (!session?.user.isNewUser) {
                return driverObj.destroy()

            }
            driverObj.drive()
            await UpdateNewUser(session?.user.id)
        }
        initializeDriver()
    }, [])
    // Efeito que é chamado após a hidratação do Zustand
    useEffect(() => {
        setLoadingLayout(true)
        if (!hasHydrated) return; // Espera até o Zustand terminar de hidratar
        if (!selectChapter) {
            const chapters = bible[0]?.chapters
            const chaptersInKey = Object?.keys(chapters)?.map((_, index) => {
                return { number: index };
            });
            setSelectTextBookBible(bible[0]?.chapters);
            setSelectChapter(chaptersInKey);

            getChapterBible("Gênesis");
            setSelectNameBook("Gênesis");
            setSelectNumberChapter(0);
            setLoadingLayout(false)
        }
        setLoadingLayout(false)
    }, [hasHydrated]);

    useEffect(() => {
        if (!selectNameBook) {
            setSelectTextBookBible(bible[0]?.chapters);
            getChapterBible("Gênesis");
            setSelectNameBook("Gênesis");
            setSelectNumberChapter(0);
        }
    }, [selectTranslation, selectNameBook]);

    function getChapterBible(bookName: string) {

        setSelectTextBookBible([]);
        const bookData = bible?.find((e: BibleBook) => e?.name === bookName);

        const chapters = bookData?.chapters;
        if (!chapters) return console.info("Nenhum capítulo encontrado");

        const formatedChapters = Object?.keys(chapters)?.map((_, index) => {
            return { number: index };
        });
        setSelectChapter(formatedChapters || { number: 1 });

        getTextBookBible(bookName);
    }

    function getTextBookBible(nameBook?: string) {
        const versicleData = bible?.find(e => e?.name === nameBook);
        if (!versicleData) return;
        setSelectTextBookBible(versicleData?.chapters);
    }

    async function nextChapter() {
        const section = document.querySelector('#top');
        if (selectNumberChapter + 1 >= selectTextBookBible.length) {
            toast.error("Você já está no último capítulo deste livro.");
            // Rola suavemente para o topo da lista de versículos
            if (section) {
                section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return;
        }

        setSelectNumberChapter(selectNumberChapter + 1);
        if (section) {
            section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    async function previousChapter() {
        const section = document.querySelector('#top');
        if (selectNumberChapter === 0) {
            toast.error("Você já está no capítulo 1 deste livro.");
            if (section) {
                section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            return
        }

        setSelectNumberChapter(selectNumberChapter - 1);
        if (section) {
            section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function generateHash(ask: string) {
        const chave = `${ask?.trim()?.toLowerCase()}`
        return crypto.createHash('sha256').update(chave).digest('hex')
    }

    const askIA = async (verse: number,) => {
        startTransition(async () => {

            setLoading(true);
            setResponseIa("");
            const ASK_USER = `Livro: ${selectNameBook} Capítulo: ${selectNumberChapter + 1} Versículo: ${verse + 1}`.trim();
            const askHash = generateHash(ASK_USER)
            setCurrentHash(askHash)
            const dataHasAskExisting = await HasAskExisting(askHash)
            setCurrentTitle(ASK_USER)
            if (dataHasAskExisting?.htmlContent) {
                setResponseIa(dataHasAskExisting?.htmlContent)
                return
            }
            try {
                if (dataHasAskExisting?.status === "pending" && dataHasAskExisting.perguntaHash === askHash) {
                    throw new Error("Resposta em processamento, Volte em alguns minutos.");
                }
                const stream = await fetch(`${session?.user.stripeNamePlan === "Free" ? "/api/resBibleFree" : "/api/resBible"}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messageUser: ASK_USER, perguntaHash: askHash, userId: session?.user.id }),
                });

                if (!stream.ok) {
                    const data = await stream.json();
                    throw new Error(`Erro ao gerar resposta: ${data.error}`);
                }

                if (!stream.body) {
                    throw new Error("Resposta da API não contém um corpo de stream válido");
                }
                if (stream.status === 202) {
                    setIsDrawerOpen(false)
                    toast.error("Estamos processando sua resposta, volte dentro de 1 minuto.", { duration: 10000, closeButton: true })
                    return; // não prossegue pois está esperando resposta pronta
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
                setLoading(false);

            } catch (error: any) {
                if (error instanceof Error) {
                    setIsDrawerOpen(false)
                    toast.error(error.message)
                    return
                }
                toast.error(error.message)

            }
        })
    };

    const driverObj = driver({
        showButtons: [
            'next',
            'close'
        ],
        steps: [

            {
                element: '#verse-0',
                popover: {
                    doneBtnText: 'Ok!',
                    title: 'Selecione um versículo',
                    description: 'Clique em um versículo para fazer uma pergunta ao nosso Teólogo IA.',
                }
            },

        ]
    });

    const share = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_URL}iconLogo.png`);
            const blob = await response.blob();

            const file = new File([blob], 'iconLogo.png', { type: 'image/png' });

            const data = {
                files: [file],
                url: `${process.env.NEXT_PUBLIC_URL}share/${currentHash}`,
                title: "Estudo do " + currentTitle,
                text: `Estudo do ${currentTitle}`,
            };

            if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                throw new Error("Seu navegador não suporta compartilhamento de arquivos.");
            }

            await navigator.share(data);
        } catch (err: any) {
            console.error("Erro ao compartilhar:", err.message);
        }
    };

    if (loadingLayout) {
        return <div className='w-full flex justify-center items-center'>
            <div style={{ height: `${innerHeight - 130}px` }} className=''>
                <div className=' h-full flex flex-col justify-center items-center'>
                    <Image src={resolvedTheme === "dark" ? logo_white : logo} alt='logo' />

                    <DualRingSpinnerLoader />
                </div>
            </div>
        </div>
    }

    return (
        <div id='top' className=" ">

            <div className="flex flex-col items-center justify-center w-full my-selects mx-auto p-3 pb-28 md:gap-11 gap-10 mt-14">
                <div className='flex items-center justify-between flex-row gap-6 w-full'>
                    <Select value={selectNameBook} onValueChange={(e) => {
                        setSelectNameBook(e);
                        getChapterBible(e);
                        setSelectNumberChapter(0);
                        // setSelectedText([]);
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecionar Livro" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Selecionar Livro</SelectLabel>
                                {bible?.map((e) => (
                                    <SelectItem key={e.name} className="text-black dark:text-white" value={e.name}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select value={String(selectNumberChapter)} onValueChange={(e) => {
                        setSelectNumberChapter(Number(e));
                    }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecionar capítulo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Selecionar capítulo</SelectLabel>
                                {selectChapter?.map((e) => (
                                    <SelectItem key={e.number} className="text-black dark:text-white" value={String(e.number)}>
                                        {e.number + 1}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <section>
                    <div className='flex flex-col gap-2'>
                        {selectTextBookBible[selectNumberChapter]?.map((texts, index) => (
                            <div
                                key={index}
                                id={`verse-${index}`}
                                onClick={() => { askIA(index); setIsDrawerOpen(!isDrawerOpen); driverObj.destroy() }}
                                className={`cursor-pointer flex items-start gap-1 border dark:border dark:border-gray-700  rounded-md p-1 shadow-xs`}>
                                <p className={`${lora.className} text-[16px] text-left`} >
                                    {index + 1} - <span className='font-normal'>{texts}</span>
                                </p>
                            </div>
                        ))}

                        <div className='controlls flex items-center justify-between mt-3'>
                            <div className='flex justify-center cursor-pointer items-center h-10 w-10 border rounded-full dark:border dark:border-gray-700'>
                                <ArrowLeft onClick={() => previousChapter()} className='text-gray-300' />
                            </div>
                            <div onClick={() => nextChapter()} className='flex cursor-pointer justify-center items-center h-10 w-10 border rounded-full dark:border dark:border-gray-700'>
                                <ArrowRight className='text-gray-300' />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <Dialog onOpenChange={(val) => { if (val === false) return; setIsDrawerOpen(val); }} open={isDrawerOpen}>
                <DialogContent className='px- dark:bg-[#181818] '>
                    <DialogHeader className='flex'>
                        <DialogTitle className='flex items-center justify-between'>
                            <Image src={resolvedTheme === "dark" ? logo_white : logo} alt='logo' width={130} />
                            {<div className='cursor-pointer' onClick={() => { setIsDrawerOpen(!isDrawerOpen) }}>
                                <X className='w-5 bg text-black dark:text-white' />
                            </div>}
                        </DialogTitle>
                    </DialogHeader>

                    <div style={{ height: `${innerHeight - 160}px` }} className="w-full  flex flex-col border rounded-xl">
                        <div className="flex-1 h-full overflow-y-auto mb-5 p-2 dark:bg-[#181818] bg-gray-100">
                            {!responseIa ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-center">
                                    <div className='flex flex-col items-center'>
                                        <DualRingSpinnerLoader />
                                        <p className='dark:text-white'>Buscando sabedoria nas Escrituras...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full">
                                    <div className={`max-w-[100%] p- rounded-xl bg-white mb-20  border`}>
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
                    {!isPending && <div className='md:flex hidden flex-row items-center gap-3 justify-center'>
                        <WhatsappShareButton title={"Estudo do " + currentTitle} url={`${process.env.NEXT_PUBLIC_URL}share/${currentHash}`} >
                            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive">
                                Compartilhar
                                <WhatsappIcon />
                            </div>
                        </WhatsappShareButton>
                        <TwitterShareButton title={"Estudo do " + currentTitle} url={`${process.env.NEXT_PUBLIC_URL}share/${currentHash}`} >
                            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive">
                                Compartilhar
                                <TwitterIcon />
                            </div>
                        </TwitterShareButton>
                    </div>
                    }
                    {!isPending && <div onClick={() => share()} className='md:hidden flex  flex-row items-center gap-3 justify-center'>
                        <Button className='flex'>
                            Compartilhar
                            <Share2 />
                        </Button>

                    </div>
                    }
                </DialogContent>
            </Dialog>
        </div>
    );
}