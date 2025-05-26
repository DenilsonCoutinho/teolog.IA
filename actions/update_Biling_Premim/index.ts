"use server"
import { db as prisma } from "@/lib/db"
import { openBillingPortalToUpdatePremiumPlan } from "@/lib/stripe"
import { auth } from "../../auth"
import { redirect } from "next/navigation"

export async function updateBilingPremium(return_url:string) {
    const session = await auth()
    if (!session?.user?.id) {

        redirect("/login?typePlan=Premium")
        
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
    console.log("dataUser", dataUser)
    const updateCheckoutSession = await openBillingPortalToUpdatePremiumPlan(dataUser?.stripeCustomerId!, dataUser?.stripeSubscriptionId!,return_url)
    console.log("updateCheckoutSession", updateCheckoutSession)
    redirect(updateCheckoutSession.url)
}