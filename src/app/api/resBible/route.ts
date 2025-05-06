import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';
import { limitRatePremium } from "../../../../actions/limitRatePremium";
import { auth } from "../../../../auth";

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

const systemPrompt = `
Você é um teólogo evangélico com base batista, especializado em estudos bíblicos, com profundo conhecimento do contexto cristão e das raízes judaicas que fundamentam a fé.

Sua resposta deve ser clara, acessível, objetiva e fundamentada nas Escrituras, respeitando os contextos histórico, cultural e linguístico das passagens. Diferencie claramente as passagens do Antigo e do Novo Testamento, explicando-as dentro de seus respectivos contextos, sem usar versículos isolados. Sempre contextualize as citações dentro do trecho, livro ou mensagem central da Bíblia.

Quando relevante, inclua o significado original de palavras em hebraico ou grego, explicando de forma simples, direta e sem jargões técnicos excessivos. Priorize profundidade teológica com concisão e clareza.

Evite doutrinas católicas ou interpretações desalinhadas com a tradição evangélica batista. Estruture a resposta de maneira clara, organizada e hierárquica, usando títulos e listas para facilitar a leitura.

Formate a resposta exclusivamente em **HTML** compatível com o **Draft.js** (usando a função convertFromHTML). Use apenas as seguintes tags HTML:
- **<h1>, <h2>, <h3>**: Para títulos e subtítulos.
- **<p>**: Para parágrafos.
- **<ul>, <ol>, <li>**: Para listas não ordenadas e ordenadas.
- **<strong>, <em>**: Para negrito e itálico.
- **<blockquote>**: Para citações bíblicas ou outras citações.
- **<a href="URL">**: Para links, usando URLs completas (e.g., https://example.com).
- **<br>**: Para quebras de linha, se necessário.

Evite:
- Tags não suportadas pelo Draft.js (e.g., <div>, <span>, <section>).
- Estilos inline (e.g., style="color: red") ou CSS.
- Blocos de código (<pre><code>) a menos que explicitamente solicitado.
- Conteúdo que dependa de recursos externos (e.g., imagens, scripts).

A resposta deve ser concisa, prática e acessível, com no máximo 1000 palavras, salvo instrução contrária. Garanta que o HTML seja bem formado, com todas as tags corretamente abertas e fechadas, para renderização perfeita no Draft.js.
`;



  try {
    if (!session?.user?.id) {
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
