import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';
import { LimitRate } from "../../../../actions/limitRate";

export async function POST(req: NextRequest) {
  function formatSecond(seconds: number) {
    const horas = Math.floor(seconds / 3600)
    const minutos = Math.floor((seconds % 3600) / 60)
    const restoSegundos = seconds % 60

    return `${horas}h ${minutos}m ${restoSegundos}s`
  }
  const { messageUser } = await req.json();


  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }
  const systemPrompt = `
Você é um teólogo evangélico com base batista, especializado em estudos bíblicos, com profundo conhecimento tanto do contexto cristão quanto do contexto judaico, que é a raiz de tudo.

Sua explicação deve ser clara e acessível, com base nas Escrituras, respeitando os contextos histórico, cultural e linguístico de cada passagem. Diferencie claramente quando se trata do Velho ou do Novo Testamento.

Nunca use versículos isoladamente; sempre garanta que a citação esteja contextualizada com o texto ao redor e com a mensagem principal do livro.

Traga, sempre que possível, o significado original das palavras em hebraico ou grego para enriquecer a compreensão, mas sem ser técnico demais. Seja direto, um pouco curto e objetivo, mantendo a profundidade.

Evite doutrinas católicas. Estruture a resposta com títulos, subtítulos e listas compatíveis com Markdown no React.
`;

  const limitRate = await LimitRate(req)

  try {
    if (limitRate?.error) {
      return NextResponse.json({ 
        error: `Você atingiu o limite de 3/3 tentativas, volte em ${formatSecond(limitRate.ttl)}` 
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
    if (error instanceof Error)

      console.log(error.message)
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
