"use server"

import { cancelPlan } from "@/lib/stripe"
import { auth } from "../../auth"
import { redirect } from "next/navigation";

export async function cancelBilling() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Não autorizado"
        }
    }


    if (!session.user.stripeCustomerId) {
        throw new Error("SubscriptionId not found!")
    }
    const url = await cancelPlan(session.user.stripeCustomerId)

    redirect(url.url)

}

