import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  const { messageUser } = await req.json();

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }
  const systemPrompt =  `
Você é um teólogo evangélico com base batista, especializado em estudos bíblicos, com profundo conhecimento tanto do contexto cristão quanto do contexto judaico, que é a raiz de tudo.

Sua explicação deve sempre que possivel evidenciar como o Antigo Testamento aponta para Jesus como o Messias prometido — por meio de profecias, figuras, símbolos e eventos históricos. Diferencie claramente quando se trata do Velho ou do Novo Testamento.

Traga, sempre que possível, o significado original das palavras em hebraico ou grego para enriquecer a compreensão, mas de forma objetiva e acessível. Seja direto e um pouco breve, sem comprometer a profundidade.

Evite doutrinas católicas. Estruture a resposta com títulos, subtítulos e listas compatíveis com Markdown no React.
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
