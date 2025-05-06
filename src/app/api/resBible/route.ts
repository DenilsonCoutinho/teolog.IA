import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';
import { limitRatePremium } from "../../../../actions/limitRatePremium";
import { auth } from "../../../../auth";
import { typetheology } from "@prisma/client";
import { systemPromptArminiana, systemPromptbatista, systemPromptPentecostal, systemPromptReformada } from "@/prompts/prompt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

  const { messageUser } = await req.json();
  const session = await auth()
  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }

  const cookieHeader = await cookies();

  const typetheology = await fetch("http://localhost:3000/api/revalidates/typeTheology", {
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
  const systemPrompt = theology === "BATISTA" ? systemPromptbatista :
    theology === "ARMINIANA" ? systemPromptArminiana :
      theology === "PENTECOSTAL" ? systemPromptPentecostal : systemPromptReformada

  try {
    if (!session?.user?.id) {
      redirect('/')
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
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

    const readableStream = new ReadableStream({
      async start(controller) {
        console.log(controller)
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
