import { db as prisma } from "@/lib/db";
import { devotionalBibleRepo } from "@/app/core/repositories/devotionalBibleRepo";
import OpenAI from "openai";
import { systemPromptDevotional, userPrompt } from "@/prompts/prompt";
import { redis } from "@/utils/redis";
import { ResDevotionalIa } from "@/app/core/entities/resDevotional";

export function DevotionalIaPrisma(): devotionalBibleRepo {
    return {
        async create(today: Date, content: string) {
            try {
                const REDIS_KEY = `devotional:${new Date().toISOString().slice(0, 10)}`

                const create = await prisma.devotional.create({
                    data: {
                        content: content,
                        date: today,
                    },
                })
                const DEVOTIONAL_TTL = 86400  // 24h

                await redis.set(REDIS_KEY, create.content, { ex: DEVOTIONAL_TTL })

            } catch (error) {
                return error as Error
            }

        },

        async findByDate(today: Date) {
            const REDIS_KEY = `devotional:${new Date().toISOString().slice(0, 10)}`
            const cached = await redis.get(REDIS_KEY)
            if (cached) {
                return cached as string
            }

            const data = await prisma.devotional.findUnique({
                where: { date: today },
            })
            return data?.content

        },

    }
}