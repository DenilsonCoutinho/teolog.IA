import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_TRIES = 10;
const WINDOW_SECONDS = 60 * 5; // 5 minutos

export async function limitRatePremium(userId: string) {
  const key = `rate-limit:premium:${userId}`;
  
  const ttl = await redis.ttl(key); // tempo restante da janela
  const tries = (await redis.get<number>(key)) ?? 0;

  if (tries >= MAX_TRIES) {
    return { error: true, ttl, tries, remaining: 0 };
  }

  const newTries = await redis.multi()
    .incr(key)
    .exec()
    .then((results) => results[0] as number);

  if (newTries === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  return {
    error: false,
    remaining: MAX_TRIES - newTries,
    ttl,
  };
}
