
'use client'
import React, { useState } from 'react'
import { Drawer, Button, Space, Collapse, Radio, DatePicker, Select, } from 'antd'
import { ChevronRight } from 'lucide-react'
import type { Dayjs } from 'dayjs'

const { Panel } = Collapse
const { RangePicker } = DatePicker

interface AdvancedFilterProps {
    open: boolean
    onClose: () => void
    onApplyFilter: (filters: FilterValues) => void
}

interface FilterValues {
    brand?: string[]
    createdDate?: [Dayjs | null, Dayjs | null] | null
    channel?: string
    priceGroup?: string
    customerGroup?: string
    category?: string[]
    categoryType?: string[]
    tag?: string[]
    productType?: string
    productLo?: string
}

const FilterDrawer: React.FC<AdvancedFilterProps> = ({ open, onClose, onApplyFilter }) => {
    const [filters, setFilters] = useState<FilterValues>({})

    const handleClearAll = () => {
        setFilters({})
    }

    const handleApply = () => {
        onApplyFilter(filters)
        onClose()
    }

    const filterOptions = [
        {
            key: 'brand',
            label: 'Nhãn hiệu',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn nhãn hiệu"
                    className="w-full"
                    value={filters.brand}
                    onChange={(value) => setFilters({ ...filters, brand: value })}
                    options={[
                        { label: 'Apple', value: 'apple' },
                        { label: 'Samsung', value: 'samsung' },
                        { label: 'Sony', value: 'sony' },
                        { label: 'LG', value: 'lg' },
                    ]}
                />
            ),
        },
        {
            key: 'createdDate',
            label: 'Ngày tạo',
            content: (
                <RangePicker
                    className="w-full"
                    placeholder={['Từ ngày', 'Đến ngày']}
                    value={filters.createdDate}
                    onChange={(dates) => setFilters({ ...filters, createdDate: dates })}
                />
            ),
        },
        {
            key: 'channel',
            label: 'Kênh bán hàng',
            content: (
                <Radio.Group
                    className="w-full"
                    value={filters.channel}
                    onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
                >
                    <Space direction="vertical" className="w-full">
                        <Radio value="all">Tất cả kênh</Radio>
                        <Radio value="website">Website</Radio>
                        <Radio value="store">Cửa hàng</Radio>
                        <Radio value="marketplace">Sàn TMĐT</Radio>
                    </Space>
                </Radio.Group>
            ),
        },
        {
            key: 'priceGroup',
            label: 'Bảng giá theo chi nhánh',
            content: (
                <Select
                    placeholder="Chọn bảng giá"
                    className="w-full"
                    value={filters.priceGroup}
                    onChange={(value) => setFilters({ ...filters, priceGroup: value })}
                    options={[
                        { label: 'Bảng giá mặc định', value: 'default' },
                        { label: 'Bảng giá chi nhánh 1', value: 'branch1' },
                        { label: 'Bảng giá chi nhánh 2', value: 'branch2' },
                    ]}
                />
            ),
        },
        {
            key: 'customerGroup',
            label: 'Bảng giá theo nhóm khách hàng',
            content: (
                <Select
                    placeholder="Chọn nhóm khách hàng"
                    className="w-full"
                    value={filters.customerGroup}
                    onChange={(value) => setFilters({ ...filters, customerGroup: value })}
                    options={[
                        { label: 'Khách lẻ', value: 'retail' },
                        { label: 'Khách sỉ', value: 'wholesale' },
                        { label: 'Khách VIP', value: 'vip' },
                    ]}
                />
            ),
        },
        {
            key: 'category',
            label: 'Danh mục',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn danh mục"
                    className="w-full"
                    value={filters.category}
                    onChange={(value) => setFilters({ ...filters, category: value })}
                    options={[
                        { label: 'Điện thoại', value: 'phone' },
                        { label: 'Laptop', value: 'laptop' },
                        { label: 'Tablet', value: 'tablet' },
                        { label: 'Phụ kiện', value: 'accessory' },
                    ]}
                />
            ),
        },
        {
            key: 'categoryType',
            label: 'Loại sản phẩm',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn loại sản phẩm"
                    className="w-full"
                    value={filters.categoryType}
                    onChange={(value) => setFilters({ ...filters, categoryType: value })}
                    options={[
                        { label: 'Sản phẩm thường', value: 'normal' },
                        { label: 'Sản phẩm combo', value: 'combo' },
                        { label: 'Sản phẩm dịch vụ', value: 'service' },
                    ]}
                />
            ),
        },
        {
            key: 'tag',
            label: 'Tag',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn tag"
                    className="w-full"
                    value={filters.tag}
                    onChange={(value) => setFilters({ ...filters, tag: value })}
                    options={[
                        { label: 'Mới', value: 'new' },
                        { label: 'Hot', value: 'hot' },
                        { label: 'Giảm giá', value: 'sale' },
                        { label: 'Hết hàng', value: 'out-of-stock' },
                    ]}
                />
            ),
        },
        {
            key: 'productType',
            label: 'Hình thức sản phẩm',
            content: (
                <Radio.Group
                    className="w-full"
                    value={filters.productType}
                    onChange={(e) => setFilters({ ...filters, productType: e.target.value })}
                >
                    <Space direction="vertical" className="w-full">
                        <Radio value="all">Tất cả</Radio>
                        <Radio value="physical">Sản phẩm vật lý</Radio>
                        <Radio value="digital">Sản phẩm số</Radio>
                    </Space>
                </Radio.Group>
            ),
        },
        {
            key: 'productLo',
            label: 'Sản phẩm lô - HSD',
            content: (
                <Radio.Group
                    className="w-full"
                    value={filters.productLo}
                    onChange={(e) => setFilters({ ...filters, productLo: e.target.value })}
                >
                    <Space direction="vertical" className="w-full">
                        <Radio value="all">Tất cả</Radio>
                        <Radio value="with-expiry">Có hạn sử dụng</Radio>
                        <Radio value="without-expiry">Không có hạn sử dụng</Radio>
                    </Space>
                </Radio.Group>
            ),
        },
    ]

    return (
        <Drawer
            title="Bộ lọc khác"
            placement="right"
            width={400}
            onClose={onClose}
            open={open}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={handleClearAll}>Xóa hết bộ lọc</Button>
                    <Button type="primary" onClick={handleApply}>
                        Lọc
                    </Button>
                </div>
            }
        >
            <Collapse
                bordered={false}
                expandIconPosition="end"
                expandIcon={({ isActive }) => (
                    <ChevronRight
                        size={16}
                        style={{
                            transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }}
                    />
                )}
                className="bg-white"
            >
                {filterOptions.map((option) => (
                    <Panel
                        header={option.label}
                        key={option.key}
                        className="border-b"
                    >
                        <div className="py-2">
                            {option.content}
                        </div>
                    </Panel>
                ))}
            </Collapse>
        </Drawer>
    )
}

export default FilterDrawer