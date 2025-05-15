"use server"
import { db as prisma } from "@/lib/db";
import { auth } from "../../auth";

export async function HasAskExisting(perguntaHash: string) {
    const hasAskExisting = await prisma.sharedResponse.findUnique({
        where: { perguntaHash }
    })

    return hasAskExisting
}


export async function resCreated(perguntaHash: string, htmlContent: string) {
    const session = await auth()
    if (!session) return { error: "Usuário não autenticado!" }
    await prisma.sharedResponse.create({
        data: {
            userId: session?.user.id,
            htmlContent,
            teologia: session?.user.typetheology[0]?.type_theology,
            perguntaHash,
            likes: 0, 
            dislikes: 0, 
        }
    })
}