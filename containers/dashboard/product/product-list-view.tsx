'use client'
import React from 'react'
import { Table, Button, Input, Select, Space, Dropdown, Image, Tag } from 'antd'
import { Search, Plus, Filter } from 'lucide-react'
import type { ColumnsType, } from 'antd/es/table'
import FilterDrawer from '@/components/FilterDrawer'
import { useProductList } from './hooks/use-product-list'

interface Product {
    id: string
    name: string
    image?: string
    availableStock: number
    category: string
    brand: string
    createdAt: string
    variants?: number
}

const ProductList: React.FC = () => {
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
        handleAddProduct,
        handleAdvancedFilter,
        handleApplyAdvancedFilter,
    } = useProductList()

    const columns: ColumnsType<Product> = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 350,
            render: (text: string, record: Product) => (
                <Space size="middle">
                    <Image
                        width={40}
                        height={40}
                        alt="Product Image"
                        src={record.image || 'error'}
                        fallback="data:image/png;base64,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"
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                    <div>
                        <a href="#" className="text-blue-600 hover:text-blue-800">{text}</a>
                        {record.variants && record.variants > 0 && (
                            <div className="text-xs text-gray-500">({record.variants} phiên bản)</div>
                        )}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Có thể bán',
            dataIndex: 'availableStock',
            key: 'availableStock',
            width: 150,
            align: 'center',
            render: (stock: number) => (
                <span className={stock <= 0 ? 'text-red-500' : 'text-gray-900'}>
                    {stock}
                </span>
            ),
        },
        {
            title: 'Loại',
            dataIndex: 'category',
            key: 'category',
            width: 150,
        },
        {
            title: 'Nhãn hiệu',
            dataIndex: 'brand',
            key: 'brand',
            width: 150,
        },
        {
            title: 'Ngày khởi tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            align: 'right',
        },
    ]

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    return (
        <div className="p-6 max-w-[1200px] mx-auto ">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Danh sách sản phẩm</h1>
                <Space>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'add',
                                    label: 'Thêm sản phẩm thường',
                                    onClick: handleAddProduct,
                                },
                                {
                                    key: 'add-combo',
                                    label: 'Thêm combo',
                                },
                            ],
                        }}
                        placement="bottomRight"
                    >
                        <Button type="primary" icon={<Plus size={16} />}>
                            Thêm sản phẩm
                        </Button>
                    </Dropdown>
                </Space>
            </div>

            <div className="bg-white shadow-md rounded-sm pt-5 pb-2">
                {/* Filters */}
                <div className="flex items-center gap-3 mb-4 px-5">
                    <Input
                        placeholder="Tìm kiếm theo mã sản phẩm, tên sản phẩm"
                        prefix={<Search size={16} />}
                        className="w-[400px]"
                        value={filters.searchText}
                        onChange={(e) => handleFilterChange('searchText', e.target.value)}
                    />
                    <Select
                        placeholder="Kênh bán hàng"
                        className="w-[200px]"
                        value={filters.channel || undefined}
                        onChange={(value) => handleFilterChange('channel', value)}
                        options={[
                            { label: 'Tất cả kênh', value: '' },
                            { label: 'Website', value: 'website' },
                            { label: 'Cửa hàng', value: 'store' },
                        ]}
                    />
                    <Select
                        placeholder="Loại sản phẩm"
                        className="w-[200px]"
                        value={filters.category || undefined}
                        onChange={(value) => handleFilterChange('category', value)}
                        options={[
                            { label: 'Tất cả loại', value: '' },
                            { label: 'Laptop', value: 'laptop' },
                            { label: 'Âm thanh', value: 'audio' },
                        ]}
                    />
                    <Select
                        placeholder="Tag"
                        className="w-[150px]"
                        value={filters.tag || undefined}
                        onChange={(value) => handleFilterChange('tag', value)}
                        options={[
                            { label: 'Tất cả tag', value: '' },
                            { label: 'Mới', value: 'new' },
                            { label: 'Hot', value: 'hot' },
                        ]}
                    />
                    <Button icon={<Filter size={16} />} onClick={handleAdvancedFilter}>
                        Bộ lọc khác
                    </Button>
                </div>

                {/* Table */}
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={products}
                    loading={loading}
                    className='!rounded-none !z-10'
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total, range) => `Từ ${range[0]} đến ${range[1]} trên tổng ${total}`,
                        position: ['bottomCenter'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                />

                {/* Advanced Filter Drawer */}
                <FilterDrawer
                    open={openAdvancedFilter}
                    onClose={() => setOpenAdvancedFilter(false)}
                    onApplyFilter={handleApplyAdvancedFilter}
                />
            </div>


        </div>
    )
}

export default ProductList