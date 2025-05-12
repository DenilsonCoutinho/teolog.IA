"use server"
import { db as prisma } from "@/lib/db";
import { typetranslations } from "@prisma/client";
import { auth } from "../../auth";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
export async function updateTranslation(type_translations: typetranslations) {
    const session = await auth()

    if (!session?.user.id) {
        redirect('/')
        return {
            error: "não autenticado"
        }
    }

    const theology = await prisma.typeTranslations.findFirst({
        where: { userId: session?.user.id },
    })

    if (theology?.type_translations) {
        return await prisma.typeTranslations.update({
            where: { id: theology?.id },
            data: {
                type_translations
            }
        })
    }
   await prisma.typeTranslations.create({
        data: {
            userId: session.user.id,
            type_translations
        }
    })
    revalidateTag("type-translation")
}