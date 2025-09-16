import { validateLimitRate } from "@/app/core/services/validateLimitRateService";
import { rateLimitRepo } from "@/app/core/repositories/rateLimitRepo";
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_TRIES = 10;
const WINDOW_SECONDS = 60 * 5; // 5 minutos

export function limitRate(): rateLimitRepo {
    return {
        async checkLimit(userId: string) {
            const key = `rate-limit:premium:${userId}`;

            const ttl = await redis.ttl(key); // tempo restante da janela
            const tries = (await redis.get<number>(key)) ?? 0;

            const newTries = await redis.multi()
                .incr(key)
                .exec()
                .then((results) => results[0] as number);

            if (newTries === 1) {
                await redis.expire(key, WINDOW_SECONDS);
            }

            if (tries >= MAX_TRIES) {
                validateLimitRate(true, ttl)
            }
        },
    }
}