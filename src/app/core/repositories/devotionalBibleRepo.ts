export type devotionalBibleRepo = {
    create: (date: Date, content: string) => Promise< Error | void>
    findByDate: (date: Date) => Promise<string | undefined>
}
