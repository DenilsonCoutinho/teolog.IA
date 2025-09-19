import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="max-w-xl flex justify-center items-center flex-col mx-auto p-6    text-center">
            <div className=' h-56 border border-gray-400 flex justify-center items-center flex-col rounded-lg'>
                <h2 className="text-2xl font-bold mb-2">Devocional não encontrado</h2>
                <p className="text-gray-600">
                    Ocorreu um erro ao tentar carregar. Por favor recarregue a página ou tente novamente mais tarde.
                </p>
                <Link href={`${process.env.NEXT_PUBLIC_URL}/bibleIA/devotional`}>
                    <Button className="mt-4">
                        Recarregar
                    </Button>
                </Link>
            </div>
        </div>
    )
}