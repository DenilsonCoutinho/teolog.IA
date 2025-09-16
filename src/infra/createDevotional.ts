import { db as prisma } from "@/lib/db";
import { devotionalBibleRepo } from "@/app/core/repositories/devotionalBibleRepo";
import OpenAI from "openai";
import { systemPromptDevotional, userPrompt } from "@/prompts/prompt";
import { redis } from "@/utils/redis";
import { ResDevotionalIa } from "@/app/core/entities/resDevotional";

export function DevotionalIaPrisma(): devotionalBibleRepo {
    return {
        async create(today: Date) {
            try {
                const REDIS_KEY = `devotional:${new Date().toISOString().slice(0, 10)}`
                const cached = await redis.get(REDIS_KEY) as ResDevotionalIa
                if (cached) {
                    return cached
                }
                const client = new OpenAI({
                    apiKey: process.env.XAI_API_KEY_DEVOTIONAL || '',
                    baseURL: 'https://api.x.ai/v1',
                })
                const result = await client.chat.completions.create({
                    model: 'grok-3-beta',
                    messages: [
                        { role: 'system', content: systemPromptDevotional },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0,
                })

                const contentDevotional = result.choices?.[0]?.message?.content as string

                const create = await prisma.devotional.create({
                    data: {
                        content: contentDevotional,
                        date: today,
                    },
                })
                const DEVOTIONAL_TTL = 86400  // 24h

                await redis.set(REDIS_KEY, create, { ex: DEVOTIONAL_TTL })

                if (create) {
                    return create as ResDevotionalIa
                }

                return null
            } catch (error) {
                return error as Error
            }

        },

        async findByDate(today: Date) {
            const data = await prisma.devotional.findUnique({
                where: { date: today },
            })
            return data
        },
    }
}