'use client'

import { useState, useEffect } from 'react'
import logo from '@/assets/logo-teologia-2.svg'
import logo_white from '@/assets/logo-teologia-white.svg'

import {
    Editor,
    EditorState,
    ContentState,
    convertFromHTML,
} from 'draft-js'
import { getContentDevotional } from '../../../../service/getContentDevotional'
import Image from 'next/image'
import DualRingSpinnerLoader from '@/app/components/ui/DualRingSpinnerLoader'
import { useResize } from '../../../../context/triggerResizeContext'
import { useBibleStore } from '@/zustand/useBible'
import { useTheme } from 'next-themes'

interface Devotional {
    id: String
    content: String // conteúdo em HTML
}

export interface BibleBook {
    abbrev: string;
    name: string;
    chapters: string[][];
}

export default function Devotional() {
    const [editorState, setEditorState] = useState(EditorState.createEmpty())
    const { innerHeight } = useResize()
    const [loading, setLoading] = useState(true)
    const { setLoadingLayout, loadingLayout } = useBibleStore()
        const { resolvedTheme } = useTheme()
    
    useEffect(() => {
        async function fetchContentDevotional() {
            const devotional = await getContentDevotional()
            if (devotional.content) {
                const blocksFromHTML = convertFromHTML(devotional.content)
                const content = ContentState.createFromBlockArray(
                    blocksFromHTML.contentBlocks,
                    blocksFromHTML.entityMap
                )
                setEditorState(EditorState.createWithContent(content))
            }
        }

        fetchContentDevotional()
        setLoading(false)
        setLoadingLayout(false)
    }, [])
     if (loading || loadingLayout) {
        return <div className='w-full flex justify-center items-center'>
            <div style={{ height: `${innerHeight - 130}px` }} className=''>
                <div className=' h-full flex flex-col justify-center items-center'>
                    <Image src={resolvedTheme === "dark" ? logo_white : logo} alt='logo' />

                    <DualRingSpinnerLoader />
                </div>
            </div>
        </div>
    }

    return (
        <div className='md:m-10 mt-10 mr-5 w-full'>
            <h1 className='md:text-3xl text-2xl text-black dark:text-white font-bold'>Devocional diário</h1>
            <div style={{ height: `${innerHeight - 130}px` }} className='bgre mt-10 overflow-hidden overflow-y-auto shadow-md rounded-lg'>
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    readOnly={true}
                />
            </div>
        </div>
    )
}
