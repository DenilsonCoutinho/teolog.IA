"use client"
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { typetheology, Typetheology } from "@prisma/client";
import { useSession } from "next-auth/react";
import { updateTheology } from "../../../../service/changeTheology";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loader from "@/app/components/ui/loading";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DualRingSpinnerLoader from "@/app/components/ui/DualRingSpinnerLoader";
import logo from '../../../assets/logo-teologia-2.svg'
import logo_white from '../../../assets/logo-teologia-white.svg'
import { useBibleStore } from "@/zustand/useBible";

import { useTheme } from "next-themes";
import { useResize } from "../../../../context/triggerResizeContext";
type TypeTheologyProps = "ARMINIANA" | "REFORMADA" | "PENTECOSTAL" | "BATISTA"



export default function Settings() {

    const options: { id: TypeTheologyProps; label: string }[] = [
        { id: 'BATISTA', label: 'Teologia Batista' },
        { id: 'PENTECOSTAL', label: 'Teologia Pentecostal' },
        { id: 'REFORMADA', label: 'Teologia Reformada' },
        { id: 'ARMINIANA', label: 'Teologia Arminiana' },
    ];

    const bibleTranslations = [
        {
            id: 'acf',
            name: 'ACF',
            description: 'Almeida Corrigida Fiel – tradução mais literal e tradicional, muito usada em igrejas conservadoras.'
        },
        {
            id: 'ntlh',
            name: 'NTLH',
            description: 'Nova Tradução na Linguagem de Hoje – voltada para linguagem acessível e fácil compreensão.'
        },
        {
            id: 'nvi',
            name: 'NVI',
            description: 'Nova Versão Internacional – equilíbrio entre fidelidade textual e clareza moderna.'
        }
    ];

    const route = useRouter()
    const [loadingLayout, setLoadingLayout] = useState<boolean>(true);
    const {
        setHasHydrated,
        hasHydrated,
        selectTranslation,
        setSelectTranslation,
        setSelectNameBook
    } = useBibleStore();
    const { data: session } = useSession()
    const [theologySelected, setTheologySelected] = useState<TypeTheologyProps | null>()
    const { setTheme, theme, resolvedTheme } = useTheme()
    const { innerHeight } = useResize()
    const [myTheme, setMyTheme] = useState<string | undefined>('');
    const [loading, setLoading] = useState<boolean>()
    useEffect(() => {
        setLoadingLayout(true)
        if (!session?.user.id) {
            return route.replace("/")
        }
        setLoadingLayout(false)
    }, [])
    async function changeTheology() {
        try {
            setLoading(true)
            if (!theologySelected) {
                throw new Error('Você precisa selecionar uma teologia.')
            }
            await updateTheology(theologySelected)
            toast.success('Teologia atualizada com sucesso!')
            setLoading(false)
            setTheologySelected(null)
        } catch (error: unknown) {
            setLoading(false)
            if (error instanceof Error) {
                return toast.error(error.message || 'Ocorreu um erro inesperado.')
            }
        }

    }

    useEffect(() => {
        setMyTheme(resolvedTheme)
    }, [resolvedTheme])



    if (loadingLayout) {
        return <div className='w-full flex justify-center items-center'>
            <div style={{ height: `${innerHeight - 130}px` }} className=''>
                <div className=' h-full flex flex-col justify-center items-center'>
                    <Image src={myTheme === "dark" ? logo_white : logo} alt='logo' />

                    <DualRingSpinnerLoader />
                </div>
            </div>
        </div>
    }
    return (
        <>

            <div className="w-full mt-20 flex flex-wrap gap-3">
                {/* <div className="border space-y-2 rounded-lg p-4 shadow-md h-40 max-w-96 w-full">
                    <h1 className="font-bold text-xl text-gray-700 dark:text-zinc-200">Sua linha teológica</h1>
                    <Select onValueChange={(e: TypeTheologyProps) => setTheologySelected(e)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue className="dark:text-zinc-200" placeholder={typetheology?.data.type_theology} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel></SelectLabel>
                                {options?.map((e) => (
                                    <SelectItem key={e.id} className="text-black dark:text-zinc-200" value={e.id}>
                                        {e.id}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button disabled={theologySelected ? false : true} onClick={() => changeTheology()} className="bg-gray-900 dark:text-zinc-200 text-white max-w-2xl cursor-pointer">{loading ? <Loader /> : "Alterar"}</Button>
                </div> */}

                <div className="border space-y-2 rounded-lg p-4 shadow-md h-40 max-w-96 w-full">
                    <h1 className="font-bold text-xl text-gray-700 dark:text-zinc-200">Selecionar Tradução</h1>
                    <Select value={selectTranslation} onValueChange={(e) => {
                        setSelectTranslation(e)
                        setSelectNameBook(undefined)
                    }}>
                        <SelectTrigger className="md:max-w-[180px]">
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
                </div>
            </div>
        </>
    )
}