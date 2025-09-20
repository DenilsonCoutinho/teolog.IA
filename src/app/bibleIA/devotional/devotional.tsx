'use client'

import logo from '@/assets/logo-teologia-2.svg'
import logo_white from '@/assets/logo-teologia-white.svg'

import { Editor } from 'draft-js'
import Image from 'next/image'
import DualRingSpinnerLoader from '@/app/components/ui/DualRingSpinnerLoader'

import { useDevotioanlViewModel } from './components/devotionalViewModel'

export default function Devotional() {

    const { loading, loadingLayout, editorState, setEditorState, innerHeight, resolvedTheme } = useDevotioanlViewModel()

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
