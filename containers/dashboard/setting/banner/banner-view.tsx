'use client'

import React, { useState } from 'react'
import { Button, Card, Empty, Skeleton, Tag, Popconfirm } from 'antd'
import { ImageIcon, Plus, Trash2, Edit2 } from 'lucide-react'
import useBannerManagement from './hooks/use-banner-management'
import Loader from '@/components/Loader'
import BannerModal from './components/BannerModal'
import { CreateBannerRequest, UpdateBannerRequest } from '@/types/request/banner'
import { Banner } from '@/types/response/banner'
import Image from 'next/image'

const MAX_BANNERS = 3

const BannerManagementView: React.FC = () => {
    const { banners, loading, createLoading, updateLoading, deleteLoading, createBanner, updateBanner, deleteBanner } = useBannerManagement()
    const [isModalOpen, setModalOpen] = useState(false)
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)

    const handleBannerClick = (banner: Banner) => {
        setSelectedBanner(banner)
        setModalOpen(true)
    }

    const handleSubmit = async (values: CreateBannerRequest | UpdateBannerRequest) => {
        if ('id' in values && values.id) {
            await updateBanner(values.id, values)
        } else {
            await createBanner(values as CreateBannerRequest)
        }
        setModalOpen(false)
        setSelectedBanner(null)
    }

    const handleDelete = async (id: number) => {
        await deleteBanner(id)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader />
            </div>
        )
    }

    return (
        <div className="max-w-[1000px] mx-auto px-5 pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý Banner</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý các banner hiển thị trên trang web (tối đa {MAX_BANNERS} banner)</p>
            </div>

            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                    <div>
                        <p className="text-base font-semibold text-gray-900">Danh sách banner</p>
                        <p className="text-sm text-gray-500">Đã sử dụng {banners.length}/{MAX_BANNERS} banner</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        disabled={banners.length >= MAX_BANNERS}
                        onClick={() => {
                            setSelectedBanner(null)
                            setModalOpen(true)
                        }}
                    >
                        Thêm banner
                    </Button>
                </div>
                <div>
                    {loading ? (
                        <div className="py-10">
                            <Skeleton active />
                        </div>
                    ) : banners.length > 0 ? (
                        <div className="space-y-4">
                            {banners.map(banner => (
                                <div
                                    key={banner.id}
                                    className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center hover:border-gray-300 transition-colors"
                                >
                                    <div className="relative w-full md:w-48 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        {banner.image_url ? (
                                            <Image
                                                src={banner.image_url}
                                                alt={banner.description || 'Banner'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Tag color={banner.is_active ? 'success' : 'default'}>
                                                {banner.is_active ? 'Đang hiển thị' : 'Đã ẩn'}
                                            </Tag>
                                            <Tag>Vị trí: {banner.position}</Tag>
                                        </div>
                                        {banner.description && (
                                            <p className="text-sm text-gray-600 mb-1">{banner.description}</p>
                                        )}
                                        {banner.redirect_url && (
                                            <p className="text-xs text-gray-400 truncate">
                                                Link: {banner.redirect_url}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            size="small"
                                            icon={<Edit2 size={14} />}
                                            onClick={() => handleBannerClick(banner)}
                                        >
                                            Sửa
                                        </Button>
                                        <Popconfirm
                                            title="Xóa banner"
                                            description="Bạn có chắc chắn muốn xóa banner này?"
                                            onConfirm={() => handleDelete(banner.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true, loading: deleteLoading }}
                                        >
                                            <Button
                                                size="small"
                                                danger
                                                icon={<Trash2 size={14} />}
                                            >
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Chưa có banner nào" className="py-10" />
                    )}
                </div>
            </Card>

            <BannerModal
                open={isModalOpen}
                loading={createLoading || updateLoading}
                banner={selectedBanner}
                onCancel={() => {
                    setModalOpen(false)
                    setSelectedBanner(null)
                }}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default BannerManagementView
