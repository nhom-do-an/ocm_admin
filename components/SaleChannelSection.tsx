import React from 'react'
import { CirclePlus } from 'lucide-react'
import { Tooltip } from 'antd'
import { useAppRouter } from '@/app/hooks/useAppReouter'
import { SCREEN } from '@/constants/constant'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import Image from 'next/image'

interface SalesChannelSectionProps {
    collapsed?: boolean
}

const SalesChannelSection: React.FC<SalesChannelSectionProps> = ({ collapsed }) => {
    const router = useAppRouter()
    const { publications } = useGlobalContext()

    const getChannelLink = (alias: string) => {
        switch (alias) {
            case 'website':
                return process.env.NEXT_PUBLIC_WEBSITE_URL || '#'
            case 'pos':
                return process.env.NEXT_PUBLIC_POS_URL || '#'
            default:
                return '#'
        }
    }

    const handleAddChannel = () => {
        router.push(SCREEN.CHANNEL_MANAGEMENT.PATH)
    }

    const handleChannelClick = (channelAlias: string) => {
        const link = getChannelLink(channelAlias);
        if (link !== '#') {
            window.open(link, '_blank');
        } else {
            router.push(link)
            console.warn('No link available for this channel');
        }
    }

    if (collapsed) {
        return (
            <div className="px-2 pl-3 py-3 border-t border-white/10">
                <Tooltip title="Thêm kênh bán hàng" placement="right">
                    <div
                        onClick={handleAddChannel}
                        className="flex items-center justify-center p-2 mb-2 hover:bg-white/10 rounded cursor-pointer transition-colors"
                    >
                        <CirclePlus size={20} className="text-white/80" />
                    </div>
                </Tooltip>

                <div className="space-y-2">

                    {publications && publications.map((channel) => (
                        <Tooltip key={channel.id} title={channel.channel_name} placement="right">
                            <div
                                onClick={() => handleChannelClick(channel.channel_alias)}
                                className="flex items-center justify-center p-2 hover:bg-white/10 rounded cursor-pointer transition-colors"
                            >
                                <Image
                                    src={channel.channel_image_url}
                                    alt={channel.channel_name}
                                    width={30}
                                    height={30}
                                />
                            </div>
                        </Tooltip>
                    ))
                    }

                </div>
            </div>
        )
    }

    // Hiển thị khi sidebar mở (expanded)
    return (
        <div className="px-4 py-3 border-t border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-white/60 text-sm font-medium">Kênh bán hàng</span>
                <div
                    onClick={handleAddChannel}
                    className="flex items-center justify-center w-6 h-6 hover:bg-white/10 rounded cursor-pointer transition-colors"
                    title="Thêm kênh bán hàng"
                >
                    <CirclePlus size={22} className="text-white/80" />
                </div>
            </div>


            <div className="space-y-2 px-1">

                {publications && publications.map((channel) => (
                    <div
                        key={channel.id}
                        onClick={() => handleChannelClick(channel.channel_alias)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded cursor-pointer transition-colors group"
                    >
                        <Image
                            src={channel.channel_image_url}
                            alt={channel.channel_name}
                            width={30}
                            height={30}
                        />
                        <span className="text-white/80 text-sm truncate group-hover:text-white">
                            {channel.channel_name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SalesChannelSection