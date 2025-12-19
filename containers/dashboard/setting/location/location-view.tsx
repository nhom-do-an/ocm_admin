'use client'

import React, { useState } from 'react'
import { Button, Card, Empty, Skeleton, Tag } from 'antd'
import { MapPin, Plus } from 'lucide-react'
import useLocationManagement from './hooks/use-location-management'
import Loader from '@/components/Loader'
import LocationModal from './components/LocationModal'
import { CreateLocationRequest, UpdateLocationRequest } from '@/types/request/location'
import { LocationDetail } from '@/types/response/location'
import locationService from '@/services/location'
import { ELocationStatus } from '@/types/enums/enum'

const LocationManagementView: React.FC = () => {
    const { locations, loading, createLoading, updateLoading, createLocation, updateLocation } = useLocationManagement()
    const [isModalOpen, setModalOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const handleLocationClick = async (locationId: number) => {
        setLoadingDetail(true)
        try {
            const detail = await locationService.getLocationDetail(locationId)
            setSelectedLocation(detail)
            setModalOpen(true)
        } catch (error) {
            console.error('Failed to fetch location detail', error)
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleSubmit = async (values: CreateLocationRequest | UpdateLocationRequest) => {
        if ('id' in values) {
            // Update mode
            await updateLocation(values.id, values)
            setModalOpen(false)
            setSelectedLocation(null)
        } else {
            // Create mode
            await createLocation(values)
            setModalOpen(false)
        }
    }

    const getStatusTag = (status: ELocationStatus) => {
        return status === ELocationStatus.ACTIVE ? (
            <Tag color="success">Đang hoạt động</Tag>
        ) : (
            <Tag>Tạm tắt</Tag>
        )
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
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý chi nhánh</h1>
                <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý các chi nhánh trong cửa hàng</p>
            </div>

            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                    <div>
                        <p className="text-base font-semibold text-gray-900">Danh sách chi nhánh</p>
                        <p className="text-sm text-gray-500">Quản lý các chi nhánh trong cửa hàng của bạn</p>
                    </div>
                    <Button type="primary" icon={<Plus size={16} />} onClick={() => {
                        setSelectedLocation(null)
                        setModalOpen(true)
                    }}>
                        Thêm mới chi nhánh
                    </Button>
                </div>
                <div>
                    {loading ? (
                        <div className="py-10">
                            <Skeleton active />
                        </div>
                    ) : locations.length > 0 ? (
                        <div className="space-y-3">
                            {locations.map(location => (
                                <div
                                    key={location.id}
                                    className="flex flex-col gap-2 rounded border border-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleLocationClick(location.id)}
                                >
                                    <div className="flex items-start gap-3 flex-1">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-gray-900">{location.name}</p>
                                                {getStatusTag(location.status)}
                                            </div>
                                            {location.address && (
                                                <p className="text-sm text-gray-600">{location.address}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        {location.default_location && (
                                            <Button size="small" type="default">
                                                Mặc định
                                            </Button>
                                        )}
                                        {location.inventory_management && (
                                            <Button size="small" type="default">
                                                Quản lý kho
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Cửa hàng của bạn chưa có chi nhánh nào" className="py-10" />
                    )}
                </div>
            </Card>

            <LocationModal
                open={isModalOpen}
                loading={createLoading || updateLoading || loadingDetail}
                location={selectedLocation}
                onCancel={() => {
                    setModalOpen(false)
                    setSelectedLocation(null)
                }}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default LocationManagementView


