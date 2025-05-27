import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PropsChapters = {
    number: number;
}
type bibleStore = {
    selectNameBook: string | undefined
    loadingLayout: boolean | null
    openSideBar: boolean | null
    selectTranslation: string
    selectChapter: PropsChapters[] | null
    selectTextBookBible: string[][]
    selectNumberChapter: number,
    hasHydrated: boolean
    isNewUser: boolean | null
    setSelectNameBook: (namebook: string | undefined) => void
    setSelectTranslation: (namebook: string) => void
    setSelectChapter: (number: PropsChapters[] | null) => void
    setSelectTextBookBible: (texts: string[][]) => void
    setSelectNumberChapter: (chapter: number) => void
    setHasHydrated: (value: boolean) => void
    setLoadingLayout: (value: boolean) => void
    setOpenSideBar: (value: boolean) => void
    setIsNewUser: (value: boolean| null) => void

}



export const useBibleStore = create<bibleStore>()(
    persist(
        (set) => ({
            isNewUser: true,
            loadingLayout: null,
            selectNameBook: 'Gênesis',
            selectTranslation: '',
            selectChapter: null,
            selectTextBookBible: [],
            selectNumberChapter: 0,
            hasHydrated: false,
            openSideBar: false,
            setIsNewUser: (value) => set({ isNewUser: value }),
            setOpenSideBar: (value) => set({ openSideBar: value }),
            setHasHydrated: (value) => set({ hasHydrated: value }),
            setLoadingLayout: (value) => set({ loadingLayout: value }),
            setSelectNameBook: (nameBook) => set({ selectNameBook: nameBook }),
            setSelectChapter: (number) => set({ selectChapter: number }),
            setSelectTextBookBible: (texts: string[][]) => set({ selectTextBookBible: texts }),
            setSelectNumberChapter: (number) => set({ selectNumberChapter: number }),
            setSelectTranslation: (translation) => set({ selectTranslation: translation })
        }),
        {
            name: 'bible-storage',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true)
            },
        }
    )
)
