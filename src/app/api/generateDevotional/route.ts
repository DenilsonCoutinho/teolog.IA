// app/api/devotional/today/route.ts
import { NextResponse } from 'next/server'
import { DevotionalIaPrisma } from '@/infra/createDevotional'
import { CreateDevotionalIaUseCase } from '@/app/core/useCase/createResDevotionalUseCase'
import { FindDevotionalIaUseCase } from '@/app/core/useCase/findResDevotionalUseCase'
import { auth } from '../../../../auth'
import { notFound } from 'next/navigation'


const today = new Date()
today.setUTCHours(0, 0, 0, 0)
export async function GET(req: Request) {
  const session = await auth()

  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado!" },
        { status: 401 })
    }
    const devotionalRepo = DevotionalIaPrisma()
    const findDevotionalIaUseCase = await FindDevotionalIaUseCase(devotionalRepo, today)
    if (findDevotionalIaUseCase) {
      return NextResponse.json(findDevotionalIaUseCase)
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of CreateDevotionalIaUseCase(devotionalRepo, today)) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    return NextResponse.json(error as Error)
  }

}
