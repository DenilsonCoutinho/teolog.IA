"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"
import Stripe from "stripe"
import { cancelBilling } from "../../../../actions/cancel_billing"
export default function Billing({ dataBilling, dataPriceBilling }: { dataBilling: Stripe.Subscription | undefined, dataPriceBilling: Stripe.Price | undefined }) {

    const { data: section } = useSession()
    const [dueDate, setDueDate] = useState<string | null>()


    return (
        <div className="flex flex-col w-full">
            <div className="max-w-[900px] w-full mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-semibold mb-6" onClick={() => console.log(dataBilling)}>Cobrança</h2>
                {/* Assinatura */}
                <div className="bg-gray-100 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex m items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                                <img src={section?.user?.image ?? ""} className="rounded-full" />
                            </div>
                            <div>
                                <p className="font-semibold">Premium</p>
                                <p className="text-sm text-gray-500">R$ 27,90 cobrados mensalmente</p>
                                <p className="text-sm text-gray-500">Próxima data de cobrança: <span className="font-bold">{dueDate}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        {/* <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md">
                            Mudar de plano
                        </button> */}
                        <button onClick={() => cancelBilling()} className="flex-1 cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md">
                            Cancelar plano
                        </button>
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