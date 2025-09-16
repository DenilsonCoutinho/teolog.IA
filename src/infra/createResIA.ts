import { CreateResRepo } from "@/app/core/repositories/resBibleIaRepo";
import { ResIaBible } from "../app/core/entities/resBible"

import { db as prisma } from "@/lib/db";

export function CreateResIaPrisma(): CreateResRepo {
    return {
        async saveResponse(
            user: ResIaBible) {
            await prisma.sharedResponse.create({
                data: {
                    userId: user.userId,
                    htmlContent: user.fullResponse,
                    perguntaHash:user.perguntaHash,
                    likes: 0,
                    dislikes: 0,
                }
            })

        }
    }
}