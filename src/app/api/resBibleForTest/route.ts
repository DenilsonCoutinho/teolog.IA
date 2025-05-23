import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';
import { LimitRate } from "../../../../actions/limitRate";
import Redis from "ioredis";
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
  const redisClient = new Redis("rediss://default:AWxAAAIjcDFjZjZkMzUwZDNiZTc0OGJhYTBjMDNiN2YzZmUyNjQyZnAxMA@desired-rhino-27712.upstash.io:6379");


  const lockKey = `lock:${perguntaHash}`;
  const lock = await (redisClient.set as any)(lockKey, "locked", "NX", "EX", 20);

  if (!lock) {
    // Alguém já está gerando essa resposta
    return NextResponse.json({
      message: "Essa pergunta já está sendo processada por outro usuário. Aguarde alguns segundos para ver a resposta pronta.",
    }, { status: 202 });
  }


  try {
    // const existing = await prisma.sharedResponse.findUnique({
    //       where: { perguntaHash }
    //     });
    //     if (existing) {
    //       if (existing.status === "pending") {
    //         // Resposta ainda em processamento, pode retornar um status 202 (Accepted)
    //         return NextResponse.json({ message: "Resposta em processamento, aguarde..." }, { status: 202 });
    //       } else {
    //         // Resposta pronta, retorna direto
    //         return NextResponse.json({ htmlContent: existing.htmlContent });
    //       }
    //     } else {
    //       // Cria registro pendente
    //       await prisma.sharedResponse.create({
    //         data: {
    //           userId: userId,
    //           perguntaHash,
    //           status: "pending",
    //           teologia: theology,
    //         }
    //       });
    //     }

    const existingOrCreated = await prisma.sharedResponse.upsert({
      where: { perguntaHash },
      update: {}, // não atualiza nada caso já exista
      create: {
        userId,
        perguntaHash,
        status: "pending",
        teologia: theology,
      },
    });

    const isNewlyCreated = !existingOrCreated.createdAt ||
      (Date.now() - new Date(existingOrCreated.createdAt).getTime()) < 2000; // 2 segundos

    if (existingOrCreated.status === "pending") {
      if (isNewlyCreated) {
        // Criou agora: libera para adicionar job na fila
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
      } else {
        // Já existe pendente, retorna direto aguardando
        return NextResponse.json(
          { message: "Resposta em processamento, volte em 1 minuto." },
          { status: 202 }
        );
      }
    }
  } catch (error) {

    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
