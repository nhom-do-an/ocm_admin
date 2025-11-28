'use client'

import React, { useMemo } from 'react'
import { Button, Card, Input, Pagination, Space, Tag } from 'antd'
import { Plus } from 'lucide-react'
import AddDeliveryProviderModal from '@/containers/dashboard/order/components/AddDeliveryProviderModal'
import { useShippingPartner } from './hooks/use-shipping-partner'
import { DeliveryProviderStatus } from '@/types/enums/enum'

const statusColors: Record<DeliveryProviderStatus, string> = {
    active: 'green',
    inactive: 'red',
}

const ShippingPartnerView: React.FC = () => {
    const {
        providers,
        loading,
        pagination,
        filters,
        modalOpen,
        editingProvider,
        openCreateModal,
        openEditModal,
        handleSubmit,
        setModalOpen,
        handleTableChange,
        handleSearch,
        handleStatusFilter,
    } = useShippingPartner()

    const statusOptions = useMemo(
        () => [
            { label: 'Tất cả', value: undefined },
            { label: 'Đang hoạt động', value: DeliveryProviderStatus.Active },
            { label: 'Ngưng hoạt động', value: DeliveryProviderStatus.Inactive },
        ],
        [],
    )

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Đối tác vận chuyển</h1>
                    <p className="text-gray-500">Quản lý danh sách đối tác tự liên hệ</p>
                </div>
                <Button type="primary" icon={<Plus size={18} />} onClick={openCreateModal}>
                    Thêm đối tác
                </Button>
            </div>

            <Card className="mb-6">
                <Space direction="vertical" size="middle" className="w-full">
                    <Input.Search
                        placeholder="Tìm theo tên hoặc ghi chú"
                        allowClear
                        onSearch={handleSearch}
                        defaultValue={filters.key}
                        loading={loading}
                    />
                    <Space size="small">
                        {statusOptions.map(option => (
                            <Button
                                key={option.label}
                                type={
                                    filters.status === option.value ||
                                        (!filters.status && option.value === undefined)
                                        ? 'primary'
                                        : 'default'
                                }
                                onClick={() => handleStatusFilter(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </Space>
                </Space>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(provider => (
                    <Card
                        key={provider.id}
                        hoverable
                        loading={loading}
                        onClick={() => openEditModal(provider)}
                        className="cursor-pointer transition-shadow hover:shadow-md w-full"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{provider.name || 'N/A'}</h3>
                                <Tag color={statusColors[provider.status as DeliveryProviderStatus] || 'blue'}>
                                    {provider.status === DeliveryProviderStatus.Active ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                                </Tag>
                            </div>
                            {provider.phone && (
                                <p className="text-sm text-gray-600">
                                    SĐT: <span className="font-medium">{provider.phone}</span>
                                </p>
                            )}
                            {provider.email && (
                                <p className="text-sm text-gray-600">
                                    Email: <span className="font-medium">{provider.email}</span>
                                </p>
                            )}
                            {provider.address && (
                                <p className="text-sm text-gray-500">{provider.address}</p>
                            )}
                            <div className="text-sm text-gray-700 line-clamp-3">
                                {provider.note || 'Chưa có ghi chú'}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center mt-6">
                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handleTableChange}
                    showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total}`}
                    showSizeChanger
                    pageSizeOptions={['6', '12', '24']}
                />
            </div>

            <AddDeliveryProviderModal
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false)
                }}
                onSave={handleSubmit}
                initialValues={editingProvider || undefined}
            />
        </div>
    )
}

export default ShippingPartnerView

