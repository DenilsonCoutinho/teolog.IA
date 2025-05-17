// app/api/devotional/route.ts
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { db as prisma } from '@/lib/db'

export async function GET() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0) // use UTC para zero horas

  revalidateTag('devotional-today')

  const devotional = await prisma.devotional.findUnique({
    where: { date: today },
  })

  if (!devotional) {
    return NextResponse.json({ error: 'Devocional não encontrado' }, { status: 404 })
  }

  return NextResponse.json(devotional)
}

