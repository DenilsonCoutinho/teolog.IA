"use server"
import { db as prisma } from "@/lib/db";
export default async function UpdateNewUser(userId: string) {

    const isNewUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            isNewUser: false
        }
    })


    return isNewUser
}