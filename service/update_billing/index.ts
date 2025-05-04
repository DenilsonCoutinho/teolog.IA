"use server"
import { db as prisma } from "@/lib/db";

import { cancelPlan } from "@/lib/stripe"
import { auth } from "../../auth"
import { redirect } from "next/navigation";

export async function updateBilling() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/')
    }

    const subscriptionId = await prisma.user.findFirst({
        where: {
            id: session?.user?.id
        },
        select: {
            stripeCustomerId: true
        }
    })

    if (!subscriptionId?.stripeCustomerId) {
        throw new Error("SubscriptionId not found!")
    }
    const url = await cancelPlan(subscriptionId.stripeCustomerId)

    redirect(url.url)

}

