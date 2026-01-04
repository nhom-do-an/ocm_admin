'use client'
import React from 'react'
import { Table, Button, Input, Select, DatePicker, Tag, Tabs } from 'antd'
import { Search, X } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { useShipmentList } from './hooks/use-shipment-list'
import { ShipmentDetail } from '@/types/response/shipment'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import StatusChip from '../order/components/StatusChip'
import NotFoundOrder from '@/resources/icons/not-found-order.svg'
import EmptyState from '@/components/common/EmptyState'
import { EDeliveryStatus } from '@/types/enums/enum'

const { RangePicker } = DatePicker

const statusTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: EDeliveryStatus.PENDING, label: 'Chờ lấy hàng' },
    { key: EDeliveryStatus.PICKED_UP, label: 'Đã lấy hàng' },
    { key: EDeliveryStatus.DELIVERING, label: 'Đang giao hàng' },
    { key: EDeliveryStatus.DELIVERED, label: 'Đã giao hàng' },
]

const ShipmentListView: React.FC = () => {
    const {
        shipments,
        loading,
        pagination,
        filters,
        locations,
        handleTableChange,
        handleFilterChange,
        handleMultipleFilterChange,
        handleClearFilters,
    } = useShipmentList()

    const router = useRouter()

    const activeTabKey = (filters.statuses && filters.statuses.length === 1)
        ? (filters.statuses[0] as string)
        : 'all'

    const activeFiltersCount = Object.keys(filters).filter(key =>
        !['page', 'limit'].includes(key) &&
        filters[key as keyof typeof filters] !== undefined &&
        filters[key as keyof typeof filters] !== '' &&
        (Array.isArray(filters[key as keyof typeof filters])
            ? (filters[key as keyof typeof filters] as unknown[]).length > 0
            : true)
    ).length

    const columns: ColumnsType<ShipmentDetail> = [
        {
            title: 'Mã giao hàng',
            dataIndex: 'name',
            key: 'name',
            width: 140,
            fixed: 'left' as const,
            render: (name: string, record: ShipmentDetail) => {
                if (!name) return '-'
                return (
                    <button
                        onClick={() => router.push(`/admin/shipment/${record.id}`)}
                        className='cursor-pointer'
                    >
                        <span className="text-blue-600 hover:text-blue-800 font-medium">{name}</span>
                    </button>
                )
            },
        },
        {
            title: 'Mã vận đơn',
            key: 'tracking_number',
            width: 150,
            render: (_, record: ShipmentDetail) => {
                const trackingNumber = record.tracking_info?.tracking_number
                if (!trackingNumber) return '-'
                return (
                    <button
                        onClick={() => router.push(`/admin/shipment/${record.id}`)}
                        className='cursor-pointer'
                    >
                        <span className="text-blue-600 hover:text-blue-800">{trackingNumber}</span>
                    </button>
                )
            },
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_id',
            key: 'order_id',
            width: 140,
            render: (orderId: number) => {
                if (!orderId) return '-'
                return (
                    <button
                        onClick={() => router.push(`/admin/order/${orderId}`)}
                        className='cursor-pointer'
                    >
                        <span className="text-blue-600 hover:text-blue-800 font-medium">#{orderId}</span>
                    </button>
                )
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'delivery_status',
            key: 'delivery_status',
            width: 180,
            render: (status: string) => <StatusChip status={status || ''} type="delivery" />,
        },
        {
            title: 'Tiền thu hộ COD',
            key: 'cod_amount',
            width: 150,
            align: 'right',
            render: (_, record: ShipmentDetail) => {
                const codAmount = record.cod_amount || record.shipping_info?.cod_amount
                if (!codAmount) return '-'
                return <span className="font-medium">{codAmount.toLocaleString('vi-VN')}₫</span>
            },
        },
        {
            title: 'Phí trả ĐTGH',
            key: 'service_fee',
            width: 150,
            align: 'right',
            render: (_, record: ShipmentDetail) => {
                const serviceFee = record.service_fee || record.shipping_info?.service_fee
                if (!serviceFee) return '0₫'
                return <span className="font-medium">{serviceFee.toLocaleString('vi-VN')}₫</span>
            },
        },
        {
            title: 'Đối tác giao hàng',
            key: 'delivery_provider',
            width: 180,
            render: (_, record: ShipmentDetail) => {
                return record.tracking_info?.delivery_provider?.name || '-'
            },
        },
        {
            title: 'Người nhận',
            key: 'recipient',
            width: 200,
            render: (_, record: ShipmentDetail) => {
                const address = record.shipping_address
                if (!address) return '-'
                const firstName = address.first_name || ''
                const lastName = address.last_name || ''
                const fullName = `${firstName} ${lastName}`.trim()
                return <span>{fullName || '-'}</span>
            },
        },
        {
            title: 'Chi nhánh lấy hàng',
            key: 'location',
            width: 180,
            render: (_, record: ShipmentDetail) => {
                return record.location?.name || '-'
            },
        },
    ]
    const dateRangeValue: [dayjs.Dayjs, dayjs.Dayjs] | null = filters.min_created_at && filters.max_created_at
        ? [dayjs(filters.min_created_at, 'DD/MM/YYYY'), dayjs(filters.max_created_at, 'DD/MM/YYYY')]
        : null

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden max-md:max-w-[1000px] overflow-x-scroll mx-auto max-w-[1600px]">
            {/* Header - Fixed */}
            <div className=" px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold!">Danh sách vận đơn</h1>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="bg-white shadow-sm rounded-lg h-full flex flex-col">
                    {/* Status Tabs */}
                    <div className="mb-3 px-5">
                        <Tabs
                            activeKey={activeTabKey}
                            items={statusTabs.map(tab => ({
                                key: tab.key,
                                label: tab.label,
                            }))}
                            onChange={(key) => {
                                if (key === 'all') {
                                    handleFilterChange('statuses', undefined)
                                } else {
                                    handleFilterChange('statuses', key as any)
                                }
                            }}
                        />
                    </div>
                    {/* Filters Bar - Fixed */}
                    <div className="shrink-0 p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Input
                                placeholder="Tìm kiếm theo mã đơn hàng, mã vận đơn, mã giao hàng"
                                prefix={<Search size={16} className="text-gray-400" />}
                                className="w-full max-w-[300px] max-sm:max-w-[200px]"
                                value={filters.key}
                                onChange={(e) => handleFilterChange('key', e.target.value)}
                                allowClear
                            />

                            <Select
                                placeholder="Trạng thái"
                                mode="multiple"
                                maxTagCount="responsive"
                                className="min-w-[150px]"
                                value={filters.statuses}
                                onChange={(value) => handleFilterChange('statuses', value as any)}
                                options={[
                                    { label: 'Chờ lấy hàng', value: EDeliveryStatus.PENDING },
                                    { label: 'Đã lấy hàng', value: EDeliveryStatus.PICKED_UP },
                                    { label: 'Đang vận chuyển', value: EDeliveryStatus.DELIVERING },
                                    { label: 'Chờ giao lại', value: EDeliveryStatus.RETRY_DELIVERY },
                                    { label: 'Đang trả hàng', value: EDeliveryStatus.RETURNING },
                                    { label: 'Đã giao hàng', value: EDeliveryStatus.DELIVERED },
                                    { label: 'Đã trả hàng', value: EDeliveryStatus.RETURNED },
                                    { label: 'Đã hủy', value: EDeliveryStatus.CANCELLED },
                                ]}
                                allowClear
                            />

                            <Select
                                placeholder="Chi nhánh lấy hàng"
                                mode="multiple"
                                maxTagCount="responsive"
                                className="min-w-[150px]"
                                value={filters.location_ids}
                                onChange={(value) => handleFilterChange('location_ids', value as any)}
                                options={locations.map(location => ({ label: location.name, value: location.id }))}
                                allowClear
                            />

                            <Input
                                placeholder="Mã đơn hàng"
                                className="w-full max-w-[200px]"
                                value={filters.order_id?.toString()}
                                onChange={(e) => {
                                    const value = e.target.value
                                    handleFilterChange('order_id', value ? parseInt(value) : undefined)
                                }}
                                allowClear
                            />

                            <RangePicker
                                placeholder={['Từ ngày', 'Đến ngày']}
                                format="DD/MM/YYYY"
                                className="min-w-[250px]"
                                value={dateRangeValue}
                                onChange={(dates) => {
                                    if (dates && dates[0] && dates[1]) {
                                        handleMultipleFilterChange({
                                            min_created_at: dates[0].format('DD/MM/YYYY'),
                                            max_created_at: dates[1].format('DD/MM/YYYY'),
                                        })
                                    } else {
                                        handleMultipleFilterChange({
                                            min_created_at: undefined,
                                            max_created_at: undefined,
                                        })
                                    }
                                }}
                            />

                            {activeFiltersCount > 0 && (
                                <Button
                                    icon={<X size={16} />}
                                    onClick={handleClearFilters}
                                    danger
                                    type="text"
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>

                        {/* Active Filters Display */}
                        {activeFiltersCount > 0 && (
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-gray-500">Đang lọc:</span>
                                {filters.location_ids && filters.location_ids.length > 0 && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('location_ids', undefined)}>
                                        Chi nhánh: {filters.location_ids.length} chi nhánh
                                    </Tag>
                                )}
                                {filters.min_created_at && filters.max_created_at && (
                                    <Tag closable color='blue' onClose={() => {
                                        handleFilterChange('min_created_at', undefined)
                                        handleFilterChange('max_created_at', undefined)
                                    }}>
                                        Ngày: {filters.min_created_at} - {filters.max_created_at}
                                    </Tag>
                                )}
                                {filters.statuses && filters.statuses.length === 1 && filters.statuses[0] !== undefined && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('statuses', undefined)}>
                                        Trạng thái: {statusTabs.find(t => t.key === filters.statuses![0])?.label || filters.statuses[0]}
                                    </Tag>
                                )}
                                {filters.order_id && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('order_id', undefined)}>
                                        Mã đơn hàng: #{filters.order_id}
                                    </Tag>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table - Scrollable */}
                    <div className="flex-1 overflow-y-scroll">
                        <Table
                            size="small"
                            columns={columns}
                            dataSource={shipments}
                            loading={loading}
                            rowKey="id"
                            className="[&_.ant-table-tbody>tr>td]:py-2"
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                showTotal: (total, range) => (
                                    <span className="text-sm text-gray-600">
                                        Hiển thị <strong>{range[0]}-{range[1]}</strong> trong tổng số <strong>{total}</strong> vận đơn
                                    </span>
                                ),
                                position: ['bottomCenter'],
                                pageSizeOptions: ['10', '20', '50', '100'],
                            }}
                            onChange={handleTableChange}
                            scroll={{ x: 'max-content', y: 410 }}
                            sticky
                            locale={{
                                emptyText: (
                                    <EmptyState
                                        imageSrc={NotFoundOrder}
                                        title="Không tìm thấy dữ liệu phù hợp với kết quả tìm kiếm"
                                        description="Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm để hiển thị danh sách vận đơn."
                                        actionLabel="Xem tất cả vận đơn"
                                        actionHref="/admin/shipment/list"
                                    />
                                )
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShipmentListView

