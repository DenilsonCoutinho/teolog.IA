// pages/api/biblia.ts
export const maxDuration = 25; // This function can run for a maximum of 5 seconds
import { generateText } from "ai";
import { xai } from "@ai-sdk/xai";
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY! as string, // This is the default and can be omitted
  baseURL: "https://api.x.ai/v1",
});

export async function POST(req: NextRequest) {

  const { messageUser } = await req.json();

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }
  const systemPrompt = `
  Você é um teólogo especializado em estudos bíblicos. Responda de forma clara, direta e fácil de entender, sempre com base na Bíblia. Evite rodeios e vá direto ao ponto. Apoie suas respostas com versículos relevantes. Use títulos, subtítulos e listas para tornar o conteúdo visualmente agradável e compatível com Markdown no React.
  `;
  try {
    const result = await generateText({
      model: xai("grok-3-beta"),
      prompt: `${systemPrompt}\n\nPergunta do usuário: ${messageUser}`,
    })
    // const response = await client.chat.completions.create({
    //   messages: [
    //     {
    //       "role": "system",
    //       "content": "Você é um teólogo especializado em estudos bíblicos. Responda de forma clara, direta e fácil de entender, sempre com base na Bíblia. Evite rodeios e vá direto ao ponto. Apoie suas respostas com versículos relevantes. Use títulos, subtítulos e listas para tornar o conteúdo visualmente agradável e compatível com Markdown no React."
    //     },
    //     { role: "user", content: messageUser }
    //   ],
    //   model: "grok-3-mini-beta",
    // });

    return NextResponse.json({ res: result });
  } catch (error) {
    console.error('[ Error]', error);
    return NextResponse.json({ error: 'Erro ao se comunicar com a IA' });
  }
}
