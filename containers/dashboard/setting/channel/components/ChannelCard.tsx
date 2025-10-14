'use client';
import { TChannelResponse } from '@/types/response/channel'
import { Button, Tooltip } from 'antd'
import { Link2 } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useTranslations } from 'use-intl'
import useChannel from '../hooks/use-channel'

interface ChannelCardProps {
    channel: TChannelResponse
}
function ChannelCard({ channel }: ChannelCardProps) {
    const t = useTranslations('channel_management')
    const { installChannel, installLoading, removePublication } = useChannel()

    return (
        <div className='w-full bg-white hover:bg-gray-100 hover:cursor-pointer flex items-center justify-between py-3 border-b border-gray-100 px-4 gap-2'>
            <div className="">
                <Image src={channel.image_url} alt={channel.name} width={40} height={40} className='rounded-md' />
            </div>
            <div className="flex flex-col flex-1">
                <h3 className='!font-medium !mb-0'>{channel.name}</h3>
                <p className='text-[14px]'>{channel.description}</p>
            </div>

            {channel.installed ? <Tooltip title={t("remove_channel")}>
                <Button type="text" className="text-white !z-50" loading={installLoading} onClick={() => removePublication(channel.id)}>
                    <Link2 />
                </Button>
            </Tooltip> : <Button className="button-primary" loading={installLoading} onClick={() => installChannel(channel.id)}>
                <span>{t("add_channel")}</span>   </Button>}
        </div>
    )
}

export default ChannelCard