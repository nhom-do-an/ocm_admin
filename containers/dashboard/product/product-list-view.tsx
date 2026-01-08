'use client'
import React from 'react'
import { Table, Button, Input, Select, Space, Dropdown, Image, Tag, Tooltip } from 'antd'
import { Search, Plus, Filter, X, ChevronDown } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import FilterDrawer from '@/containers/dashboard/product/components/FilterDrawer'
import { useProductList } from './hooks/use-product-list'
import { Product } from '@/types/response/product'
import { formatWithPattern } from '@/utils/date'
import { PStatusOptions, PTypeOptions } from '@/constants/constant'
import { useRouter } from 'next/navigation'

const ProductListView: React.FC = () => {
    const {
        products,
        loading,
        selectedRowKeys,
        pagination,
        filters,
        openAdvancedFilter,
        setOpenAdvancedFilter,
        onSelectChange,
        handleTableChange,
        handleFilterChange,
        handleAdvancedFilter,
        handleApplyAdvancedFilter,
        handleClearFilters,
        vendors,
        collections,
    } = useProductList()

    const activeFiltersCount = Object.keys(filters).filter(key =>
        !['page', 'limit'].includes(key) &&
        filters[key as keyof typeof filters] !== undefined &&
        filters[key as keyof typeof filters] !== '' &&
        (Array.isArray(filters[key as keyof typeof filters])
            ? (filters[key as keyof typeof filters] as unknown[]).length > 0
            : true)
    ).length

    const router = useRouter()

    const columns: ColumnsType<Product> = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 350,
            fixed: 'left',
            render: (_, record) => {
                const mainImage = record.images?.[0]?.url
                const variantCount = record.variants?.length || 0

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
                            src="/admin/icon/default_image.png"
                            className='text-gray-300'

                        />}

                        <div>
                            <button onClick={() => router.push(`/admin/product/${record.id}`)} className='cursor-pointer'>
                                <span className="text-blue-600 hover:text-blue-800 font-medium">{record.name}</span>
                            </button>
                            {variantCount > 0 && (
                                <div className="text-xs text-gray-500">
                                    {variantCount} phiên bản
                                </div>
                            )}
                            {/* {record.tags?.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {record.tags.slice(0, 3).map((tag) => (
                                        <Tag key={tag} color="blue" className="m-0 text-xs">
                                            {tag}
                                        </Tag>
                                    ))}
                                    {record.tags.length > 3 && (
                                        <Tag className="m-0 text-xs">+{record.tags.length - 3}</Tag>
                                    )}
                                </div>
                            )} */}
                        </div>
                    </Space>
                )
            },
        },
        {
            title: 'Có thể bán',
            key: 'available',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const totalStock = record.variants?.reduce(
                    (acc, v) => acc + (v.inventory_quantity || 0),
                    0
                )
                return (
                    <span className={totalStock! <= 0 ? 'text-red-500 font-medium' : 'text-gray-900'}>
                        {totalStock?.toLocaleString('vi-VN') || 0}
                    </span>
                )
            },
        },
        {
            title: 'Loại',
            dataIndex: 'product_type',
            key: 'product_type',
            width: 150,
            render: (text) => text || '-',
        },
        {
            title: 'Nhãn hiệu',
            dataIndex: 'vendor',
            key: 'vendor',
            width: 150,
            render: (text) => text || '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (status) => {
                const statusConfig = {
                    active: { color: 'green', text: 'Đang bán' },
                    inactive: { color: 'red', text: 'Ngừng bán' },
                }
                const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
                return <Tag color={config.color}>{config.text}</Tag>
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            align: 'center',
            render: (date) => {
                if (!date) return '-'
                const formatted = formatWithPattern(date, 'DD/MM/YYYY')
                const fullDate = formatWithPattern(date, 'DD/MM/YYYY HH:mm:ss')
                return (
                    <Tooltip title={fullDate}>
                        <span className="cursor-help">{formatted}</span>
                    </Tooltip>
                )
            },
        },
    ]

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    const handleAddProduct = (type: 'normal' | 'combo' | 'packsize') => {
        switch (type) {
            case 'normal':
                router.push('/admin/product/create')
                break
            case 'combo':
                router.push('/admin/product/create?type=combo')
                break
            case 'packsize':
                router.push('/admin/product/create?type=packsize')
                break
        }
    }

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden max-md:max-w-[1000px] overflow-x-scroll mx-auto max-w-[1600px]">
            {/* Header - Fixed */}
            <div className=" px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl">Danh sách sản phẩm</h1>
                    </div>
                    <Space>
                        <Dropdown.Button
                            type="primary"
                            size="large"
                            icon={<ChevronDown size={16} />}
                            onClick={() => handleAddProduct('normal')}
                            menu={{
                                items: [
                                    {
                                        key: 'combo',
                                        label: 'Thêm sản phẩm combo',
                                        onClick: () => handleAddProduct('combo')
                                    },
                                    {
                                        key: 'packsize',
                                        label: 'Thêm sản phẩm có đơn vị quy đổi',
                                        onClick: () => handleAddProduct('packsize')
                                    },
                                ],
                            }}
                            placement="bottomRight"
                        >
                            <Plus size={16} className="inline mr-1" />
                            Thêm sản phẩm
                        </Dropdown.Button>
                    </Space>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                <div className="bg-white shadow-sm rounded-lg h-full flex flex-col">
                    {/* Filters Bar - Fixed */}
                    <div className="shrink-0 p-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <Input
                                placeholder="Tìm theo mã, tên sản phẩm..."
                                prefix={<Search size={16} className="text-gray-400" />}
                                className="w-[350px]"
                                value={filters.key}
                                onChange={(e) => handleFilterChange('key', e.target.value)}
                                allowClear
                            />

                            <Select
                                placeholder="Nhãn hiệu"
                                mode="multiple"
                                maxTagCount="responsive"
                                className="min-w-[200px]"
                                value={filters.vendors}
                                onChange={(value) => handleFilterChange('vendors', value)}
                                options={vendors.map(v => ({ label: v, value: v }))}
                                allowClear
                            />

                            <Select
                                placeholder="Hình thức sản phẩm"
                                mode="multiple"
                                maxTagCount="responsive"
                                className="min-w-[200px]"
                                value={filters.types}
                                onChange={(value) => handleFilterChange('types', value)}
                                options={PTypeOptions}
                                allowClear
                            />

                            <Select
                                placeholder="Trạng thái"
                                mode="multiple"
                                maxTagCount="responsive"
                                className="min-w-[180px]"
                                value={filters.statuses}
                                onChange={(value) => handleFilterChange('statuses', value)}
                                options={PStatusOptions}
                                allowClear
                            />

                            <Select
                                placeholder="Danh mục"
                                mode="multiple"
                                maxTagCount="responsive"
                                className="min-w-[220px]"
                                value={filters.collection_ids}
                                onChange={(value) => handleFilterChange('collection_ids', value)}
                                options={collections.map(c => ({ label: c.name, value: c.id }))}
                                allowClear
                            />

                            <Button
                                icon={<Filter size={16} />}
                                onClick={handleAdvancedFilter}
                                className="relative"
                            >
                                Bộ lọc khác
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
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
                                {filters.vendors && filters.vendors?.length > 0 && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('vendors', [])}>
                                        Nhãn hiệu: {filters.vendors.join(', ')}
                                    </Tag>
                                )}
                                {filters.product_types && filters.product_types?.length > 0 && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('product_types', [])} className='word-wrap'>
                                        Loại: {filters.product_types.join(', ')}
                                    </Tag>
                                )}
                                {filters.types && filters.types?.length > 0 && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('types', [])}>
                                        Hình thức: {filters.types.map((type) => PTypeOptions.find((opt) => opt.value === type)?.label).filter(Boolean).join(', ') || 'Không có hình thức được chọn'}
                                    </Tag>
                                )}
                                {filters.statuses && filters.statuses?.length > 0 && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('statuses', [])}>
                                        Trạng thái: {filters.statuses
                                            .map((status) => PStatusOptions.find((opt) => opt.value === status)?.label)
                                            .filter(Boolean)
                                            .join(', ') || 'Không có trạng thái được chọn'}
                                    </Tag>
                                )}
                                {filters.tags && filters.tags?.length > 0 && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('tags', [])}>
                                        Tag: {filters.tags.join(', ')}
                                    </Tag>
                                )}
                                {filters.collection_ids && filters.collection_ids?.length > 0 && (
                                    <Tag
                                        closable
                                        color='blue'
                                        onClose={() => handleFilterChange('collection_ids', [])}
                                    >
                                        Danh mục:{' '}
                                        {filters.collection_ids
                                            .map(id => collections.find(c => c.id === id)?.name)
                                            .filter(Boolean)
                                            .join(', ')}
                                    </Tag>
                                )}
                                {filters.min_price !== undefined && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('min_price', undefined)}>
                                        Giá từ: {filters.min_price.toLocaleString('vi-VN')}₫
                                    </Tag>
                                )}
                                {filters.max_price !== undefined && (
                                    <Tag closable color='blue' onClose={() => handleFilterChange('max_price', undefined)}>
                                        Giá đến: {filters.max_price.toLocaleString('vi-VN')}₫
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
                            </div>
                        )}
                    </div>

                    {/* Table - Scrollable */}
                    <div className="flex-1 overflow-y-scroll">
                        <Table
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={products}
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
                            onChange={(pagination, filters, sorter, extra) => handleTableChange({
                                ...pagination,
                                current: pagination.current ?? 1,
                                pageSize: pagination.pageSize ?? 10,
                            })}
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

            {/* Filter Drawer */}
            <FilterDrawer
                open={openAdvancedFilter}
                onClose={() => setOpenAdvancedFilter(false)}
                onApplyFilter={handleApplyAdvancedFilter}
                initialFilters={filters}
            />
        </div>
    )
}

export default ProductListView