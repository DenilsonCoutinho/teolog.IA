'use client'

import { useState, useEffect } from 'react'

import {
  Editor,
  EditorState,
  ContentState,
  convertFromHTML,
} from 'draft-js'

interface Devotional {
  id: String
  content: String // conteúdo em HTML
}

export interface BibleBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

export default function Devotional({ devotional }: { devotional: { content: string } }) {
  const [erro, setErro] = useState<string | null>(null)
  const [editorState, setEditorState] = useState(EditorState.createEmpty())

  // Carrega conteúdo inicial do devocional
  useEffect(() => {

    // fetch(`/api/generateDevotional` )
    if (devotional?.content) {
      const blocksFromHTML = convertFromHTML(devotional.content)
      const content = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      )
      setEditorState(EditorState.createWithContent(content))
    }
  }, [devotional])

  return (
    <div className='m-10'>
      <h1 className='md:text-3xl text-black dark:text-white font-bold'>Devocional diário</h1>

      <div className='mt-10'>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          readOnly={true}
        />
      </div>

      {erro && <p className="text-red-500 mt-4">{erro}</p>}
    </div>
  )
}
