// app/api/devotional/today/route.ts
import { NextResponse } from 'next/server'
import { redis } from '../../../../actions/limitRate' 
import { db as prisma } from '@/lib/db'
import OpenAI from 'openai'
import { revalidateTag } from 'next/cache'

const DEVOTIONAL_TTL = 86400  // 24h

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY_DEVOTIONAL || '',
  baseURL: 'https://api.x.ai/v1',
})

const livros = [
  'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Josué', 'Juízes',
  'Rute', '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crônicas', '2 Crônicas',
  'Esdras', 'Neemias', 'Ester', 'Jó', 'Provérbios', 'Eclesiastes',
  'Lamentações', 'Ezequiel', 'Daniel', 'Joel', 'Amós', 'Obadias', 'Jonas',
  'Miquéias', 'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias'
]

const livroEscolhido = livros[Math.floor(Math.random() * livros.length)]

const systemPrompt = `
Você é um teólogo cristão que escreve devocionais bíblicos com profundidade, fidelidade ao texto original e aplicação prática para o leitor moderno.

Sua tarefa é gerar um devocional baseado em **um versículo bíblico aleatório do livro de ${livroEscolhido}**, que você mesmo irá escolher. Nunca misture outros textos ou versículos. Concentre-se exclusivamente no que o versículo e seu contexto imediato dizem. Evite isolar versículos: sempre explique-os dentro do parágrafo ou capítulo em que se encontram.
Não cite a tradução bíblica.

Inclua:
- Um título atraente para o devocional.
- Explicação clara do texto bíblico, respeitando o contexto.
- Palavras originais em hebraico ou grego, quando relevantes, explicadas de forma simples.
- Aplicações práticas e sinceras para a vida cristã real.
- Reflexões pastorais, mas sem jargões evangélicos ou frases prontas.
- Sugestões de oração e meditação.

Formate sua resposta com HTML compatível com Draft.js, usando apenas:

<h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <a href="...">, <br>

Todas as tags devem estar bem formadas. Nenhuma classe CSS deve ser usada. Use a estrutura semântica para guiar o leitor.

Limite-se a 800 palavras. Foque em clareza, teologia bíblica e aplicação fiel.
`


export async function GET() {
const REDIS_KEY = `devotional:${new Date().toISOString().slice(0, 10)}`
  try {
    // Primeiro tenta do Redis
    const cached = await redis.get(REDIS_KEY) as string | null
    // console.log(cached)
    if (cached) {
      return NextResponse.json(cached)
    }

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Verifica no banco se já existe
    const existing = await prisma.devotional.findUnique({
      where: { date: today },
    })

    if (existing) {
      await redis.set(REDIS_KEY, existing, { ex: DEVOTIONAL_TTL })
      return NextResponse.json(existing)
    }

    // Se não existe, gera com a IA
    const userPrompt = `Escolha um versículo bíblico aleatório e gere um devocional profundo e prático baseado nele.`

    const result = await client.chat.completions.create({
      model: 'grok-3-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    })

    const content = result.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'IA não retornou conteúdo.' }, { status: 500 })
    }

    let devotionalData
    try {
      devotionalData = content
    } catch {
      return NextResponse.json({ error: 'Erro ao interpretar JSON da IA.' }, { status: 500 })
    }

    // Salva no banco
    const saved = await prisma.devotional.create({
      data: {
        content: devotionalData,
        date: today,
      },
    })

    // Salva no Redis e revalida cache
    await redis.set(REDIS_KEY, saved, { ex: DEVOTIONAL_TTL })
    revalidateTag('devotional')

    return NextResponse.json(saved)
  } catch (error) {
    console.error('[DEVOTIONAL ERROR]', error)
    return NextResponse.json({ error: 'Erro ao gerar devocional' }, { status: 500 })
  }
}
