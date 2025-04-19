// pages/api/biblia.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY, // This is the default and can be omitted
  baseURL: "https://api.x.ai/v1",
});

export async function POST(req: NextRequest) {

  const { messageUser } = await req.json();

  if (!messageUser || typeof messageUser !== 'string') {
    return NextResponse.json({ error: 'Pergunta inválida' });
  }

  try {

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: "Você é um teólogo especializado em estudos bíblicos e seu trabalho é responder a perguntas com base na Bíblia. Ao responder, forneça versículos bíblicos relevantes para apoiar suas respostas sempre que possível. Por favor, formate suas respostas de forma atraente e fácil de ler, utilizando títulos, subtítulos, listas e links para versículos bíblicos, de modo que possa ser facilmente renderizado em Markdown no React. Certifique-se de que suas respostas sejam claras, concisas e fáceis de entender." },
        { role: "user", content: messageUser }
      ],
      model: "grok-3-beta",
    });

    console.log(response)
    return NextResponse.json({ res: response });
  } catch (error) {
    console.error('[ Error]', error);
    return NextResponse.json({ error: 'Erro ao se comunicar com a OpenAI' });
  }
}
