"use server"
interface Devotional {
  id: String
  content: String // só o conteúdo do devocional em HTML
}
export async function generateDevotional(){
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}api/generateDevotional`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || 'Erro na requisição')
    }

    const data: Devotional = await res.json()
    return data
  } catch (error) {
    console.error('Erro ao gerar devocional:', error)
    return null
  }
}
