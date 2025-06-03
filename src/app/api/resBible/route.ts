import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { db as prisma } from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';
import { limitRatePremium } from "../../../../actions/limitRatePremium";
import { auth } from "../../../../auth";
import { typetheology } from "@prisma/client";
import { systemGenericPrompt } from "@/prompts/prompt";
import { redirect } from "next/navigation";
import Redis from "ioredis";

type Theology = {
  data: {
    type_theology: typetheology
  }
}

function formatSecond(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

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
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }
    const redisClient = new Redis("rediss://default:AWxAAAIjcDFjZjZkMzUwZDNiZTc0OGJhYTBjMDNiN2YzZmUyNjQyZnAxMA@desired-rhino-27712.upstash.io:6379");


    const lockKey = `lock:${perguntaHash}`;
    const lock = await (redisClient.set as any)(lockKey, "locked", "NX", "EX", 20);

    if (!lock) {
      // Alguém já está gerando essa resposta
      return NextResponse.json({
        message: "Essa pergunta já está sendo processada por outro usuário. Aguarde alguns segundos para ver a resposta pronta.",
      }, { status: 202 });
    }
    const rate = await limitRatePremium(session?.user?.id);

    if (rate.error) {
      return NextResponse.json({
        error: `Você atingiu o limite de 10 requisições. Tente novamente em ${formatSecond(rate.ttl)}.`,
      }, { status: 429 });
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