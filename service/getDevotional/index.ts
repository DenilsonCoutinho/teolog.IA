"use server"
import { db as prisma } from "@/lib/db";
import { auth } from "../../auth";


export async function getDevotional(id: string) {
    const session = await auth()
    if (!session) return { error: "Usuário não autenticado!" }
    const data = await prisma.sharedResponse.findUnique({
        where: {
            id
        }
    })

    return data
}

export async function getManyDevotional(id: string) {
    const session = await auth()
    if (!session) return { error: "Usuário não autenticado!" }
    const data = await prisma.sharedResponse.findMany({
        where: {
            userId: id
        }
    })
    return data
}