import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';
import { LimitRate } from "../../../../actions/limitRate";
import { systemGenericPrompt } from "@/prompts/prompt";
import { db as prisma } from "@/lib/db";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

export async function POST(req: NextRequest) {
  function formatSecond(seconds: number) {
    const horas = Math.floor(seconds / 3600)
    const minutos = Math.floor((seconds % 3600) / 60)
    const restoSegundos = seconds % 60

    return `${horas}h ${minutos}m ${restoSegundos}s`
  }
  const { messageUser, perguntaHash } = await req.json();
  const session = await auth()

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }

  const systemPrompt = systemGenericPrompt

  const limitRate = await LimitRate(req)

  try {
    if (limitRate?.error) {

      return NextResponse.json({
        error: `Você atingiu o limite de 3/3 tentativas, volte em ${formatSecond(limitRate.ttl)}`
      }, { status: 429 });
    }
    if (!session?.user?.id) {
      redirect('/')
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }
    const stream = await streamText({
      model: xai("grok-3-beta"),
      system: systemPrompt,
      prompt: messageUser,
      temperature: 0,
    });
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream.textStream) {
          fullResponse += chunk;
          controller.enqueue(new TextEncoder().encode(chunk));
        }

        await prisma.sharedResponse.create({
          data: {
            userId: session?.user.id,
            htmlContent: fullResponse,
            teologia: session?.user.typetheology[0]?.type_theology,
            perguntaHash,
            likes: 0,
            dislikes: 0,
          }
        })

      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {

    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}