import { ResDevotionalIa } from "../entities/resDevotional"

export type devotionalBibleRepo = {
    create: (date: Date) => Promise<ResDevotionalIa | null| Error>
    findByDate: (date: Date) => Promise<ResDevotionalIa | null>
}
