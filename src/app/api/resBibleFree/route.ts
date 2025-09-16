import { NextRequest, NextResponse } from 'next/server';
import { systemGenericPrompt } from "@/prompts/prompt";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { CreateResIaUseCase } from "@/app/core/useCase/createResIaUseCase";
import { CreateResIaPrisma } from "@/infra/createResIA";
import { responseInQueue } from "@/infra/responseInQueue";
import { limitTries } from "@/infra/limitTriesRes";

const rateLimitService = limitTries();
const checkReposeService = responseInQueue();
export async function POST(req: NextRequest) {
  const session = await auth()
  const { messageUser, perguntaHash } = await req.json();

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }

  const systemPrompt = systemGenericPrompt

  try {
    if (!session?.user?.id) {
      redirect('/')
    }

    await rateLimitService.checkLimitTries(req)
    await checkReposeService.checkResponseInQueue(perguntaHash)

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
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}