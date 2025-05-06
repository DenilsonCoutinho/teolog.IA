"use server"
import { db as prisma } from "@/lib/db";
import { typetheology } from "@prisma/client";
import { auth } from "../../auth";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
export async function updateTheology(type_theology: typetheology) {
    const session = await auth()

    if (!session?.user.id) {
        redirect('/')
        return {
            error: "não autenticado"
        }
    }
    
    const theology = await prisma.typetheology.findFirst({
        where: { userId: session?.user.id },
    })

    await prisma.typetheology.update({
        where: { id: theology?.id },
        data: {
            type_theology
        }
    })
    revalidateTag("type-theology")
}