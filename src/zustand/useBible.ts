import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PropsChapters = {
    number: number;
}
type bibleStore = {
    selectNameBook: string
    selectChapter: PropsChapters[] | null
    selectTextBookBible: string[][]
    selectNumberChapter: number,
    hasHydrated: boolean
    setSelectNameBook: (namebook: string) => void
    setSelectChapter: (number: PropsChapters[] | null) => void
    setSelectTextBookBible: (texts: string[][]) => void
    setSelectNumberChapter: (chapter: number) => void
    setHasHydrated: (value: boolean) => void

}

type bibleTestStore = {
    selectNameBookTest: string
    selectChapterTest: PropsChapters[] | null
    selectTextBookBibleTest: string[][]
    selectNumberChapterTest: number,
    hasHydrated: boolean
    setSelectNameBookTest: (namebook: string) => void
    setSelectChapterTest: (number: PropsChapters[] | null) => void
    setSelectTextBookBibleTest: (texts: string[][]) => void
    setSelectNumberChapterTest: (chapter: number) => void
    setHasHydrated: (value: boolean) => void
}


export const useBibleStore = create<bibleStore>()(
    persist(
        (set) => ({
            selectNameBook: '',
            selectChapter: null,
            selectTextBookBible: [],
            selectNumberChapter: 0,
            hasHydrated: false,
            setHasHydrated: (value) => set({ hasHydrated: value }),
            setSelectNameBook: (nameBook) => set({ selectNameBook: nameBook }),
            setSelectChapter: (number) => set({ selectChapter: number }),
            setSelectTextBookBible: (texts: string[][]) => set({ selectTextBookBible: texts }),
            setSelectNumberChapter: (number) => set({ selectNumberChapter: number })
        }),
        {
            name: 'bible-storage', // localStorage: question-storage
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
              },
        }
    )
)


export const useBibleTestStore = create<bibleTestStore>()(
    persist(
        (set) => ({
            selectNameBookTest: '',
            selectChapterTest: [{ number: 0 }],
            selectTextBookBibleTest: [],
            selectNumberChapterTest: 0,
            hasHydrated: false,
            setHasHydrated: (value) => set({ hasHydrated: value }),
            setSelectNameBookTest: (nameBook) => set({ selectNameBookTest: nameBook }),
            setSelectChapterTest: (number) => set({ selectChapterTest: number }),
            setSelectTextBookBibleTest: (texts: string[][]) => set({ selectTextBookBibleTest: texts }),
            setSelectNumberChapterTest: (number) => set({ selectNumberChapterTest: number })
        }),
        {
            name: 'bible-test-storage', // localStorage: question-storage
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
              },
        }
    )
)