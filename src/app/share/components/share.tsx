"use client"
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js';
import { useEffect, useState } from 'react';
import { HasAskExisting } from '../../../../service/getResExist';
import logo from '@/assets/logo-teologia-white.svg'
import Image from 'next/image';
import { useResize } from '../../../../context/triggerResizeContext';
import DualRingSpinnerLoader from '@/app/components/ui/DualRingSpinnerLoader';

import Link from "next/link"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function Share({ id }: { id: string }) {


    const { innerHeight } = useResize()
    const [loading, setLoading] = useState<boolean>(true);

    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
    async function getDataToShare() {
        const dataHasAskExisting = await HasAskExisting(id)
        if (dataHasAskExisting?.htmlContent) {
            const blocksFromHTML = convertFromHTML(dataHasAskExisting?.htmlContent);
            const contentState = ContentState.createFromBlockArray(
                blocksFromHTML.contentBlocks,
                blocksFromHTML.entityMap
            );
            setEditorState(EditorState.createWithContent(contentState));
        } else {
            setEditorState(EditorState.createEmpty());
        }
        setLoading(false)
    }
    useEffect(() => {

        getDataToShare()

    }, [])
    return <div className='bg-[#181818] w-full px-3 pt-4'>

        <div className='max-w-[900px] border border-gray-500 rounded-2xl p-4 m-auto space-y-4 bg'>
            {!loading && <div>
                <Breadcrumb className='pb-5'>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink className='text-white'>
                                <Link href="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className='text-white'>Compartilhar</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Image alt='logo' src={logo} />
            </div>}
            {
                loading ? <>
                    <div style={{ height: `${innerHeight - 130}px` }} className=''>
                        <div className=' h-full flex flex-col justify-center items-center'>
                            <Image src={logo} alt='logo' width={200} />
                            <DualRingSpinnerLoader />
                        </div>
                    </div>
                </>
                    :
                    <div style={{ height: `${innerHeight - 130}px` }} className=' rounded-2xl shadow-md overflow-hidden overflow-y-auto'>
                        <Editor
                            editorState={editorState}
                            onChange={setEditorState}
                            readOnly={true}
                        />
                    </div>
            }
        </div>
    </div>
}