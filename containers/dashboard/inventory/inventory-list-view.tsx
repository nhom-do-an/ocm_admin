'use client'

import React, { useMemo } from 'react'
import { Table, Select, Button, Tag, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { InventoryLevel } from '@/types/response/inventory-level'
import { useInventoryList } from './hooks/use-inventory-list'
import Image from 'next/image'
import Link from 'next/link'
import DefaultProductImage from '@/resources/icons/default_img.svg'
import { RefreshCw } from 'lucide-react'

const InventoryListView: React.FC = () => {
    const {
        inventoryLevels,
        locations,
        variants: variantOptionSource,
        variantSelectLoading,
        loading,
        pagination,
        filters,
        selectedLocationIds,
        handleTableChange,
        handleVariantFilterChange,
        handleVariantSearch,
        handleVariantPopupScroll,
        handleLocationFilterChange,
        handleClearFilters,
        refresh,
    } = useInventoryList()

    const locationOptions = useMemo(
        () => locations.map(location => ({
            label: location.default_location ? `${location.name} (Mặc định)` : location.name,
            value: location.id,
        })),
        [locations]
    )

    const variantOptions = useMemo(
        () => variantOptionSource.map(variant => ({
            label: `${variant.product_name || 'Sản phẩm'}${variant.title ? ` - ${variant.title}` : ''}`,
            value: variant.id,
        })),
        [variantOptionSource]
    )

    const activeFiltersCount = useMemo(() => {
        let count = 0
        if (filters.variant_id) count += 1
        if (!filters.default_location && (filters.location_ids?.length ?? 0) > 0) count += 1
        return count
    }, [filters.default_location, filters.location_ids, filters.variant_id])

    const renderQuantity = (value?: number) => (value ?? 0).toLocaleString('vi-VN')

    const columns: ColumnsType<InventoryLevel> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 100,
            render: (_, record) => (
                <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Image
                        src={record.image_url || DefaultProductImage}
                        alt={record.product_name || 'Sản phẩm'}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                    />
                </div>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'product_name',
            key: 'product_name',
            width: 320,
            render: (_, record) => (
                <div className="flex flex-col">
                    {record.product_id && record.variant_id ? (
                        <Link
                            href={`/admin/product/${record.product_id}/variant/${record.variant_id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {record.product_name || 'Sản phẩm'}
                        </Link>
                    ) : (
                        <span className="font-medium text-gray-800">
                            {record.product_name || 'Sản phẩm'}
                        </span>
                    )}
                    {record.variant_title && record.variant_title !== "Default Title" && (
                        <span className="text-sm text-gray-500">{record.variant_title}</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Tồn kho',
            dataIndex: 'available',
            key: 'available',
            align: 'center' as const,
            width: 140,
            render: (_, record) => (
                <span className={record.available <= 0 ? 'text-red-500 font-medium' : 'text-gray-900'}>
                    {renderQuantity(record.available)}
                </span>
            ),
        },
        {
            title: 'Có thể bán',
            dataIndex: 'on_hand',
            key: 'on_hand',
            align: 'center' as const,
            width: 140,
            render: (_, record) => renderQuantity(record.on_hand),
        },
        {
            title: 'Đang giao dịch',
            dataIndex: 'incoming',
            key: 'incoming',
            align: 'center' as const,
            width: 140,
            render: (_, record) => renderQuantity(record.incoming),
        },
        {
            title: 'Đang nhập',
            dataIndex: 'committed',
            key: 'committed',
            align: 'center' as const,
            width: 140,
            render: (_, record) => renderQuantity(record.committed),
        },
    ]

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden mx-auto max-w-[1600px]">
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl">Danh sách tồn kho</h1>
                    </div>
                    <Button icon={<RefreshCw size={16} />} onClick={refresh}>
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="bg-white shadow-sm rounded-lg h-full flex flex-col">
                    <div className=" p-4 flex flex-col gap-3">
                        <Space wrap size="middle">
                            <Select<number>
                                allowClear
                                showSearch
                                placeholder="Chọn phiên bản sản phẩm"
                                optionFilterProp="label"
                                className="min-w-[260px]"
                                value={filters.variant_id}
                                onChange={(value) => handleVariantFilterChange(value ?? undefined)}
                                options={variantOptions}
                                loading={variantSelectLoading}
                                filterOption={false}
                                onSearch={handleVariantSearch}
                                onPopupScroll={handleVariantPopupScroll}
                            />

                            <Select<number[]>
                                mode="multiple"
                                allowClear
                                showSearch
                                maxTagCount="responsive"
                                placeholder="Chọn chi nhánh"
                                optionFilterProp="label"
                                className="min-w-[320px]"
                                value={selectedLocationIds}
                                onChange={(value) => handleLocationFilterChange(value)}
                                options={locationOptions}
                            />

                            {activeFiltersCount > 0 && (
                                <Button danger onClick={handleClearFilters}>
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </Space>

                        {(filters.variant_id || (!filters.default_location && (filters.location_ids?.length ?? 0) > 0)) && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-gray-500">Đang lọc:</span>
                                {filters.variant_id && (
                                    <Tag
                                        closable
                                        color="blue"
                                        onClose={() => handleVariantFilterChange(undefined)}
                                    >
                                        Phiên bản:{' '}
                                        {
                                            variantOptions.find(option => option.value === filters.variant_id)
                                                ?.label
                                        }
                                    </Tag>
                                )}
                                {!filters.default_location && (filters.location_ids?.length ?? 0) > 0 && (
                                    <Tag
                                        closable
                                        color="blue"
                                        onClose={() => handleLocationFilterChange([])}
                                    >
                                        Chi nhánh:{' '}
                                        {locations
                                            .filter(location => filters.location_ids?.includes(location.id))
                                            .map(location => location.name)
                                            .join(', ')}
                                    </Tag>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <Table
                            size="small"
                            columns={columns}
                            dataSource={inventoryLevels}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showTotal: (total, range) => (
                                    <span className="text-sm text-gray-600">
                                        Hiển thị <strong>{range[0]}-{range[1]}</strong> /{' '}
                                        <strong>{total}</strong> phiên bản
                                    </span>
                                ),
                                position: ['bottomCenter'],
                            }}
                            onChange={(paginationConfig) => handleTableChange({
                                current: paginationConfig.current,
                                pageSize: paginationConfig.pageSize,
                            })}
                            scroll={{ x: 'max-content', y: 420 }}
                            sticky
                            locale={{
                                emptyText: (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500">Không có dữ liệu tồn kho</p>
                                        <p className="text-gray-400 text-sm">Thử điều chỉnh bộ lọc</p>
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

export default InventoryListView

