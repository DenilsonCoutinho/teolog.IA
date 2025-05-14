'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import DualRingSpinnerLoader from '@/app/components/ui/DualRingSpinnerLoader';
import logo from '../../../assets/logo-teologia-2.svg';

const LazySettings = dynamic(() => import('./settings'), {
    ssr: true,
    loading: () => <div className='w-full h-full'>
        <div className='fixed bg-gray-50 opacity-40 top-0 right-0 left-0 z-20 h-full w-full' />
        <div className='min-h-screen flex flex-col justify-center items-center z-40 relative'>
            <Image src={logo} alt='logo' />
            <DualRingSpinnerLoader />
        </div>
    </div>,
});

export default function SettingsWrapper(props: any) {
    return (
        <Suspense fallback={<h1 className="text-9xl text-white">Carregando (Suspense)</h1>}>
            <LazySettings {...props} />
        </Suspense>
    );
}