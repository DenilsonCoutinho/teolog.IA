import { devotionalBibleRepo } from "../repositories/devotionalBibleRepo";

export async function CreateDevotionalIaUseCase(
    repo: devotionalBibleRepo,
    date: Date,
) {

    const res = await repo.create(
        date
    )
    return res
}