"use client"
import { Slider } from "@/components/ui/slider";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import logo from '@/assets/logo-teologia-2.svg'
import { Button } from "@/components/ui/button";
import IsNewUser from "../../../service/isNewUser";
import { useSession } from "next-auth/react";
import Loader from "../components/ui/loading";
import { toast } from 'sonner';
import UpdateAge from "../../../service/updateAge";
import { useRouter } from "next/navigation";

export default function YourAge() {
    const [age, setAge] = useState<number[]>([33])
    const [isPending, startTransition] = useTransition()
    const route = useRouter()

    const { data: session } = useSession()

    useEffect(() => {
        try {
            async function redirectIfNewUser() {
                if (!session?.user.id) {
                    return route.push("/")
                }
                const isNewUser = await IsNewUser(session?.user.id)
                if (!isNewUser) {
                    return route.push("/bibleIA")
                }
            }
            redirectIfNewUser()
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
                return
            }
            toast.error("Algo deu errado!")
        }

    }, [])
    async function submitAge() {

        try {
            if (!session?.user.id) throw new Error("Usuário não autenticado!")
            if (!age) throw new Error("Idade incorreta!")

            startTransition(async () => {

                await UpdateAge(session?.user.id, age[0])

                return route.push("/plans")

            })
        } catch (error: unknown) {
            if (error instanceof Error) {
                return toast.error(error.message);
            }
            toast.error("Algo deu errado!");
        }
    }
    return (
        <>
            <div className="flex justify-center items-center">
                <Image src={logo} alt="logo" />
            </div>
            <div className="flex flex-col justify-center items-center w-full h-dvh p-4">
                <h1 className="text-black text-4xl mb-28">Qual a sua idade?</h1>
                <div className="max-w-96 w-full">
                    <Slider onValueChange={(e) => setAge(e)} value={age} defaultValue={[33]} max={100} step={1} />
                    <input type="text" className="border w-full rounded-lg mt-4 h-10 text-center" disabled value={age ? age[0] : 33} />
                    <Button onClick={() => submitAge()} className="mt-6 border w-full py-2 px-4 rounded-lg bg-gradient-to-r p-2 from-purple-800 to-blue-600 text-white transition" >
                        {isPending ? <Loader /> : "Salvar"}
                    </Button>
                </div>
            </div>
        </>
    )
}