import { devotionalBibleRepo } from "../repositories/devotionalBibleRepo";

export async function FindDevotionalIaUseCase(
    repo: devotionalBibleRepo,
    date: Date,
) {

    const res = await repo.findByDate(
        date
    )
    return res
}