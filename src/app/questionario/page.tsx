'use client';

import { useState } from 'react';
import { questionnaire } from '../../../actions/questionnaire';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loader from '../components/ui/loading';

const options: { id: TypeTheology; label: string }[] = [
    { id: 'BATISTA', label: 'Teologia Batista' },
    { id: 'PENTECOSTAL', label: 'Teologia Pentecostal' },
    { id: 'REFORMADA', label: 'Teologia Reformada' },
    { id: 'ARMINIANA', label: 'Teologia Arminiana' },
];

type TypeTheology = "ARMINIANA" | "REFORMADA" | "PENTECOSTAL" | "BATISTA"


export default function Questionario() {
    const { data: session } = useSession()
    const ID_USER = session?.user?.id
    const [selected, setSelected] = useState<TypeTheology | null>(null);
    const [loading, setLoading] = useState<boolean>();
    const route = useRouter()
    const handleSelect = (id: TypeTheology) => {
        setSelected(id);
    };

    const handleSubmit = async () => {
        setLoading(true)
        try {
            if (!ID_USER) {
                throw new Error("Id indisponivel")
            }

            if (!selected) {
                throw new Error("Nada selecionado!")
            }
            await questionnaire(ID_USER, selected)
            route.push('/bibleIA')
        } catch (error) {
            console.error(error)
        }finally{
            setLoading(false)
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-t from-blue-50 via-blue-100 to-purple-100">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

                <>
                    <h1 className="text-2xl font-bold text-center text-gray-800">
                        Qual linha teológica você se identifica mais?
                    </h1>
                    <div className="flex flex-col gap-4">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className={`px-6 py-3 rounded-xl border text-lg font-medium ${selected === option.id
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                    } transition-all`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!selected}
                        className="flex items-center gap-3 justify-center w-full mt-4 py-3 bg-blue-600 cursor-pointer text-white rounded-xl font-semibold  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {loading?"Salvando...":"Confirmar Escolha"} 
                        {loading&&
                        <div className='w-6'>
                        <Loader/>
                        </div>
                        }
                    </button>
                </>

            </div>
        </div>
    );
}
