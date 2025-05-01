"use server"

import { createCheckoutSession } from "@/lib/stripe"
import { auth } from "../../auth"
import { redirect } from "next/navigation"

export async function createCheckoutSessionAction() {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            error: "Não autorizado"
        }
    }

    const checkoutSession = await createCheckoutSession(
        session.user.id as string,
        session.user.email as string
    )
    if (!checkoutSession.url) return
    redirect(checkoutSession.url)
}

