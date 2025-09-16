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
            try {
                const devotional = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/generateDevotional`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    next: { tags: ['devotional'] },

                })
                const contentType = devotional.headers.get("content-type") || "";
                if (!contentType.includes("application/json") && devotional?.body) {
                    const reader = devotional.body.getReader();
                    const decoder = new TextDecoder();
                    let fullResponse = "";

                    while (true) {
                        setLoading(false)
                        setLoadingLayout(false)
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        fullResponse += chunk;
                        const blocksFromHTML = convertFromHTML(fullResponse)
                        const content = ContentState.createFromBlockArray(
                            blocksFromHTML.contentBlocks,
                            blocksFromHTML.entityMap
                        )
                        setEditorState(EditorState.createWithContent(content))
                    }
                    setLoading(false)
                    setLoadingLayout(false)
                    return
                }
                const data = await devotional.json()
                const devotionalData = data as string
                if (devotionalData) {
                    const blocksFromHTML = convertFromHTML(data)
                    const content = ContentState.createFromBlockArray(
                        blocksFromHTML.contentBlocks,
                        blocksFromHTML.entityMap
                    )
                    setEditorState(EditorState.createWithContent(content))
                }
                setLoading(false)
                setLoadingLayout(false)
            } catch (error: unknown) {
                alert(error)
            }

        }

        fetchContentDevotional()
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
