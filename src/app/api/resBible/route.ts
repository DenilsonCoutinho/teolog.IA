import { generateText, streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {

  const { messageUser } = await req.json();

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }
  const systemPrompt = `
  Você é um teólogo especializado em estudos bíblicos. Apenas responda a perguntas relacionadas à Bíblia, com base nas Escrituras e Apenas responda o versiculo citado. Evite responder a questões fora desse tema. Seja claro, direto, breve efácil de entender, sempre citando versículos relevantes para embasar suas respostas. Use títulos, subtítulos e listas para tornar o conteúdo visualmente agradável e compatível com Markdown no React.
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
