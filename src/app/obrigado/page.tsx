'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import logo from '../../assets/logo-teologia-2.svg'
import Image from 'next/image'
import billing_data from '../../../service/billing_data'
import { useSession } from 'next-auth/react'
export default function ObrigadoPage() {
    const router = useRouter()
    const { data: session } = useSession()
    console.log(session)
    useEffect(() => {
        if (!session?.user?.id) {
            alert("Usuário não autenticado!")
            return router.push('/')
        }
        const interval = setInterval(async () => {
            
            const res = await billing_data()
            if (res?.stripeNamePlan === 'Premium') {
                router.push('/bibleIA/billing?success=true')
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [router])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
            <Image src={logo ?? ""} alt="Logo TeologIA" className="w-40 mb-6" />

            <h1 className="md:text-4xl text-3xl font-bold text-[#7D4AFE] mb-4">
                Obrigado por apoiar o Teolog.IA!
            </h1>

            <p className="md:text-lg text-gray-700 mb-6 max-w-md">
                Seu pagamento foi processado com sucesso. Estamos ativando seu plano premium agora.
                Isso pode levar alguns segundos...
            </p>

            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D4AFE]" />

            <p className="text-sm text-gray-500 mt-4">
                Você será redirecionado automaticamente.
            </p>
        </div>
    )
}
