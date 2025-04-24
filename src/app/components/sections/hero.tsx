"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import logo from '../../../assets/logo-teologia-2.svg'
import { LoginBtn } from "../auth/loginButton";

export function Hero() {

    const handleScroll = async (id: any) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleScrollTest = async (id: any) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth",block:"start" });
        }
    };
    return (
        <section className=" flex flex-col items-center justify-center text-center  bg-gradient-to-b from-purple-50 to-white">
            <div className="w-full mx-auto">
                <div className='flex items-center justify-between w-full shadow-md p-3 mb-10 top-0 bg-white z-50'>
                    <Image alt='logo' src={logo} width={140} height={200} />
                    <LoginBtn />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r max-w-4xl mx-auto from-purple-800 to-blue-600 text-transparent bg-clip-text mb-6">
                    Compreensão Espiritual facilitada
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 mb-8">
                    Selecione um versículo. Deixe a IA explicar o contexto. Aprofunde sua fé com facilidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12 max-w-[400px] mx-auto">
                    {/* <Link className="w-full" href={"/bibleIA"}> */}
                        <Button onClick={()=>handleScrollTest("test")} size="lg" className="bg-purple-800 hover:bg-purple-900 cursor-pointer w-[200px]">
                            Teste Grátis Agora
                        </Button>
                    {/* </Link> */}
                    <Button onClick={() => handleScroll('howItwork')} className="cursor-pointer hover:brightness-75 w-[200px]" size="lg">
                        Como Funciona
                    </Button>
                </div>
                <div className="rounded-lg shadow-2xl overflow-hidden max-w-4xl mx-auto">
                    <img
                        src="https://placehold.co/800x450"
                        alt="Demonstração do produto"
                        className="w-full object-cover"
                    />
                </div>
            </div>
        </section>
    );
}