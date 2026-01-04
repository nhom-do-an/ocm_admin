'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Table, Button, Input, Space, Image, Tooltip } from 'antd'
import { Search, Plus, X } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'

import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useCollectionList } from './hooks/use-collection-list'
import { Collection } from '@/types/response/collection'
import { useDebounce } from '@/hooks/useDebounce'

const CollectionListView: React.FC = () => {
    const {
        collections,
        loading,
        pagination,
        filters,
        handleTableChange,
        handleFilterChange,
        handleClearFilters,
    } = useCollectionList()

    const [searchKey, setSearchKey] = useState<string>(filters.key || '')
    const debouncedKey = useDebounce(searchKey, 500)
    const prevDebouncedKeyRef = useRef<string | undefined>(debouncedKey)

    // Đồng bộ khi filters.key thay đổi từ URL
    useEffect(() => {
        setSearchKey(filters.key || '')
        prevDebouncedKeyRef.current = filters.key
    }, [filters.key])

    // Áp dụng debounce để gọi API / cập nhật URL
    useEffect(() => {
        if (debouncedKey === prevDebouncedKeyRef.current) return
        prevDebouncedKeyRef.current = debouncedKey
        handleFilterChange('key', debouncedKey || undefined)
    }, [debouncedKey])

    const activeFiltersCount = Object.keys(filters).filter(key =>
        !['page', 'limit'].includes(key) &&
        filters[key as keyof typeof filters] !== undefined &&
        filters[key as keyof typeof filters] !== ''
    ).length

    const router = useRouter()

    const columns: ColumnsType<Collection> = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            width: 350,
            fixed: 'left',
            render: (_, record) => {
                const mainImage = record.image?.url

                return (
                    <Space size="middle">
                        {mainImage ? <Image
                            width={40}
                            height={40}
                            alt={record.name}
                            src={mainImage || '/placeholder.png'}
                            fallback="/placeholder.png"
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                            preview={false}
                        /> : <Image
                            width={40}
                            height={40}
                            alt={record.name}
                            src="/icon/default_image.png"
                            className='text-gray-300'

                        />}

                        <div>
                            <button onClick={() => router.push(`/admin/collection/${record.id}`)} className='cursor-pointer'>
                                <span className="text-blue-600 hover:text-blue-800 font-medium">{record.name}</span>
                            </button>
                        </div>
                    </Space>
                )
            },
        },
        {
            title: 'Số sản phẩm',
            key: 'products_count',
            width: 120,
            align: 'center',
            render: (_, record) => {
                return (
                    <span>
                        {record.products_count ?? 0}
                    </span>
                )
            },
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (_, record) => {
                let label = '-'
                if (record.type === 'manual') {
                    label = 'Thủ công'
                } else if (record.type === 'smart') {
                    label = 'Tự động'
                }
                return <span>{label}</span>
            }
        },

        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            align: 'center',
            render: (date) => {
                if (!date) return '-'
                const formatted = dayjs(date).format('DD/MM/YYYY')
                const fullDate = dayjs(date).format('DD/MM/YYYY HH:mm:ss')
                return (
                    <Tooltip title={fullDate}>
                        <span className="cursor-help">{formatted}</span>
                    </Tooltip>
                )
            },
        },
    ]

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden max-md:max-w-[1000px] overflow-x-scroll mx-auto max-w-[1600px]">
            {/* Header - Fixed */}
            <div className="shrink-0 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold!">Danh sách danh mục</h1>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => router.push('/admin/collection/create')}
                    >
                        <Plus size={16} className="inline mr-1" />
                        Thêm danh mục
                    </Button>

                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="bg-white shadow-sm rounded-lg h-fit flex flex-col">
                    {/* Filters Bar - Fixed */}
                    <div className="shrink-0 p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Input
                                placeholder="Tìm tên danh mục.."
                                prefix={<Search size={16} className="text-gray-400" />}
                                className="w-[350px]"
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                                allowClear
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
                    </div>

                    {/* Table - Scrollable */}
                    <div className="flex-1 overflow-y-scroll">
                        <Table
                            columns={columns}
                            dataSource={collections}
                            loading={loading}
                            rowKey="id"
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                showTotal: (total, range) => (
                                    <span className="text-sm text-gray-600">
                                        Hiển thị <strong>{range[0]}-{range[1]}</strong> trong tổng số <strong>{total}</strong> sản phẩm
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
                                    <div className="py-8">
                                        <p className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm nào</p>
                                        <p className="text-gray-400 text-sm">Thử điều chỉnh bộ lọc hoặc thêm sản phẩm mới</p>
                                    </div>
                                )
                            }}
                        />
                    </div>
                </div>
            </div>


        </div>
    )
}

export default CollectionListView