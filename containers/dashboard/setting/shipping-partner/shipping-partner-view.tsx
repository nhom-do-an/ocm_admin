'use client'

import React, { useMemo } from 'react'
import { Button, Card, Input, Pagination, Select, Table, Tabs, Tag } from 'antd'
import { Plus, Search } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import AddDeliveryProviderModal from '@/containers/dashboard/order/components/AddDeliveryProviderModal'
import { useShippingPartner } from './hooks/use-shipping-partner'
import { DeliveryProviderStatus, DeliveryProviderType } from '@/types/enums/enum'
import { DeliveryProvider } from '@/types/request/order'

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

    const activeTabKey = filters.status === undefined ? 'all' : filters.status

    const columns: ColumnsType<DeliveryProvider> = [
        {
            title: 'Tên đối tác',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (name: string, record: DeliveryProvider) => (
                <button
                    onClick={() => openEditModal(record)}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                    {name || 'N/A'}
                </button>
            ),
        },
        {
            title: 'Mã đối tác',
            dataIndex: 'code',
            key: 'code',
            width: 150,
            render: (code: string) => <span>{code || '-'}</span>,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (phone: string) => <span>{phone || '-'}</span>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status: string) => {
                const isActive = status === DeliveryProviderStatus.Active
                return (
                    <Tag color={statusColors[status as DeliveryProviderStatus] || 'blue'}>
                        {isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                    </Tag>
                )
            },
        },
    ]

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Đối tác vận chuyển</h1>
                <Button type="primary" icon={<Plus size={18} />} onClick={openCreateModal}>
                    Thêm mới đối tác
                </Button>
            </div>

            <Card>
                {/* Tabs cho trạng thái */}
                <div className="mb-4">
                    <Tabs
                        activeKey={activeTabKey}
                        items={statusOptions.map(option => ({
                            key: option.value === undefined ? 'all' : option.value,
                            label: option.label,
                        }))}
                        onChange={(key) => {
                            if (key === 'all') {
                                handleStatusFilter(undefined)
                            } else {
                                handleStatusFilter(key as DeliveryProviderStatus)
                            }
                        }}
                    />
                </div>

                {/* Search và Filter */}
                <div className="flex items-center gap-3 mb-4">
                    <Input
                        placeholder="Tìm kiếm theo Tên đối tác hoặc Số điện thoại"
                        prefix={<Search size={16} className="text-gray-400" />}
                        className="flex-1 max-w-[400px]"
                        value={filters.key}
                        onChange={(e) => handleSearch(e.target.value)}
                        allowClear
                    />
                    <Select
                        placeholder="Trạng thái"
                        className="min-w-[150px]"
                        value={filters.status}
                        onChange={handleStatusFilter}
                        allowClear
                    >
                        <Select.Option value={DeliveryProviderStatus.Active}>Đang hoạt động</Select.Option>
                        <Select.Option value={DeliveryProviderStatus.Inactive}>Ngưng hoạt động</Select.Option>
                    </Select>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={providers}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (total, range) => (
                            <span className="text-sm text-gray-600">
                                Từ <strong>{range[0]}</strong> đến <strong>{range[1]}</strong> trên tổng <strong>{total}</strong>
                            </span>
                        ),
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={(paginationConfig) => {
                        handleTableChange(
                            paginationConfig.current || 1,
                            paginationConfig.pageSize
                        )
                    }}
                />
            </Card>

            <AddDeliveryProviderModal
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false)
                }}
                onSave={handleSubmit}
                initialValues={editingProvider ? {
                    ...editingProvider,
                    status: editingProvider.status as DeliveryProviderStatus,
                    type: editingProvider.type as DeliveryProviderType
                } : undefined}
            />
        </div>
    )
}

export default ShippingPartnerView

