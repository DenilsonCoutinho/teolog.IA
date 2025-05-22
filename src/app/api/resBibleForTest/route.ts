import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';
import { LimitRate } from "../../../../actions/limitRate";
import { cookies } from "next/headers";
import { typetheology } from "@prisma/client";
import { systemPromptArminiana, systemPromptBatista, systemPromptPentecostal, systemPromptReformada } from "@/prompts/prompt";
import { addJobToQueue } from "@/lib/queue";
import { db as prisma } from "@/lib/db";
type Theology = {
  data: {
    type_theology: typetheology
  }
}
export async function POST(req: NextRequest) {
  function formatSecond(seconds: number) {
    const horas = Math.floor(seconds / 3600)
    const minutos = Math.floor((seconds % 3600) / 60)
    const restoSegundos = seconds % 60

    return `${horas}h ${minutos}m ${restoSegundos}s`
  }
  const { messageUser, perguntaHash, userId } = await req.json();


  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }
  const cookieHeader = await cookies();

  const typetheology = await fetch(`${process.env.NEXT_PUBLIC_URL}api/revalidates/typeTheology`, {
    headers: {
      cookie: cookieHeader.toString(),  // Envia os cookies como string no cabeçalho
    },
    next: { tags: ['type-theology'] },
  }).then(async res => {
    if (!res.ok) {
      console.error(res.statusText)
      return
    }
    return await res.json() as Promise<Theology>;
  });
  if (!typetheology?.data.type_theology) {
    return NextResponse.json({ error: 'Você precisa selecionar uma Teologia!' }, { status: 401 });
  }
  const theology = typetheology?.data.type_theology
  const systemPrompt = theology === "BATISTA" ? systemPromptBatista :
    theology === "ARMINIANA" ? systemPromptArminiana :
      theology === "PENTECOSTAL" ? systemPromptPentecostal : systemPromptReformada


  try {
    const existing = await prisma.sharedResponse.findUnique({
          where: { perguntaHash }
        });
        if (existing) {
          if (existing.status === "pending") {
            // Resposta ainda em processamento, pode retornar um status 202 (Accepted)
            return NextResponse.json({ message: "Resposta em processamento, aguarde..." }, { status: 202 });
          } else {
            // Resposta pronta, retorna direto
            return NextResponse.json({ htmlContent: existing.htmlContent });
          }
        } else {
          // Cria registro pendente
          await prisma.sharedResponse.create({
            data: {
              userId: userId,
              perguntaHash,
              status: "pending",
              teologia: theology,
            }
          });
        }
    const limitRate = await LimitRate(req)
    if (limitRate?.error) {

      return NextResponse.json({
        error: `Você atingiu o limite de 3/3 tentativas, volte em ${formatSecond(limitRate.ttl)}`
      }, { status: 429 });
    }

    await addJobToQueue({
      messageUser,
      type_theology: theology,
      userId: userId,
      perguntaHash
    });

    const stream = await streamText({
      model: xai("grok-3-beta"),
      system: systemPrompt,
      prompt: messageUser,
      temperature: 0,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream.textStream) {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
        controller.close();
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
