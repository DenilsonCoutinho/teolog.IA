'use client'

import { useState, useEffect, useTransition } from 'react'
import logo from '@/assets/logo-teologia-white.svg'

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
    const [erro, setErro] = useState<string | null>(null)
    const [editorState, setEditorState] = useState(EditorState.createEmpty())
    const [isPending, startTransition] = useTransition()
    const { innerHeight } = useResize()

    useEffect(() => {
        startTransition(async () => {
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


            await fetchContentDevotional()
        })
    }, [])

    return (
        <div className='m-10 w-full'>
            {!isPending && <h1 className='md:text-3xl text-black dark:text-white font-bold'>Devocional diário</h1>}

            {isPending ?
                <div className='w-full flex justify-center items-center'>
                    <div style={{ height: `${innerHeight - 130}px` }} className=''>
                        <div className=' h-full flex flex-col justify-center items-center'>
                            <Image src={logo} alt='logo' width={200} />
                            <DualRingSpinnerLoader />
                        </div>
                    </div>
                </div>
                : <div className='mt-10'>
                    <Editor
                        editorState={editorState}
                        onChange={setEditorState}
                        readOnly={true}
                    />
                </div>}

            {erro && <p className="text-red-500 mt-4">{erro}</p>}
        </div>
    )
}
