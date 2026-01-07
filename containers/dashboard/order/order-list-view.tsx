'use client'
import React, { useState } from 'react'
import { Table, Button, Input, Select, Space, DatePicker, Tag, Tooltip, Tabs } from 'antd'
import { Search, Plus, X, Filter, FileText, Settings } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { useOrderList } from './hooks/use-order-list'
import { OrderDetail } from '@/types/response/order'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import StatusChip from './components/StatusChip'
import FilterDrawer from './components/FilterDrawer'
import NotFoundOrder from '@/resources/icons/not-found-order.svg'
import EmptyState from '@/components/common/EmptyState'
import ColumnSettingsModal from './components/ColumnSettingsModal'
import {
    EOrderStatus,
} from '@/types/enums/enum'

const { RangePicker } = DatePicker

type OrderColumnKey =
    | 'order_name'
    | 'customer'
    | 'source'
    | 'order_status'
    | 'packaging_status'
    | 'processing_status'
    | 'delivery_status'
    | 'financial_status'
    | 'location'
    | 'channel'
    | 'total_price'
    | 'cancel_reason'
    | 'note'
    | 'created_user'
    | 'shipping_address'
    | 'shipping_method'
    | 'shipping_fee'
    | 'payment_method'
    | 'created_at'
    | 'confirmed_on'
    | 'expected_delivery_date'
    | 'canceled_on'

const statusTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: EOrderStatus.ORDERED, label: 'Đặt hàng' },
    { key: EOrderStatus.CONFIRMED, label: 'Đang giao dịch' },
    { key: EOrderStatus.COMPLETED, label: 'Đã hoàn thành' },
    { key: EOrderStatus.CANCELLED, label: 'Đã hủy' },
]

