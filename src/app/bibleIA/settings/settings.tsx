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
import logo from '../../../assets/logo-teologia-2.svg';
import { updateTranslation } from "../../../../service/updateTranslation";
import { useBibleStore } from "@/zustand/useBible";
import acf from '../../../../pt_acf.json' assert { type: "json" };
import nvi from '../../../../pt_nvi.json' assert { type: "json" };
import ntlh from '../../../../pt_ntlh.json' assert { type: "json" };
type TypeTheologyProps = "ARMINIANA" | "REFORMADA" | "PENTECOSTAL" | "BATISTA"

type Theology = {
    data: {
        type_theology: typetheology
    }
}

type TypeTranslations = "ACF" | "NTLH" | "NVI"
type Translations = {
    data: {
        type_translations: TypeTranslations
    }
}
export default function Settings({ typetheology, typetranslations }: { typetheology: Theology | undefined, typetranslations: Translations | undefined }) {

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
    const [loadingLayout, setLoadingLayout] = useState<boolean>(false);
    const {
        setHasHydrated,
        hasHydrated,
    } = useBibleStore();
    const { data: session } = useSession()
    const [theologySelected, setTheologySelected] = useState<TypeTheologyProps | null>()
    const [translationSelected, setTranslationSelected] = useState<TypeTranslations | null>()

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

    async function changeTranslation() {
        try {
            setLoading(true)
            if (!translationSelected) {
                throw new Error('Você precisa selecionar uma teologia.')
            }
            await updateTranslation(translationSelected)
            toast.success('Tradução atualizada com sucesso!')
            setLoading(false)
            setHasHydrated(false)
            setTranslationSelected(null)
           useBibleStore.persist.clearStorage() 
           return location.reload()

        } catch (error: unknown) {
            setLoading(false)
            if (error instanceof Error) {
                return toast.error(error.message || 'Ocorreu um erro inesperado.')
            }
        }

    }

    return (
        <>
            {
                loadingLayout &&
                <div className='fixed bg-gray-50 opacity-40 top-0 right-0 left-0 z-50 h-full w-full'>
                    <div className='min-h-screen flex flex-col justify-center items-center'>
                        <Image src={logo} alt='logo' />
                        <DualRingSpinnerLoader />
                    </div>
                </div>
            }

            <div className="w-full mt-20 flex flex-wrap gap-3">
                <div className="border-gray-100 space-y-2 rounded-lg p-4 border shadow-md h-40 max-w-96 w-full">
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
                </div>

                <div className="border-gray-100 space-y-2 rounded-lg p-4 border shadow-md h-40 max-w-96 w-full">
                    <h1 className="font-bold text-xl text-gray-700 dark:text-zinc-200">Tradução Bíblica</h1>
                    <Select onValueChange={(e: TypeTranslations) => setTranslationSelected(e)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue className="dark:text-zinc-200" placeholder={typetranslations?.data?.type_translations} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel></SelectLabel>
                                {bibleTranslations?.map((e) => (
                                    <SelectItem key={e.name} className="text-black dark:text-zinc-200 uppercase" value={e.name}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button disabled={translationSelected ? false : true} onClick={() => changeTranslation()} className="bg-gray-900 dark:text-zinc-200 text-white max-w-2xl cursor-pointer">{loading ? <Loader /> : "Alterar"}</Button>
                </div>
            </div>
        </>
    )
}