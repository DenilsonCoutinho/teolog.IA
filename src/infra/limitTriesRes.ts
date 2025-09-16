import { validateLimitTriesService } from '@/app/core/services/validateLimitTriesService';
import { limitTriesRepo } from '@/app/core/repositories/rateTriesRepo';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_TRIES = 5;
const WINDOW_SECONDS = 60 * 60 * 24; // 1 dia

export function limitTries(): limitTriesRepo {
  return {
    async checkLimitTries(req: NextRequest){
      console.log(req.headers.get('x-forwarded-for'))
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const key = `rate-limit:${ip}`;

      const ttl = await redis.ttl(key); // tempo restante
      const tries = (await redis.get<number>(key)) ?? 0;

      if (tries >= MAX_TRIES) {
         validateLimitTriesService(true, ttl)
      }

      const newTries = await redis.multi()
        .incr(key)
        .exec()
        .then((results) => results[0] as number);

      if (newTries === 1) {
        await redis.expire(key, WINDOW_SECONDS);
      }

      // const remaining = MAX_TRIES - newTries;

      // return { error: false, remaining, ttl };
      //  validateLimitTriesService(false, ttl)

    },
  }
}
