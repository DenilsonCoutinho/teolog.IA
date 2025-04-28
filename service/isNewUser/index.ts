"use server"
import { db as prisma } from "@/lib/db";
export default async function IsNewUser(userId: string) {

    const isNewUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            hasCompletedQuestionnaire: true
        }
    })
    return isNewUser
}