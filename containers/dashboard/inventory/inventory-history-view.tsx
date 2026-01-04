'use client'

import React, { useMemo } from 'react'
import { Table, Select, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'
import { useInventoryHistory, InventoryAdjustmentWithChanges } from './hooks/use-inventory-history'
import {
    ChangeInventoryReason,
    ChangeInventoryType,
} from '@/types/response/inventory-adjustment'

interface InventoryHistoryViewProps {
    initialVariantId?: number
    initialLocationId?: number
}

const reasonLabels: Record<ChangeInventoryReason, string> = {
    create_product: 'Tạo sản phẩm',
    fact_inventory: 'Cập nhật tồn kho thực tế',
    create_order: 'Tạo đơn hàng',
}

const transactionTypeLabels: Record<string, string> = {
    order: 'Đơn hàng',
    product: 'Sản phẩm',
    return_order: 'Đơn trả hàng',
    shipment: 'Phiếu giao',
    line_item: 'Dòng sản phẩm',
}

const InventoryHistoryView: React.FC<InventoryHistoryViewProps> = ({
    initialVariantId,
    initialLocationId,
}) => {
    const {
        adjustments,
        locations,
        variantDetail,
        filters,
        loading,
        pagination,
        handleLocationFilterChange,
        handleTableChange,
        refresh,
    } = useInventoryHistory({
        initialVariantId,
        initialLocationId,
    })

    const locationOptions = useMemo(
        () =>
            locations.map(location => ({
                label: location.default_location ? `${location.name} (Mặc định)` : location.name,
                value: location.id,
            })),
        [locations],
    )

    const formatChangeValue = (
        record: InventoryAdjustmentWithChanges,
        type: ChangeInventoryType,
    ) => {
        const change = record.parsed_changes.find(item => item.change_type === type)
        if (!change) return <span className="text-gray-400">---</span>

        const delta = typeof change.delta_value === 'number' ? change.delta_value : undefined
        const after =
            typeof change.value_after_change === 'number' ? change.value_after_change : undefined

        if (delta === undefined && after === undefined) {
            return <span className="text-gray-400">---</span>
        }

        const deltaText =
            delta !== undefined ? `${delta > 0 ? '+' : ''}${delta.toLocaleString('vi-VN')}` : ''
        const afterText = after !== undefined ? after.toLocaleString('vi-VN') : ''

        return (
            <div className="flex flex-col items-center">
                {deltaText && (
                    <span
                        className={`font-medium ${delta && delta > 0 ? 'text-green-600' : delta && delta < 0 ? 'text-red-500' : 'text-gray-700'
                            }`}
                    >
                        {deltaText}
                    </span>
                )}
                {afterText && (
                    <span className="text-xs text-gray-500">
                        ({afterText})
                    </span>
                )}
            </div>
        )
    }

    const renderTransaction = (record: InventoryAdjustmentWithChanges) => {
        if (!record.reference_document_type && !record.reference_document_name) {
            return <span className="text-gray-400">---</span>
        }

        const typeLabel =
            transactionTypeLabels[record.reference_document_type ?? ''] ||
            record.reference_document_type ||
            '---'

        const href = (() => {
            if (!record.reference_document_id || !record.reference_document_type) return null
            switch (record.reference_document_type) {
                case 'product':
                    return `/admin/product/${record.reference_document_id}`
                case 'order':
                    return `/admin/order/${record.reference_document_id}`
                default:
                    return null
            }
        })()

        const clickableLabel = record.reference_document_name || typeLabel

        return (
            <div className="flex flex-col">
                {href ? (
                    <Link href={href} className="text-blue-600 hover:text-blue-700 font-medium">
                        {clickableLabel}
                    </Link>
                ) : (
                    <span className="font-medium text-gray-800">{clickableLabel}</span>
                )}
                <span className="text-xs text-gray-500">{typeLabel}</span>
            </div>
        )
    }

    const columns: ColumnsType<InventoryAdjustmentWithChanges> = [
        {
            title: 'Thời gian',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (value: string) =>
                value ? (
                    <div className="flex flex-col">
                        <span className="font-medium">{dayjs(value).format('HH:mm:ss')}</span>
                        <span className="text-xs text-gray-500">
                            {dayjs(value).format('DD/MM/YYYY')}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-400">---</span>
                ),
        },
        {
            title: 'Giao dịch',
            key: 'reference_document',
            width: 220,
            render: (_, record) => renderTransaction(record),
        },
        {
            title: 'Hành động',
            key: 'reason',
            width: 180,
            render: (_, record) => {
                const reason = record.parsed_changes[0]?.reason
                if (!reason) return <span className="text-gray-400">---</span>
                return (
                    <span className="font-medium">
                        {reasonLabels[reason] || reason}
                    </span>
                )
            },
        },
        {
            title: 'Thay đổi bởi',
            dataIndex: 'actor_id',
            key: 'actor',
            width: 180,
            render: (_: number, record) => {
                if (record.actor_id === 1) return <span>Hệ thống</span>
                if (!record.actor_id) return <span className="text-gray-400">---</span>
                return <span>{record.actor_name || '---'}</span>
            },
        },
        {
            title: 'Tồn kho',
            key: 'available',
            align: 'center',
            width: 140,
            render: (_, record) => formatChangeValue(record, 'available'),
        },
        {
            title: 'Có thể bán',
            key: 'on_hand',
            align: 'center',
            width: 140,
            render: (_, record) => formatChangeValue(record, 'on_hand'),
        },
        {
            title: 'Đang giao dịch',
            key: 'incoming',
            align: 'center',
            width: 140,
            render: (_, record) => formatChangeValue(record, 'incoming'),
        },
        {
            title: 'Đang nhập',
            key: 'committed',
            align: 'center',
            width: 140,
            render: (_, record) => formatChangeValue(record, 'committed'),
        },
    ]

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden mx-auto max-w-[1600px]">
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl">Lịch sử thay đổi kho</h1>
                        {variantDetail && (
                            <p className="text-sm text-gray-500">
                                {variantDetail.product_name}
                                {variantDetail.title ? ` • ${variantDetail.title}` : ''}
                            </p>
                        )}
                    </div>
                    <Button icon={<RefreshCw size={16} />} onClick={refresh}>
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="bg-white shadow-sm rounded-lg h-full flex flex-col">
                    <div className="p-4 flex flex-col gap-3">
                        <Space wrap size="middle">
                            <Select<number>
                                placeholder="Chọn chi nhánh"
                                className="min-w-[260px]"
                                value={filters.location_id}
                                options={locationOptions}
                                onChange={(value) => handleLocationFilterChange(value)}
                                loading={!locations.length}
                            />
                        </Space>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <Table<InventoryAdjustmentWithChanges>
                            columns={columns}
                            dataSource={adjustments}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showTotal: (total, range) => (
                                    <span className="text-sm text-gray-600">
                                        Hiển thị <strong>{range[0]}-{range[1]}</strong> /{' '}
                                        <strong>{total}</strong> bản ghi
                                    </span>
                                ),
                                position: ['bottomCenter'],
                            }}
                            onChange={(paginationConfig) =>
                                handleTableChange({
                                    current: paginationConfig.current,
                                    pageSize: paginationConfig.pageSize,
                                })
                            }
                            scroll={{ x: 'max-content', y: 420 }}
                            sticky
                            locale={{
                                emptyText: (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500">Chưa có lịch sử điều chỉnh tồn kho</p>
                                        <p className="text-gray-400 text-sm">
                                            Thử đổi bộ lọc hoặc thao tác với tồn kho
                                        </p>
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InventoryHistoryView

