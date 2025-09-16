import { NextRequest, NextResponse } from 'next/server';
import { auth } from "../../../../auth";
import { systemGenericPrompt } from "@/prompts/prompt";
import { redirect } from "next/navigation";
import { CreateResIaUseCase } from "@/app/core/useCase/createResIaUseCase";
import { CreateResIaPrisma } from "@/infra/createResIA";
import { limitRate } from "@/infra/limitRate";
import { responseInQueue } from '@/infra/responseInQueue';

const rateLimitService = limitRate();
const checkReposeService = responseInQueue();
export async function POST(req: NextRequest) {

  const { messageUser, perguntaHash } = await req.json();
  const session = await auth()
  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }

  const systemPrompt = systemGenericPrompt

  try {
    if (!session?.user?.id) {
      redirect('/')
    }

    await rateLimitService.checkLimit(session?.user?.id);

    await checkReposeService.checkResponseInQueue(perguntaHash);

    const repo = CreateResIaPrisma()

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of CreateResIaUseCase(repo, session?.user?.id, perguntaHash, systemPrompt, messageUser)) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}