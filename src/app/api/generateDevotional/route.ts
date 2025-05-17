// app/api/devotional/today/route.ts
import { NextResponse } from 'next/server'
import { db as prisma } from '@/lib/db'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY_DEVOTIONAL || '',
  baseURL: 'https://api.x.ai/v1',
})

const systemPrompt = `
Você é um teólogo cristão que escreve devocionais bíblicos com profundidade, fidelidade ao texto original e aplicação prática para o leitor moderno.

Sua tarefa é gerar um devocional baseado em **um único versículo bíblico aleatório**, que você mesmo irá escolher. Nunca misture outros textos ou versículos. Concentre-se exclusivamente no que o versículo e seu contexto imediato dizem. Evite isolar versículos: sempre explique-os dentro do parágrafo ou capítulo em que se encontram.

Inclua:
- Um título atraente para o devocional.
- Explicação clara do texto bíblico, respeitando o contexto.
- Palavras originais em hebraico ou grego, quando relevantes, explicadas de forma simples.
- Aplicações práticas e sinceras para a vida cristã real.
- Reflexões pastorais, mas sem jargões evangélicos ou frases prontas.

Importante:
- A saída deve ser um JSON com a seguinte estrutura:

{
  "title": "Título do devocional",
  "htmlContent": "<h1>...</h1><p>...</p>..."
}

- O campo "htmlContent" deve conter HTML compatível com Draft.js, usando apenas estas tags:
  <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <a href="...">, <br>

- Nenhuma classe CSS deve ser usada.
- Todas as tags devem estar bem formadas.
- Limite máximo: 800 palavras.
- Não escreva nada fora do JSON.
`

export async function POST() {
  try {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Verifica se já existe devocional para hoje
    const existing = await prisma.devotional.findUnique({
      where: { date: today },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    // Prompt para gerar aleatoriamente um devocional
    const userPrompt = `Escolha um versículo bíblico aleatório e gere um devocional profundo e prático baseado nele.`

    const result = await client.chat.completions.create({
      model: 'grok-3-beta',
      messages: [
        { role: 'system', content: systemPrompt.trim() },
        { role: 'user', content: userPrompt.trim() },
      ],
      temperature: 0.7,
    })

    const content = result.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'A IA não retornou conteúdo.' }, { status: 500 })
    }

    let devotionalData: { title: string; htmlContent: string }

    try {
      devotionalData = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'Erro ao interpretar JSON retornado pela IA.' }, { status: 500 })
    }

    // Salva no banco (somente content e date, conforme sua model)
    const saved = await prisma.devotional.create({
      data: {
        content: devotionalData.htmlContent,
        date: today,
      },
    })

    return NextResponse.json(saved)
  } catch (error) {
    console.error('[DEVOTIONAL POST ERROR]', error)
    return NextResponse.json({ error: 'Erro ao gerar devocional' }, { status: 500 })
  }
}
