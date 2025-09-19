export async function fetchDevocional() {
    const res = await fetch(`/api/generateDevotional`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        // next: { tags: ['devotional'] },
    })
      if (!res.ok) throw new Error("Erro ao atualizar tarefa")

    return res
}