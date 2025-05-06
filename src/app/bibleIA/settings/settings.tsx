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

type TypeTheologyProps = "ARMINIANA" | "REFORMADA" | "PENTECOSTAL" | "BATISTA"

type Theology = {
    data: {
        type_theology: typetheology
    }
}

export default function Settings({ typetheology }: { typetheology: Theology | undefined }) {

    const options: { id: TypeTheologyProps; label: string }[] = [
        { id: 'BATISTA', label: 'Teologia Batista' },
        { id: 'PENTECOSTAL', label: 'Teologia Pentecostal' },
        { id: 'REFORMADA', label: 'Teologia Reformada' },
        { id: 'ARMINIANA', label: 'Teologia Arminiana' },
    ];
    const route = useRouter()
    const [loadingLayout, setLoadingLayout] = useState<boolean>(false);

    const { data: session } = useSession()
    const [theologySelected, setTheologySelected] = useState<TypeTheologyProps | null>()
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
            <div className="border-gray-100 mt-20 space-y-2 rounded-lg p-4 border shadow-md h-40 max-w-96 w-full">
                <h1 className="font-bold text-xl text-gray-700">Sua linha teológica</h1>
                <Select onValueChange={(e: TypeTheologyProps) => setTheologySelected(e)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={typetheology?.data.type_theology} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel></SelectLabel>
                            {options?.map((e) => (
                                <SelectItem key={e.id} className="text-black" value={e.id}>
                                    {e.id}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button disabled={theologySelected ? false : true} onClick={() => changeTheology()} className="bg-gray-900 text-white max-w-2xl">{loading ? <Loader /> : "Alterar"}</Button>
            </div>
        </>
    )
}