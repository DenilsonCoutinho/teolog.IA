"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from '../../../assets/logo-teologia-2.svg'
import { LoginBtn } from "../auth/loginButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export function Hero() {
    const { data: session, } = useSession()
    const route = useRouter()

    const handleScroll = async (id: any) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleScrollTest = async (id: any) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    

    return (

        <section className=" flex flex-col items-center justify-center text-center  bg-gradient-to-b from-purple-50 to-white">
            <div className="w-full mx-auto">
                <div className='flex items-center justify-between w-full shadow-md p-3 mb-10 top-0 bg-white z-50'>
                    <Image alt='logo' src={logo} width={140} height={200} />
                    {
                        session?.user ?
                            <>
                                <button onClick={() => route.push('/bibleIA')} className="border rounded-md w-32 py-2 bg-purple-800 hover:bg-purple-900 cursor-pointer  text-white">
                                    Ir para a biblia
                                </button>
                            </>
                            :
                            <div className="flex items-center gap-3.5">
                                <p className="md:flex hidden text-gray-600 text-lg cursor-pointer" onClick={() => route.push('/login?Register=register')}>Cadastre-se</p>
                                <LoginBtn text="Fazer login" />
                            </div>
                    }
                </div>
                <h1 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto bg-gradient-to-r  from-purple-800 to-blue-600 text-transparent bg-clip-text mb-6">
                    Compreensão Espiritual facilitada
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 mb-8">
                    Selecione um versículo. Deixe a IA explicar o contexto. Aprofunde sua fé com facilidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12 max-w-[400px] mx-auto">
                    <Button onClick={() => handleScrollTest("test")} size="lg" className="bg-purple-800 text-white hover:bg-purple-900 cursor-pointer w-[200px]">
                        Teste Grátis Agora
                    </Button>
                    <Button onClick={() => handleScroll('howItwork')} className="cursor-pointer bg-gray-950 text-white hover:brightness-75 w-[200px]" size="lg">
                        Como Funciona
                    </Button>
                </div>
              
            </div>
        </section>
    );
}