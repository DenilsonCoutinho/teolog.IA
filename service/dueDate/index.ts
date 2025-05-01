"use server"

import { getDueDate } from "@/lib/stripe";
import { auth } from "../../auth";
import { db as prisma } from "@/lib/db";
export default async function getDueDateUser() {

    const session = await auth()
    try {
        if (!session?.user?.id) {
            throw new Error("not authenticated!")
        }
        const subscriptionId = await prisma.user.findFirst({
            where: {
                id: session?.user?.id
            },
            select: {
                stripeSubscriptionId: true
            }
        })

        if (!subscriptionId?.stripeSubscriptionId) {
            throw new Error("SubscriptionId not found!")
        }
        
        const dueDate = await getDueDate(subscriptionId?.stripeSubscriptionId)
        // const nextBillingDate = new Date(dueData)
        // nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

        // const day = String(nextBillingDate.getDate()).padStart(2, '0');
        // const month = String(nextBillingDate.getMonth() + 1).padStart(2, '0');
        // const year = nextBillingDate.getFullYear();

        // return `${day}/${month}/${year}`
        return dueDate
    } catch (error) {
        console.error(error)
    }

}