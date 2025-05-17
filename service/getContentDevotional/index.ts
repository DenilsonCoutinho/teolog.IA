export async function getContentDevotional() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generateDevotional`, {
    next: { tags: ['devotional'] },
  })

  const data = await res.json()

  const devotional = data as { content: string, id: string }
  return devotional
}
