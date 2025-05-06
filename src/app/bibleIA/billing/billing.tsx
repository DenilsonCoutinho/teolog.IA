"use client"
import { useSession } from "next-auth/react"
import { cancelBilling } from "../../../../actions/cancel_billing"
import { updateBilingPremium } from "../../../../actions/update_Biling_Premim"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/app/components/ui/loading";

export default function Billing() {
    const route = useRouter()

     useEffect(() => {
            if (!session?.user.id) {
                return route.replace("/")
            }
        }, [])
    const [loading, setLoading] = useState<boolean>()
    const { data: session } = useSession()
    const formatPrice = (amount: number, currency = 'BRL') => {

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
        }).format(amount / 100) // Stripe usa centavos
    }

    const formatCancelDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000) // Stripe fornece timestamp em segundos
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0') // mês começa do 0
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
    }

    async function goToPremium() {
        setLoading(true)
        await updateBilingPremium("/bibleIA/billing")
    }

    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[900px] w-full mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-6" onClick={() => console.log("")}>Cobrança</h2>
                {/* Assinatura */}
                <div className="bg-gray-100 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex m items-center gap-4">
                            <Avatar className="h-8 w-8 rounded-lg bg-gray-400">
                                <AvatarImage src={session?.user?.image ?? ''} alt="Image User" />
                                <AvatarFallback className="rounded-lg font-bold text-black">{session?.user?.name?.substring(0, 1) ?? ""}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{session?.user?.stripeNamePlan}</p>
                                {session?.user?.stripeNamePlan === "Premium" ? <>
                                    {session?.user?.stripePricePlan &&
                                        <p className={`text-sm ${session?.user.is_current_period_end && "line-through"} text-gray-500`}>{formatPrice(session?.user?.stripePricePlan)} cobrados mensalmente</p>

                                    }
                                    {session?.user?.stripe_current_period_end && <p className={`text-sm ${session?.user.is_current_period_end && ""} text-gray-500`}>{session?.user.is_current_period_end ? "Vence em" : "Próxima data de cobrança"}: <span className="font-bold">{formatCancelDate(session?.user?.stripe_current_period_end)}</span></p>}
                                </> : <></>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4 ">
                        {session?.user?.stripeNamePlan === "Free" && <button disabled={loading} onClick={() => goToPremium()} className="Btn">

                            {loading ? <Loader /> : <svg viewBox="0 0 576 512" height="1em" className="logoIcon">
                                <path d="M309 106c11.4-7 19-19.7 19-34c0-22.1-17.9-40-40-40s-40 17.9-40 40c0 14.4 7.6 27 19 34L209.7 220.6c-9.1 18.2-32.7 23.4-48.6 10.7L72 160c5-6.7 8-15 8-24c0-22.1-17.9-40-40-40S0 113.9 0 136s17.9 40 40 40c.2 0 .5 0 .7 0L86.4 427.4c5.5 30.4 32 52.6 63 52.6H426.6c30.9 0 57.4-22.1 63-52.6L535.3 176c.2 0 .5 0 .7 0c22.1 0 40-17.9 40-40s-17.9-40-40-40s-40 17.9-40 40c0 9 3 17.3 8 24l-89.1 71.3c-15.9 12.7-39.5 7.5-48.6-10.7L309 106z">
                                </path>
                            </svg>}
                            DESBLOQUEAR O PREMIUM
                        </button>}
                        {session?.user?.stripeNamePlan === "Premium" && <button onClick={() => cancelBilling()} className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md">
                            Cancelar plano
                        </button>}
                    </div>
                </div>
            </div>
        </div>
    )
}