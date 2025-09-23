"use server"
import { db as prisma } from "@/lib/db";
export default async function UpdateNewUser(userId: string) {

    const isNewUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isNewUser: false
        }
    })


    return isNewUser
}