"use client";
import { useEffect, useRef, useState } from 'react';
import acf from '../../../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../../../pt_nvi.json' assert { type: "json" };
import ntlh from '../../../../../pt_ntlh.json' assert { type: "json" };
import logo from '@/assets/logo-teologia-2.svg';
import logo_white from '@/assets/logo-teologia-white.svg'

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
import DualRingSpinnerLoader from '../../../components/ui/DualRingSpinnerLoader';
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js';
import { Share2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useResize } from '../../../../../context/triggerResizeContext';
import { Button } from '@/components/ui/button';
import { HasAskExisting, resCreated } from '../../../../../service/getResExist';
import {
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton,
} from "react-share";
export interface BibleBook {
    abbrev: string;
    name: string;
    chapters: string[][]; // Representação dos capítulos como um array de arrays de strings
}

const lora = Lora({
    subsets: ["latin"],
});
type TypeTranslations = "ACF" | "NTLH" | "NVI"
type Translations = {
    data: {
        type_translations: TypeTranslations
    }
}
export default function BibleIA({ typeTranslations }: { typeTranslations: Translations | undefined }) {
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    const { data: session } = useSession();
    const [maintenance, setMaintenance] = useState<boolean>(false);
    const { resolvedTheme } = useTheme()
    const { innerHeight } = useResize()
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
        loadingLayout
    } = useBibleStore();
    const route = useRouter()

    const bible = selectTranslation === "ACF" ? acf as BibleBook[] :
        selectTranslation === "NTLH" ? ntlh as BibleBook[] :
            selectTranslation === "NVI" ? nvi as BibleBook[] : ntlh as BibleBook[]

    const [isConfeti, setIsConfeti] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(false);
    // const [loadingLayout, setLoadingLayout] = useState<boolean>(false);
    const [responseIa, setResponseIa] = useState<string>("");
    const [currentHash, setCurrentHash] = useState<string>("");
    const [currentTitle, setCurrentTitle] = useState<string>("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isDrawerOpenRef = useRef(isDrawerOpen);
    const [selectedText, setSelectedText] = useState<string[]>([]);

    useEffect(() => {
        isDrawerOpenRef.current = isDrawerOpen;
    }, [isDrawerOpen])

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


    function getChapterBible(bookName: string) {

        // if (bookName === "") return
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


    async function animateWords(text: string, onUpdate: (partial: any) => void, onComplete: () => void) {
        setResponseIa('');
        let words: string[] = text.split(" ");
        let index = 0;

        function next() {
            if (!isDrawerOpenRef.current) {
                setResponseIa('')
                words = [""]
            }
            if (index < words.length) {
                onUpdate((prev: any) => prev + (index === 0 ? "" : " ") + words[index]);
                index++;
                setTimeout(next, 4); // tempo entre palavras
            } else {
                onComplete();
            }
        }

        next();
    }


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
    const typeTheology = session?.user.typetheology[0]?.type_theology
    function generateHash(ask: string) {
        const chave = `${typeTheology.trim().toLowerCase()}::${ask.trim().toLowerCase()}`
        return crypto.createHash('sha256').update(chave).digest('hex')
    }

    const askIA = async (verse: number,) => {
        setLoading(true);
        setResponseIa("");
        const ASK_USER = `Livro: ${selectNameBook} Capítulo: ${selectNumberChapter + 1} Versículo: ${verse + 1}`.trim();
        const askHash = generateHash(ASK_USER)
        setCurrentHash(askHash)
        const dataHasAskExisting = await HasAskExisting(askHash)
        setCurrentTitle(ASK_USER)
        if (dataHasAskExisting) {
            await new Promise((resolve) => setTimeout(resolve, 3000))
            await animateWords(dataHasAskExisting.htmlContent, (updateFn) => setResponseIa(updateFn), () => setLoading(false));
            return
        }
        try {
            const stream = await fetch(`${session?.user.stripeNamePlan === "Free" ? "/api/resBibleForTest" : "/api/resBible"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageUser: ASK_USER }),
            });

            // Isso é essencial!
            if (!stream.ok) {
                const data = await stream.json();
                throw new Error(`Erro ao gerar resposta: ${data.error}`);
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
            await resCreated(askHash, fullResponse)
            setSelectedText([]);
        } catch (error: any) {
            if (error instanceof Error) {
                setIsDrawerOpen(false)
                toast.error(error.message)
            }
        } finally {
            setLoading(false);
        }
    };

    // Função de vibração no dispositivo
    const handleVibration = () => {
        if (navigator.vibrate) {
            navigator.vibrate(90); // Vibra por 90ms
        }
    };


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
        <div className=" ">
            <div className="flex flex-col items-center justify-center w-full my-selects mx-auto p-3 pb-28 md:gap-11 gap-10 mt-14">
                <div className='flex items-center justify-between flex-row gap-6 w-full'>
                    <Select value={selectNameBook} onValueChange={(e) => {
                        setSelectNameBook(e);
                        getChapterBible(e);
                        setSelectNumberChapter(0);
                        setSelectedText([]);
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
                        setSelectedText([]);
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
                                onClick={() => { askIA(index); setIsDrawerOpen(!isDrawerOpen); }}
                                className={`cursor-pointer flex items-start gap-1 border dark:border dark:border-gray-700  rounded-md p-1 shadow-xs`}>
                                <p className={`${lora.className} text-[16px] text-left`}>
                                    {index + 1} - <span className='font-normal'>{texts}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Caixa de diálogo */}
            <Dialog onOpenChange={(val) => { if (val === false) return; setIsDrawerOpen(val); }} open={isDrawerOpen}>
                <DialogContent className='px-3 dark:bg-[#181818] '>
                    <DialogHeader className='flex'>
                        <DialogTitle className='flex items-center justify-between'>
                            <Image src={resolvedTheme === "dark" ? logo_white : logo} alt='logo' width={130} />
                            {<div className='cursor-pointer' onClick={() => { setIsDrawerOpen(!isDrawerOpen) }}>
                                <X className='w-5 bg text-black dark:text-white' />
                            </div>}
                        </DialogTitle>
                    </DialogHeader>

                    <div style={{ height: `${innerHeight - 200}px` }} className="w-full  flex flex-col border rounded-xl">
                        {/* Área das mensagens */}
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
                    {!loading && <div className='md:flex hidden flex-row items-center gap-3 justify-center'>
                        <WhatsappShareButton title={"Estudo do " + currentTitle} url={`${process.env.NEXT_PUBLIC_URL}share/${currentHash}`} >
                            <Button className='flex'>
                                Compartilhar
                                <WhatsappIcon />
                            </Button>
                        </WhatsappShareButton>

                        {/* <FacebookShareButton  title={"Estudo do " + currentTitle} url={`${process.env.NEXT_PUBLIC_URL}share/${currentHash}`} >
                            <Button className='flex'>
                                Compartilhar
                                <FacebookIcon />
                            </Button>
                        </FacebookShareButton> */}
                        <TwitterShareButton title={"Estudo do " + currentTitle} url={`${process.env.NEXT_PUBLIC_URL}share/${currentHash}`} >
                            <Button className='flex'>
                                Compartilhar
                                <TwitterIcon />
                            </Button>
                        </TwitterShareButton>
                    </div>
                    }
                    {!loading && <div onClick={() => share()} className='md:hidden flex  flex-row items-center gap-3 justify-center'>
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