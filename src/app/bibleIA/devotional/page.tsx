import Devotional from "./devotional"

export default async function DevotionalPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/devotionalToday`, {
    next: { tags: ['devotional-today'] },
  })

  const devotional = await res.json()
console.log(devotional)
  return (
    <Devotional devotional={devotional} />
  )
}
