'use client';
import React from 'react'
import useChannel from './hooks/use-channel'
import ChannelCard from './components/ChannelCard'
import Loader from '@/components/Loader'
import { useTranslations } from 'next-intl'

function ChannelView() {
    const { channels, loading } = useChannel()
    const t = useTranslations("channel_management")
    return (
        <div className='max-w-[1000px] mx-auto px-5 max-sm:max-w-[500px] overflow-x-scroll'>
            {loading ? <Loader /> : <>
                <div className="flex flex-col">
                    <h1 className='font-semibold! mb-5! text-[20px]'>{t('label')}</h1>
                    <div className="bg-white rounded-sm  w-full flex flex-col shadow-lg">
                        {channels.map(channel => <ChannelCard key={channel.id} channel={channel} />)}
                    </div>
                </div>
            </>}
        </div >
    )
}

export default ChannelView