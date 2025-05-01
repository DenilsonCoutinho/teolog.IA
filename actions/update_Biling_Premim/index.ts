"use server"
import { db as prisma } from "@/lib/db"
import { openBillingPortalToUpdatePremiumPlan } from "@/lib/stripe"
import { auth } from "../../auth"
import { redirect } from "next/navigation"

export async function updateBilingPremium() {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            error: "Não autorizado"
        }
    }

    const dataUser = await prisma.user.findUnique({
        where: { id: session?.user?.id },
        select: {
            stripeCustomerId: true,
            stripePriceId: true,
            stripeSubscriptionId: true,
            stripeSubscriptionStatus: true
        }
    })
    const updateCheckoutSession = await openBillingPortalToUpdatePremiumPlan(dataUser?.stripeCustomerId!, dataUser?.stripeSubscriptionId!)

    redirect(updateCheckoutSession.url)
}