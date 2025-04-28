import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_TRIES = 3;
const WINDOW_SECONDS = 60 * 60 * 24; // 1 dia

export async function LimitRate(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `rate-limit:${ip}`;

  const ttl = await redis.ttl(key); // tempo restante
  const tries = (await redis.get<number>(key)) ?? 0;

  if (tries >= MAX_TRIES) {
    return { error: true, ttl, tries };
  }

  const newTries = await redis.multi()
    .incr(key)
    .exec()
    .then((results) => results[0] as number);

  if (newTries === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  const remaining = MAX_TRIES - newTries;

  return { error: false, remaining, ttl };
}
