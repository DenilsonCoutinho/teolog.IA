"use server"
import { db as prisma } from "@/lib/db";
export default async function UpdateAge(userId: string, age: number) {

    if (!age) throw new Error("Idade incorreta!")

    await prisma.user.update({
        where: { id: userId },
        data: {
            age: age
        }
    })


}