const OrderListView: React.FC = () => {
    const {
        orders,
        loading,
        selectedRowKeys,
        pagination,
        filters,
        channels,
        customers,
        variants,
        paymentMethods,
        sources,
        locations,
        onSelectChange,
        handleTableChange,
        handleFilterChange,
        handleMultipleFilterChange,
        handleClearFilters,
        handleApplyAdvancedFilter,
    } = useOrderList()

    const router = useRouter()
    const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false)
    const [openColumnSettings, setOpenColumnSettings] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState<OrderColumnKey[]>([
        'order_name',
        'customer',
        'source',
        'processing_status',
        'financial_status',
        'total_price',
        'created_at',
    ])

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

    const columnDefs: Record<OrderColumnKey, ColumnsType<OrderDetail>[number]> = {
        order_name: {
            title: 'Mã đơn hàng',
            dataIndex: 'order_number',
            key: 'order_name',
            width: 140,
            fixed: 'left' as const,
            render: (orderNumber: unknown, record: OrderDetail) => {
                const isCancelled = record.status === EOrderStatus.CANCELLED
                return (
                    <Space>
                        <button onClick={() => router.push(`/admin/order/${record.id}`)} className='cursor-pointer'>
                            <span className={`${isCancelled ? 'text-black' : 'text-blue-600 hover:text-blue-800'} font-medium`}>#{(orderNumber as number) || record.id}</span>
                        </button>
                        {record.note && (
                            <Tooltip title={record.note} placement="top" styles={{ root: { maxWidth: '400px' } }}>
                                <FileText size={16} className="text-gray-400 hover:text-gray-600 cursor-help" />
                            </Tooltip>
                        )}
                    </Space>
                )
            },
        },
        customer: {
            title: 'Khách hàng',
            key: 'customer',
            width: 200,
            render: (_, record) => {
                const customerName = (record.customer?.first_name || record.customer?.last_name) ? `${record.customer?.first_name} ${record.customer?.last_name}` : record.customer?.email || '---'
                const isCancelled = record.status === EOrderStatus.CANCELLED
                if (record.customer?.id) {
                    return (
                        <button
                            onClick={() => router.push(`/admin/customer/${record.customer?.id}`)}
                            className='cursor-pointer'
                        >
                            <span className={isCancelled ? 'text-black' : 'text-blue-600 hover:text-blue-800'}>
                                {customerName}
                            </span>
                        </button>
                    )
                }
                return <span>{customerName}</span>
            },
        },
        source: {
            title: 'Nguồn đơn',
            key: 'source',
            width: 150,
            render: (_, record) => {
                const sourceName = record.source?.name || record.channel?.name || 'Admin'
                return <span>{sourceName}</span>
            },
        },
        order_status: {
            title: 'Trạng thái đơn hàng',
            dataIndex: 'status',
            key: 'order_status',
            width: 180,
            render: (status) => <StatusChip status={status || ''} type="order" />,
        },
        packaging_status: {
            title: 'Trạng thái đóng gói',
            key: 'packaging_status',
            width: 180,
            render: (_, record) => {
                const fulfillmentStatus = record.fulfillments?.[0]?.status || ''
                return <StatusChip status={fulfillmentStatus} type="packaging" />
            },
        },
        processing_status: {
            title: 'Trạng thái xử lý',
            dataIndex: 'fulfillment_status',
            key: 'processing_status',
            width: 150,
            render: (status) => {
                return <StatusChip status={status} type="processing" />
            },
        },
        delivery_status: {
            title: 'Trạng thái giao hàng',
            key: 'delivery_status',
            width: 180,
            render: (_, record) => {
                const shipmentStatus = record.fulfillments?.[0]?.shipment_status || ''
                return <StatusChip status={shipmentStatus} type="delivery" />
            },
        },
        financial_status: {
            title: 'Trạng thái thanh toán',
            dataIndex: 'financial_status',
            key: 'financial_status',
            width: 180,
            render: (status) => <StatusChip status={status || ''} type="payment" />,
        },
        location: {
            title: 'Chi nhánh tạo đơn',
            key: 'location',
            width: 180,
            render: (_, record) => record.location?.name || '-',
        },
        channel: {
            title: 'Kênh bán hàng',
            key: 'channel',
            width: 150,
            render: (_, record) => record.channel?.name || '-',
        },
        total_price: {
            title: 'Thành tiền',
            dataIndex: 'total_price',
            key: 'total_price',
            width: 150,
            align: 'right',
            render: (price) => {
                if (!price) return '-'
                return <span className="font-medium">{price.toLocaleString('vi-VN')}₫</span>
            },
        },
        cancel_reason: {
            title: 'Lý do hủy đơn',
            dataIndex: 'cancel_reason',
            key: 'cancel_reason',
            width: 200,
            render: (reason) => reason || '-',
        },
        note: {
            title: 'Ghi chú',
            dataIndex: 'note',
            key: 'note',
            width: 200,
            render: (note) => note || '-',
        },
        created_user: {
            title: 'Nhân viên tạo đơn',
            key: 'created_user',
            width: 200,
            render: (_, record) => {
                const userName = record.user ? `${record.user.first_name} ${record.user.last_name}` : '---'
                const isCancelled = record.status === EOrderStatus.CANCELLED
                if (record.user?.id) {
                    const userId = record.user.id
                    return (
                        <button
                            onClick={() => router.push(`/employee/${userId}`)}
                            className='cursor-pointer'
                        >
                            <span className={isCancelled ? 'text-black' : 'text-blue-600 hover:text-blue-800'}>
                                {userName}
                            </span>
                        </button>
                    )
                }
                return <span>{userName}</span>
            },
        },
        shipping_address: {
            title: 'Địa chỉ giao hàng',
            key: 'shipping_address',
            width: 250,
            render: (_, record) => {
                const address = record.shipping_address
                if (!address) return '-'
                return `${address.address}, ${address.ward_name}, ${address.district_name}, ${address.province_name}`
            },
        },
        shipping_method: {
            title: 'Phương thức vận chuyển',
            key: 'shipping_method',
            width: 180,
            render: (_, record) => record.shipping_lines?.[0]?.name || '-',
        },
        shipping_fee: {
            title: 'Phí giao hàng',
            key: 'shipping_fee',
            width: 150,
            align: 'right',
            render: (_, record) => {
                const fee = record.shipping_lines?.[0]?.price
                if (!fee) return '-'
                return <span className="font-medium">{fee.toLocaleString('vi-VN')}₫</span>
            },
        },
        payment_method: {
            title: 'Phương thức thanh toán',
            key: 'payment_method',
            width: 180,
            render: (_, record) => record.payment_method_lines?.[0]?.payment_method_name || '-',
        },
        created_at: {
            title: 'Ngày đặt hàng',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date) => {
                if (!date) return '-'
                const formatted = dayjs(date).format('DD/MM/YYYY HH:mm')
                return <span>{formatted}</span>
            },
        },
        confirmed_on: {
            title: 'Ngày xác nhận',
            dataIndex: 'confirmed_on',
            key: 'confirmed_on',
            width: 180,
            render: (date) => {
                if (!date) return '-'
                const formatted = dayjs(date).format('DD/MM/YYYY HH:mm')
                return <span>{formatted}</span>
            },
        },
        expected_delivery_date: {
            title: 'Ngày hẹn giao',
            dataIndex: 'expected_delivery_date',
            key: 'expected_delivery_date',
            width: 180,
            render: (date) => {
                if (!date) return '-'
                const formatted = dayjs(date).format('DD/MM/YYYY')
                return <span>{formatted}</span>
            },
        },
        canceled_on: {
            title: 'Ngày hủy đơn',
            dataIndex: 'canceled_on',
            key: 'canceled_on',
            width: 180,
            render: (date) => {
                if (!date) return '-'
                const formatted = dayjs(date).format('DD/MM/YYYY HH:mm')
                return <span>{formatted}</span>
            },
        },
    }

    const columns = visibleColumns.map(key => columnDefs[key])

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    const handleCreateOrder = () => {
        router.push('/admin/order/create')
    }

    const dateRangeValue: [dayjs.Dayjs, dayjs.Dayjs] | null = filters.min_created_at && filters.max_created_at
        ? [dayjs(filters.min_created_at, 'DD/MM/YYYY'), dayjs(filters.max_created_at, 'DD/MM/YYYY')]
        : null

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden max-md:max-w-[1000px] overflow-x-scroll mx-auto max-w-[1600px]">
            {/* Header - Fixed */}
            <div className=" px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold!">Danh sách đơn hàng</h1>
                    </div>
                    <Space>
                        <Button
                            type="primary"
                            size="large"
                            icon={<Plus size={16} />}
                            onClick={handleCreateOrder}
                            className="primary-button"
                        >
                            Tạo đơn hàng
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="bg-white shadow-sm rounded-lg h-full flex flex-col">
                    {/* Status Tabs */}
                    <div className="mb-3 px-3">
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
                                    handleFilterChange('statuses', [key])
                                }
                            }}
                        />
                    </div>
                    {/* Filters Bar - Fixed */}
                    <div className="shrink-0 p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Input
                                placeholder="Tìm kiếm theo mã đơn hàng, vận đơn, SĐT khách hàng"
                                prefix={<Search size={16} className="text-gray-400" />}
                                className="w-full max-w-[300px] max-sm:max-w-[200px]"
                                value={filters.key}
                                onChange={(e) => handleFilterChange('key', e.target.value)}
                                allowClear
                            />

                            <Select
                                placeholder="Kênh bán hàng"
                                mode="multiple"
                                maxTagCount="responsive"
                                className="min-w-[150px]"
                                value={filters.channel_ids}
                                onChange={(value) => handleFilterChange('channel_ids', value as unknown as string[])}
                                options={channels.map(channel => ({ label: channel.name, value: channel.id }))}
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

                            <Button
                                icon={<Filter size={16} />}
                                onClick={() => setOpenAdvancedFilter(true)}
                                className="relative"
                            >
                                Bộ lọc khác
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>

                            <Button
                                icon={<Settings size={16} />}
                                onClick={() => setOpenColumnSettings(true)}
                                className="relative"
                            >
                                Cột
                            </Button>

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
                                {filters.channel_ids && filters.channel_ids.length > 0 && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('channel_ids', [])}>
                                        Kênh bán hàng: {filters.channel_ids.length} kênh
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
                                        Trạng thái đơn hàng: {statusTabs.find(t => t.key === filters.statuses![0])?.label}
                                    </Tag>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table - Scrollable */}
                    <div className="flex-1 overflow-y-scroll">
                        <Table
                            size="small"
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={orders}
                            loading={loading}
                            rowKey="id"
                            className="[&_.ant-table-tbody>tr>td]:py-2 [&_.ant-table-tbody>tr.order-cancelled-row>td]:line-through [&_.ant-table-tbody>tr.order-cancelled-row>td>*]:line-through"
                            rowClassName={(record) => record.status === EOrderStatus.CANCELLED ? 'order-cancelled-row' : ''}
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                showTotal: (total, range) => (
                                    <span className="text-sm text-gray-600">
                                        Hiển thị <strong>{range[0]}-{range[1]}</strong> trong tổng số <strong>{total}</strong> đơn hàng
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
                                        description="Thử thay đổi điều kiện lọc hoặc từ khóa tìm kiếm để hiển thị danh sách đơn hàng."
                                        actionLabel="Xem tất cả đơn hàng"
                                        actionHref="/admin/order/list"
                                    />
                                )
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Drawer */}
            <FilterDrawer
                open={openAdvancedFilter}
                onClose={() => setOpenAdvancedFilter(false)}
                onApplyFilter={(filterValues) => {
                    handleApplyAdvancedFilter(filterValues)
                    setOpenAdvancedFilter(false)
                }}
                initialFilters={filters}
                channels={channels}
                customers={customers}
                variants={variants}
                paymentMethods={paymentMethods}
                sources={sources}
                locations={locations}
            />

            {/* Column Settings Modal */}
            <ColumnSettingsModal
                open={openColumnSettings}
                onClose={() => setOpenColumnSettings(false)}
                value={visibleColumns}
                onSave={(newVisibleColumns) => {
                    setVisibleColumns(newVisibleColumns)
                    setOpenColumnSettings(false)
                }}
            />
        </div>
    )
}

export default OrderListView
