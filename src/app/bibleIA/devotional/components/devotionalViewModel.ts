'use client'
import { useBibleStore } from '@/zustand/useBible'
import { useState, useEffect } from 'react'
import {
    EditorState,
    ContentState,
    convertFromHTML,
} from 'draft-js'
import { fetchDevocional } from './devotionalModel'
import { useResize } from '../../../../../context/triggerResizeContext'
import { useTheme } from 'next-themes'

export function useDevotioanlViewModel() {
    const { innerHeight } = useResize()
    const { resolvedTheme } = useTheme()
    const [loading, setLoading] = useState<boolean>(true)
    const [response, setReponse] = useState<string>('')
    const { setLoadingLayout, loadingLayout } = useBibleStore()
    const [editorState, setEditorState] = useState(EditorState.createEmpty())

    useEffect(() => {
        async function fetchDevotional() {

            try {
                const devotional = await fetchDevocional()
                const contentType = devotional.headers.get("content-type") || "";
                
                //verifica se é stream ou apenas um json normal
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
                    setReponse(fullResponse)

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
                    setReponse(devotionalData)
                    setLoading(false)
                    setLoadingLayout(false)

                }
            } catch (error: unknown) {
                alert(error)
            }
        }
        fetchDevotional()
    }, [])

    return { loading, loadingLayout, response, editorState, setEditorState, innerHeight, resolvedTheme }
}