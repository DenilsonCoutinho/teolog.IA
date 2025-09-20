"use client"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DualRingSpinnerLoader from "@/app/components/ui/DualRingSpinnerLoader";
import logo from '../../../assets/logo-teologia-2.svg'
import logo_white from '../../../assets/logo-teologia-white.svg'
import { useBibleStore } from "@/zustand/useBible";
import { useTheme } from "next-themes";
import { useResize } from "../../../../context/triggerResizeContext";

export default function Settings() {

    const route = useRouter()
    const [loadingLayout, setLoadingLayout] = useState<boolean>(true);
    const {
        selectTranslation,
        setSelectTranslation,
        setSelectNameBook
    } = useBibleStore();
    const { data: session } = useSession()
    const { resolvedTheme } = useTheme()
    const { innerHeight } = useResize()
    const [myTheme, setMyTheme] = useState<string | undefined>('');
    useEffect(() => {
        setLoadingLayout(true)
        if (!session?.user.id) {
            return route.replace("/")
        }
        setLoadingLayout(false)
    }, [])

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