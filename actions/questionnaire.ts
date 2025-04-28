"use server"

import { db as prisma } from "@/lib/db"
type TypeTheology = "ARMINIANA" | "REFORMADA" | "PENTECOSTAL" | "BATISTA"

export async function questionnaire(id: string, typetheology: TypeTheology) {
    try {
        if (!id) {
            throw new Error("Id não fornecido!")
        }

        await prisma.typetheology.create({
            data: {
                userId: id,
                type_theology: typetheology
            }
        })

        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                hasCompletedQuestionnaire: true
            }
        })

    } catch (error) {

    }

}