// app/collection/collection-table.tsx
'use client'

import React, { useState } from 'react'
import { Table, Input, Button, Space, Image, Tooltip } from 'antd'
import { Search, X } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { Collection } from '@/types/response/collection'

type Props = {
    initialData: Collection[]
    total: number
    initialPagination: { page: number; limit: number }
    initialKey?: string
}

export const CollectionTable: React.FC<Props> = ({
    initialData,
    total,
    initialPagination,
    initialKey = '',
}) => {
    const router = useRouter()
    const [collections, setCollections] = useState(initialData)
    const [pagination, setPagination] = useState({
        current: initialPagination.page,
        pageSize: initialPagination.limit,
        total,
    })
    const [key, setKey] = useState(initialKey)

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
                        <Image
                            width={40}
                            height={40}
                            alt={record.name}
                            src={mainImage || '/placeholder.png'}
                            fallback="/placeholder.png"
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                            preview={false}
                        />
                        <button
                            onClick={() => router.push(`/collection/${record.id}`)}
                            className="cursor-pointer"
                        >
                            <span className="text-blue-600 hover:text-blue-800 font-medium">
                                {record.name}
                            </span>
                        </button>
                    </Space>
                )
            },
        },
        {
            title: 'Số sản phẩm',
            key: 'available',
            width: 120,
            align: 'center',
            render: () => <span>0</span>,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            width: 150,
            render: (_, record) => <span>{record.type || '-'}</span>,
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

    const handleSearch = () => {
        const params = new URLSearchParams({
            page: '1',
            limit: pagination.pageSize.toString(),
            ...(key ? { key } : {}),
        })
        router.push(`?${params.toString()}`)
    }

    const handleClear = () => {
        setKey('')
        router.push('?page=1&limit=20')
    }

    return (
        <div className="bg-white shadow-sm rounded-lg h-fit flex flex-col">
            {/* Filter */}
            <div className="flex-shrink-0 p-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <Input
                        placeholder="Tìm tên danh mục..."
                        prefix={<Search size={16} className="text-gray-400" />}
                        className="w-[350px]"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        allowClear
                        onPressEnter={handleSearch}
                    />

                    {key && (
                        <Button
                            icon={<X size={16} />}
                            onClick={handleClear}
                            danger
                            type="text"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-scroll">
                <Table
                    columns={columns}
                    dataSource={collections}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total, range) => (
                            <span className="text-sm text-gray-600">
                                Hiển thị <strong>{range[0]}-{range[1]}</strong> trong tổng số{' '}
                                <strong>{total}</strong> danh mục
                            </span>
                        ),
                        position: ['bottomCenter'],
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    scroll={{ x: 'max-content', y: 410 }}
                    sticky
                    locale={{
                        emptyText: (
                            <div className="py-8">
                                <p className="text-gray-400 text-lg mb-2">Không tìm thấy danh mục nào</p>
                                <p className="text-gray-400 text-sm">
                                    Thử điều chỉnh bộ lọc hoặc thêm danh mục mới
                                </p>
                            </div>
                        ),
                    }}
                />
            </div>
        </div>
    )
}
