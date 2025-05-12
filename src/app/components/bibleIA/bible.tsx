"use client";
import { useEffect, useState } from 'react';
import acf from '../../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../../pt_nvi.json' assert { type: "json" };
import ntlh from '../../../../pt_ntlh.json' assert { type: "json" };
import mark from '../../../assets/mark.svg';
import logo from '../../../assets/logo-teologia-2.svg';
import Confetti from 'react-confetti'
import logo_white from '../../../assets/logo-teologia-white.svg'

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
import DualRingSpinnerLoader from '../ui/DualRingSpinnerLoader';
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

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
    const { setTheme, theme } = useTheme()

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
    const route = useRouter()

    const bible = selectTranslation === "ACF" ? acf as BibleBook[] :
        selectTranslation === "NTLH" ? ntlh as BibleBook[] :
            selectTranslation === "NVI" ? nvi as BibleBook[] : ntlh as BibleBook[]

    const [textSelected, setTextSelected] = useState<string>("");
    const [isConfeti, setIsConfeti] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingLayout, setLoadingLayout] = useState<boolean>(false);
    const [responseIa, setResponseIa] = useState<string>("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedText, setSelectedText] = useState<string[]>([]);

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

    // Função que obtém os capítulos do livro
    function getChapterBible(chapter: string) {
        if (chapter === "") setSelectChapter(null);
        setSelectTextBookBible([]);

        const versicleData = bible?.find((e: BibleBook) => e?.name === chapter);
        const chapters = versicleData?.chapters;
        if (!chapters) return;

        const formatedChapters = Object?.entries(chapters)?.map((_, index) => {
            return { number: index };
        });
        setSelectChapter(formatedChapters || null);
        getTextBookBible(chapter);
    }

    // Função que obtém os textos de um livro específico
    function getTextBookBible(nameBook: string) {
        const versicleData = bible?.find(e => e?.name === nameBook);
        if (!versicleData) return;
        setSelectTextBookBible(versicleData?.chapters);
    }

    // Função que marca ou desmarca um texto selecionado
    function getTextSelected(index: number, text: string) {
        setSelectedText((prev) => prev.find(e => e === `${index + 1}` + " - " + text)
            ? prev.filter(e => e !== `${index + 1}` + " - " + text)
            : [...prev, `${index + 1}` + " - " + text]);
    }

    // Efeito que é chamado após a hidratação do Zustand
    useEffect(() => {
        if (!hasHydrated) return; // Espera até o Zustand terminar de hidratar

        if (!selectNameBook) {
            setSelectTextBookBible(bible[0]?.chapters);
            getChapterBible("Gênesis");
            setSelectNameBook("Gênesis");
            setSelectNumberChapter(0);
        }
    }, [hasHydrated]);

   
    useEffect(() => {
        if (!selectNameBook) {
            setSelectTextBookBible(bible[0]?.chapters);
            getChapterBible("Gênesis");
            setSelectNameBook("Gênesis");
            setSelectNumberChapter(0);
        }
    }, [selectTranslation,selectNameBook]);
    // Função que envia o texto selecionado para o backend e recebe a resposta da IA
    const send = async () => {
        setLoading(true);
        setResponseIa("");
        const TEXT_SELECTED_FORMATED = selectedText.join(" ");
        const messageUser = `livro: ${selectNameBook} Capítulo: ${selectNumberChapter + 1}\n\n${TEXT_SELECTED_FORMATED}`.trim();

        try {
            const stream = await fetch(`${session?.user.stripeNamePlan === "Free" ? "/api/resBibleForTest" : "/api/resBible"}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageUser }),
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

    if (maintenance) {
        return (
            <div className='h-screen justify-center flex-col items-center flex bg-white'>
                <Image alt='logo' src={logo} />
                <h1 className='md:text-4xl text-center font-light text-black'>EM DESENVOLVIMENTO</h1>
            </div>
        );
    }



    return (
        <div>
            {
                loadingLayout &&
                <div className='fixed bg-gray-50 opacity-40 top-0 right-0 left-0 z-50 h-full w-full'>
                    <div className='min-h-screen flex flex-col justify-center items-center'>
                        <Image src={theme === "dark" ? logo_white : logo} alt='logo' />
                        <DualRingSpinnerLoader />
                    </div>
                </div>
            }

            {selectedText.length > 0 && (
                <button
                    disabled={loading}
                    onClick={() => {
                        setIsDrawerOpen(!isDrawerOpen);
                        send();
                        handleVibration();
                    }}
                    className='border-1 cursor-pointer rounded-full border-black shadow-md h-16 w-16 fixed bottom-10 right-10 roll-in-left'>
                    <Image alt='logo' src={mark} width={140} height={200} />
                </button>
            )}

            <div className="flex flex-col items-center md:pl-20 justify-center w-full my-selects mx-auto p-3 pb-28 md:gap-11 gap-10 mt-14">
                {/* Seletor de livro */}
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
                    {/* Seletor de capítulo */}
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

                {/* Exibição dos textos selecionados */}
                <section>
                    <div className='flex flex-col gap-2'>
                        {selectTextBookBible[selectNumberChapter]?.map((texts, index) => (
                            <div
                                key={index}
                                onClick={() => getTextSelected(index, texts)}
                                className={`${selectedText.find(e => e === `${index + 1}` + " - " + texts)
                                    ? "bg-gradient-to-r from-purple-800 to-blue-600 text-white"
                                    : " "} cursor-pointer flex items-start gap-1 border dark:border dark:border-gray-700  rounded-md p-1 shadow-xs`}>
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
                <DialogContent className='px-3 dark:bg-[#181818]'>
                    <DialogHeader className='flex'>
                        <DialogTitle className='flex items-center justify-between'>
                            <Image src={theme === "dark" ? logo_white : logo} alt='logo' width={130} />
                            {!loading && <div className='cursor-pointer' onClick={() => { setIsDrawerOpen(!isDrawerOpen) }}>
                                <X className='w-5 bg text-black dark:text-white' />
                            </div>}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="w-full h-[29rem] flex flex-col border rounded-xl">
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
                </DialogContent>
            </Dialog>
        </div>
    );
}