// app/api/devotional/today/route.ts
import { NextResponse } from 'next/server'
import { redis } from '../../../../actions/limitRate'
import { db as prisma } from '@/lib/db'
import OpenAI from 'openai'
import { revalidateTag } from 'next/cache'
import { DevotionalIaPrisma } from '@/infra/createDevotional'
import { CreateDevotionalIaUseCase } from '@/app/core/useCase/createResDevotionalUseCase'
import { FindDevotionalIaUseCase } from '@/app/core/useCase/findResDevotionalUseCase'
import { auth } from '../../../../auth'
import { redirect } from 'next/navigation'


const today = new Date()
today.setUTCHours(0, 0, 0, 0)
export async function GET() {
  const session = await auth()

  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado!" },
        { status: 401 })
    }
    const devotionalRepo = DevotionalIaPrisma()
    const createDevotional = await CreateDevotionalIaUseCase(devotionalRepo, today)
    if (createDevotional) {
      return NextResponse.json(createDevotional)
    }
    const findDevotionalIaUseCase = await FindDevotionalIaUseCase(devotionalRepo, today)
    if (findDevotionalIaUseCase) {
      return NextResponse.json(findDevotionalIaUseCase)
    }

  } catch (error) {
    return NextResponse.json(error as Error)
  }


  // try {
  //   // Primeiro tenta do Redis
  //   const REDIS_KEY = `devotional:${new Date().toISOString().slice(0, 10)}`
  //   const cached = await redis.get(REDIS_KEY) as string | null

  //   if (cached) {
  //     return NextResponse.json(cached)
  //   }

  //   const today = new Date()
  //   today.setUTCHours(0, 0, 0, 0)

  //   // Verifica no banco se já existe
  //   const existing = await prisma.devotional.findUnique({
  //     where: { date: today },
  //   })
  //   const DEVOTIONAL_TTL = 86400  // 24h

  //   if (existing) {
  //     await redis.set(REDIS_KEY, existing, { ex: DEVOTIONAL_TTL })
  //     return NextResponse.json(existing)
  //   }

  //   // Se não existe, gera com a IA
  //   const userPrompt = `Escolha um versículo bíblico aleatório e gere um devocional profundo e prático baseado nele.`

  //   const result = await client.chat.completions.create({
  //     model: 'grok-3-beta',
  //     messages: [
  //       { role: 'system', content: systemPrompt },
  //       { role: 'user', content: userPrompt },
  //     ],
  //     temperature: 0,
  //   })

  //   const content = result.choices?.[0]?.message?.content
  //   if (!content) {
  //     return NextResponse.json({ error: 'IA não retornou conteúdo.' }, { status: 500 })
  //   }

  //   let devotionalData
  //   try {
  //     devotionalData = content
  //   } catch {
  //     return NextResponse.json({ error: 'Erro ao interpretar JSON da IA.' }, { status: 500 })
  //   }

  //   // Salva no banco
  //   const saved = await prisma.devotional.create({
  //     data: {
  //       content: devotionalData,
  //       date: today,
  //     },
  //   })

  //   // Salva no Redis e revalida cache
  //   revalidateTag('devotional')

  //   return NextResponse.json(saved)
  // } catch (error) {
  //   console.error('[DEVOTIONAL ERROR]', error)
  //   return NextResponse.json({ error: 'Erro ao gerar devocional' }, { status: 500 })
  // }
}
