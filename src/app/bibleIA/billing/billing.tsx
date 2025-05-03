"use client"
import { useSession } from "next-auth/react"
import { cancelBilling } from "../../../../actions/cancel_billing"
import { updateBilingPremium } from "../../../../actions/update_Biling_Premim"

interface BillingDataProps {
    stripeNamePlan: string | null;
    stripePricePlan: number | null;
    is_current_period_end: boolean | null;
    stripe_current_period_end: number | null;
}
export default function Billing({ billingData }: { billingData: BillingDataProps | null }) {

    const { data: section } = useSession()
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

    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[900px] w-full mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-6" onClick={() => console.log("")}>Cobrança</h2>
                {/* Assinatura */}
                <div className="bg-gray-100 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex m items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                                <img src={section?.user?.image ?? ""} className="rounded-full" />
                            </div>
                            <div>
                                <p className="font-semibold">{billingData?.stripeNamePlan}</p>
                                {billingData?.stripeNamePlan === "Premium" ? <>
                                    {billingData?.stripePricePlan &&
                                        <p className={`text-sm ${billingData.is_current_period_end && "line-through"} text-gray-500`}>{formatPrice(billingData?.stripePricePlan)} cobrados mensalmente</p>

                                    }
                                    {billingData?.stripe_current_period_end && <p className={`text-sm ${billingData.is_current_period_end && ""} text-gray-500`}>{billingData.is_current_period_end ? "Vence em" : "Próxima data de cobrança"}: <span className="font-bold">{formatCancelDate(billingData?.stripe_current_period_end)}</span></p>}
                                </> : <></>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        {billingData?.stripeNamePlan === "Free" && <button onClick={() => updateBilingPremium()} className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md">
                            Mudar de plano
                        </button>}
                        {billingData?.stripeNamePlan === "Premium" && <button onClick={() => cancelBilling()} className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md">
                            Cancelar plano
                        </button>}
                    </div>

                    {/* <div className="mt-4">
                        <button className="text-sm text-indigo-600 hover:underline">Aplicar cupom</button>
                    </div> */}
                </div>

                {/* Detalhes de faturamento */}
                {/* <div className="mt-10">
                    <h3 className="text-md font-semibold mb-2">Detalhes de faturamento</h3>
                    <p className="text-sm text-gray-600">Informações de contato</p>
                </div> */}
            </div>

            {/* <Button onClick={() => updateBiling()}>Atualiza pro PRO</Button> */}
        </div>
    )
}