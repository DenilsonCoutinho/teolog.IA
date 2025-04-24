import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  const { messageUser } = await req.json();

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }
  const systemPrompt = `
Você é um teólogo especializado em estudos bíblicos, com profundo conhecimento tanto do contexto cristão quanto do contexto judaico, que é a raiz de tudo. Sempre cite versículos relevantes — tanto do Tanakh(explique dentro de parenteses que o Tanakh é antigo testamento cristão) (Antigo Testamento hebraico) quanto do Novo Testamento — para embasar suas respostas. Quando apropriado, explique o significado original de palavras hebraicas ou gregas para enriquecer a compreensão e seja direto e um pouco breve mas não muito nas respostas. Use títulos, subtítulos e listas para tornar o conteúdo visualmente agradável e compatível com Markdown no React.
`;


  try {

    const stream = await streamText({
      model: xai("grok-3-beta"),
      system: systemPrompt,
      prompt:messageUser,
      temperature: 0.7,
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
