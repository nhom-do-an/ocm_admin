'use client'
import React, { useState, useEffect } from 'react'
import { Drawer, Button, Space, Collapse, Select, DatePicker, InputNumber } from 'antd'
import { ChevronRight } from 'lucide-react'
import dayjs from 'dayjs'
import { useProductList } from '@/containers/dashboard/product/hooks/use-product-list'
import { PStatusOptions, PTypeOptions } from '@/constants/constant'

const { Panel } = Collapse
const { RangePicker } = DatePicker

interface InternalFilters {
    store_id?: number;
    key?: string;
    tags?: string[];
    product_types?: string[];
    vendors?: string[];
    statuses?: string[];
    types?: string[];
    collection_ids?: number[];
    min_price?: number;
    max_price?: number;
    min_created_at?: string;
    max_created_at?: string;
    sort_field?: 'name' | 'price' | 'created_at';
    sort_type?: 'asc' | 'desc';
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface AdvancedFilterProps {
    open: boolean
    onClose: () => void
    onApplyFilter: (filters: InternalFilters) => void
    initialFilters?: InternalFilters
}

const FilterDrawer: React.FC<AdvancedFilterProps> = ({
    open,
    onClose,
    onApplyFilter,
    initialFilters = {}
}) => {
    const [filters, setFilters] = useState<InternalFilters>({})
    const { productTypes, vendors, tags } = useProductList()

    // Sync with initial filters when drawer opens
    useEffect(() => {
        if (open) {
            const parsedFilters: InternalFilters = { ...initialFilters }

            // Parse date strings to dayjs objects for RangePicker
            if (initialFilters.min_created_at && initialFilters.max_created_at) {
                const dateRange = [
                    dayjs(initialFilters.min_created_at, 'DD/MM/YYYY'),
                    dayjs(initialFilters.max_created_at, 'DD/MM/YYYY')
                ]
                parsedFilters.dateRange = dateRange as [dayjs.Dayjs, dayjs.Dayjs] | null
            }

            setFilters(parsedFilters)
        }
    }, [initialFilters, open])

    const handleClearAll = () => {
        setFilters({})
    }

    const handleApply = () => {
        const processedFilters: InternalFilters = { ...filters }

        // Convert date range to DD/MM/YYYY strings
        const dateRange = (filters as { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null }).dateRange
        if (dateRange?.[0] && dateRange?.[1]) {
            processedFilters.min_created_at = dateRange[0].format('DD/MM/YYYY')
            processedFilters.max_created_at = dateRange[1].format('DD/MM/YYYY')
            delete (processedFilters as { dateRange?: unknown }).dateRange
        }

        onApplyFilter(processedFilters)
        onClose()
    }

    const filterOptions = [
        {
            key: 'vendors',
            label: 'Nhãn hiệu',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn nhãn hiệu"
                    className="w-full"
                    value={filters.vendors}
                    onChange={(value) => setFilters({ ...filters, vendors: value })}
                    options={vendors.map(vendor => ({ label: vendor, value: vendor }))}
                    allowClear
                    notFoundContent="Không có nhãn hiệu nào"
                />
            ),
        },
        {
            key: 'product_types',
            label: 'Loại sản phẩm',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn loại sản phẩm"
                    className="w-full"
                    value={filters.product_types}
                    onChange={(value) => setFilters({ ...filters, product_types: value })}
                    options={productTypes.map(type => ({ label: type, value: type }))}
                    allowClear
                />
            ),
        },
        {
            key: 'types',
            label: 'Hình thức sản phẩm',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn hình thức sản phẩm"
                    className="w-full"
                    value={filters.types}
                    onChange={(value) => setFilters({ ...filters, types: value })}
                    options={PTypeOptions}
                    allowClear
                />
            ),
        },
        {
            key: 'statuses',
            label: 'Trạng thái',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn trạng thái"
                    className="w-full"
                    value={filters.statuses}
                    onChange={(value) => setFilters({ ...filters, statuses: value })}
                    options={PStatusOptions}
                    allowClear
                />
            ),
        },
        {
            key: 'tags',
            label: 'Tag',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn tag"
                    className="w-full"
                    value={filters.tags}
                    onChange={(value) => setFilters({ ...filters, tags: value })}
                    options={tags.map(tag => ({ label: tag, value: tag }))}
                    allowClear
                />
            ),
        },
        {
            key: 'price_range',
            label: 'Khoảng giá',
            content: (
                <Space direction="vertical" className="w-fulls">
                    <InputNumber
                        placeholder="Giá tối thiểu"
                        className="w-full"
                        value={filters.min_price}
                        onChange={(value) => setFilters({ ...filters, min_price: value || undefined })}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        min={0}
                    />
                    <InputNumber
                        placeholder="Giá tối đa"
                        className="w-full"
                        value={filters.max_price}
                        onChange={(value) => setFilters({ ...filters, max_price: value || undefined })}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                        min={0}
                    />
                </Space>
            ),
        },
        {
            key: 'dateRange',
            label: 'Ngày tạo',
            content: (
                <RangePicker
                    className="w-full"
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                    value={(filters as { dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null }).dateRange}
                    onChange={(dates) => setFilters({ ...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] | null })}
                />
            ),
        },
        {
            key: 'sort',
            label: 'Sắp xếp',
            content: (
                <Space direction="vertical" className="w-full">
                    <Select
                        placeholder="Sắp xếp theo"
                        className="w-full"
                        value={filters.sort_field}
                        onChange={(value) => setFilters({ ...filters, sort_field: value })}
                        options={[
                            { label: 'Tên sản phẩm', value: 'name' },
                            { label: 'Giá sản phẩm', value: 'price' },
                            { label: 'Ngày tạo', value: 'created_at' },
                        ]}
                        allowClear
                    />
                    <Select
                        placeholder="Thứ tự"
                        className="w-full"
                        value={filters.sort_type}
                        onChange={(value) => setFilters({ ...filters, sort_type: value })}
                        options={[
                            { label: 'Tăng dần', value: 'asc' },
                            { label: 'Giảm dần', value: 'desc' },
                        ]}
                        allowClear
                        disabled={!filters.sort_field}
                    />
                </Space>
            ),
        },
    ]

    return (
        <Drawer
            title="Bộ lọc nâng cao"
            placement="right"
            width={400}
            onClose={onClose}
            open={open}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={handleClearAll}>Xóa hết bộ lọc</Button>
                    <Button type="primary" onClick={handleApply}>
                        Áp dụng
                    </Button>
                </div>
            }
        >
            <Collapse
                bordered={false}
                expandIconPosition="end"
                defaultActiveKey={['vendors']}
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