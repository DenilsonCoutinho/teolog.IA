"use server"
import { db as prisma } from "@/lib/db";
import { auth } from "../../auth";
export default async function billing_data() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Não autenticado!")
    }

    const userData = await prisma.user.findFirst({
        where: {
            id: session.user.id
        },
        select: {
            is_current_period_end: true,
            stripePricePlan: true,
            stripeNamePlan: true,
            stripe_current_period_end:true
        }
    })

    return userData

}