import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const MAX_TRIES = 3;
const WINDOW_SECONDS = 60 * 60 * 24; // 1 dia

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `rate-limit:${ip}`;
  const ttl = await redis.ttl(key) // em segundos
  // Obtém o número atual de tentativas
  const tries = (await redis.get<number>(key)) ?? 0;

  // Verifica se o limite foi atingido
  if (tries >= MAX_TRIES) {
    return Response.json({ error: 'Limite diário atingido',ttl,tries }, { status: 429 });
  }

  // Usa uma transação para garantir que o incremento seja atômico
  const newTries = await redis.multi()
    .incr(key)
    .exec()
    .then((results) => results[0] as number);

  // Define a expiração apenas na primeira tentativa
  if (newTries === 1) {
    await redis.expire(key, WINDOW_SECONDS);
  }

  // Calcula as tentativas restantes
  const remaining = MAX_TRIES - newTries;

  return Response.json({ message: 'Acesso concedido', remaining ,ttl });
}