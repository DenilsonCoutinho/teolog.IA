import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Redis from "ioredis";
import { db as prisma } from "@/lib/db"

import { auth } from "../../../../auth";
import { typetheology } from "@prisma/client";
import { limitRatePremium } from "../../../../actions/limitRatePremium";
import { systemPromptArminiana, systemPromptBatista, systemPromptPentecostal, systemPromptReformada } from "@/prompts/prompt";
import { addJobToQueue } from "@/lib/queue";

type Theology = {
  data: {
    type_theology: typetheology;
  };
};

function formatSecond(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
}

export async function POST(req: NextRequest) {
  const { messageUser, perguntaHash,userId} = await req.json();
  const session = await auth();

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }


  const cookieHeader = await cookies();

  const typetheology = await fetch(`${process.env.NEXT_PUBLIC_URL}api/revalidates/typeTheology`, {
    headers: {
      cookie: cookieHeader.toString(),
    },
    next: { tags: ['type-theology'] },
  }).then(async res => {
    if (!res.ok) {
      console.error(res.statusText);
      return;
    }
    return await res.json() as Promise<Theology>;
  });

  if (!typetheology?.data.type_theology) {
    return NextResponse.json({ error: 'Você precisa selecionar uma Teologia!' }, { status: 401 });
  }

  const theology = typetheology.data.type_theology;

  try {
    if (!session?.user?.id) {
      redirect('/');
      // return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }
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
    const rate = await limitRatePremium(session.user.id);

    if (rate.error) {
      return NextResponse.json({
        error: `Você atingiu o limite de 10 requisições. Tente novamente em ${formatSecond(rate.ttl)}.`,
      }, { status: 429 });
    }

    // Adiciona tarefa na fila
    await addJobToQueue({
      messageUser,
      type_theology: theology,
      userId: session.user.id,
      perguntaHash
    });

    // Separa cliente somente para subscribe
    const subscriber = new Redis("rediss://default:AWxAAAIjcDFjZjZkMzUwZDNiZTc0OGJhYTBjMDNiN2YzZmUyNjQyZnAxMA@desired-rhino-27712.upstash.io:6379");
    const stream = new ReadableStream({
      async start(controller) {
        await subscriber.subscribe(`resposta:${perguntaHash}`);

        subscriber.on('message', (_channel, message) => {
          try {
            controller.enqueue(new TextEncoder().encode(message));
            // ✅ Só fecha se o conteúdo for completo ou se usar "[DONE]"
            if (message.includes('[DONE]')) {
              controller.close();
              subscriber.disconnect();
            }
          } catch (err) {
            console.error('Erro ao enviar chunk:', err);
            controller.error(err);
            subscriber.disconnect();
          }
        });

        subscriber.on('error', (err) => {
          console.error("Erro no Redis:", err);
          controller.error(err);
          subscriber.disconnect();
        });
      },
      cancel() {
        subscriber.disconnect();
      }
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked', // ajuda proxies a manter o stream
      }
    });

  } catch (error) {
    console.error("Erro no endpoint POST:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}