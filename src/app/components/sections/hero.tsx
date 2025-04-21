import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {

    const handleScroll = (id: any) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };
    return (
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-purple-50 to-white">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-800 to-blue-600 text-transparent bg-clip-text mb-6">
                    Compreensão Espiritual com um Clique
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 mb-8">
                    Selecione um versículo. Deixe a IA explicar o contexto. Aprofunde sua fé com facilidade.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 ">
                    <Link className="w-full" href={"/bibleIA"}>
                        <Button size="lg" className="bg-purple-800 hover:bg-purple-900 cursor-pointer w-full">
                            Teste Grátis Agora
                        </Button>
                    </Link>
                    <Button onClick={() => handleScroll('howItwork')} className="cursor-pointer hover:brightness-75" size="lg">
                        Como Funciona
                    </Button>
                </div>
                <div className="rounded-lg shadow-2xl overflow-hidden">
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