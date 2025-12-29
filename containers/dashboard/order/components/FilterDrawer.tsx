'use client'
import React, { useState, useEffect } from 'react'
import { Drawer, Button, Space, Collapse, Select, DatePicker, Input, Checkbox } from 'antd'
import { ChevronRight, Search } from 'lucide-react'
import dayjs from 'dayjs'
import { TChannelResponse } from '@/types/response/channel'
import { Customer } from '@/types/response/customer'
import { Variant } from '@/services/variant'
import { PaymentMethod } from '@/types/response/payment-method'
import { Source } from '@/types/response/source'
import {
    EOrderStatus,
    EFulfillmentOrderStatus,
    EFulfillmentShipmentStatus,
    EFinancialStatus,
} from '@/types/enums/enum'
import { Location } from '@/types/response/locations'

const { RangePicker } = DatePicker

interface InternalFilters {
    store_id?: number;
    key?: string;
    statuses?: string[];
    financial_statuses?: string[];
    fulfillment_statuses?: string[];
    delivery_statuses?: string[];
    channel_ids?: number[];
    source_ids?: number[];
    location_ids?: number[];
    customer_ids?: number[];
    variant_ids?: number[];
    payment_method_ids?: number[];
    assignee_ids?: number[];
    created_user_ids?: number[];
    print_status?: boolean;
    min_created_at?: string;
    max_created_at?: string;
    sort_field?: 'created_at' | 'order_name';
    sort_type?: 'asc' | 'desc';
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
    channelDateRange?: [dayjs.Dayjs, dayjs.Dayjs];
    customerSearch?: string;
    variantSearch?: string;
}

interface AdvancedFilterProps {
    open: boolean
    onClose: () => void
    onApplyFilter: (filters: InternalFilters) => void
    initialFilters?: InternalFilters
    channels: TChannelResponse[]
    customers: Customer[]
    variants: Variant[]
    paymentMethods: PaymentMethod[]
    sources: Source[]
    locations: Location[]
}

const FilterDrawer: React.FC<AdvancedFilterProps> = ({
    open,
    onClose,
    onApplyFilter,
    initialFilters = {},
    channels,
    customers,
    variants,
    paymentMethods,
    sources,
    locations
}) => {
    const [filters, setFilters] = useState<InternalFilters>({})
    const [customerSearchKey, setCustomerSearchKey] = useState('')
    const [variantSearchKey, setVariantSearchKey] = useState('')
    const [filterSearchKey, setFilterSearchKey] = useState('')

    // Sync with initial filters when drawer opens
    useEffect(() => {
        if (open) {
            const parsedFilters: InternalFilters = { ...initialFilters }

            // Parse date strings to dayjs objects for RangePicker
            if (initialFilters.min_created_at && initialFilters.max_created_at) {
                const dateRange: [dayjs.Dayjs, dayjs.Dayjs] = [
                    dayjs(initialFilters.min_created_at, 'DD/MM/YYYY'),
                    dayjs(initialFilters.max_created_at, 'DD/MM/YYYY')
                ]
                parsedFilters.dateRange = dateRange
            }

            setFilters(parsedFilters)
        }
    }, [initialFilters, open])

    const handleClearAll = () => {
        setFilters({})
        setCustomerSearchKey('')
        setVariantSearchKey('')
        setFilterSearchKey('')
    }

    const handleApply = () => {
        const processedFilters: InternalFilters = { ...filters }

        // Convert date range to DD/MM/YYYY strings
        if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
            processedFilters.min_created_at = filters.dateRange[0].format('DD/MM/YYYY')
            processedFilters.max_created_at = filters.dateRange[1].format('DD/MM/YYYY')
            delete processedFilters.dateRange
        }

        onApplyFilter(processedFilters)
        onClose()
    }

    const filteredCustomers = customers.filter(c =>
        !customerSearchKey ||
        c.email?.toLowerCase().includes(customerSearchKey.toLowerCase()) ||
        c.phone?.toLowerCase().includes(customerSearchKey.toLowerCase())
    )

    const filteredVariants = variants.filter(v =>
        !variantSearchKey ||
        v.product_name?.toLowerCase().includes(variantSearchKey.toLowerCase()) ||
        v.sku?.toLowerCase().includes(variantSearchKey.toLowerCase()) ||
        v.product_name?.toLowerCase().includes(variantSearchKey.toLowerCase())
    )

    const filterOptions = [
        {
            key: 'channel',
            label: 'Kênh bán hàng',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn kênh bán hàng"
                    className="w-full"
                    value={filters.channel_ids}
                    onChange={(value) => setFilters({ ...filters, channel_ids: value })}
                    options={channels.map(channel => ({ label: channel.name, value: channel.id }))}
                    allowClear
                    notFoundContent="Không có kênh nào"
                />
            ),
        },
        {
            key: 'dateRange',
            label: 'Ngày đặt hàng',
            content: (
                <RangePicker
                    className="w-full"
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                    value={filters.dateRange}
                    onChange={(dates) => {
                        const nextDateRange = dates && dates[0] && dates[1]
                            ? [dates[0], dates[1]] as [dayjs.Dayjs, dayjs.Dayjs]
                            : undefined
                        setFilters({ ...filters, dateRange: nextDateRange })
                    }}
                />
            ),
        },
        {
            key: 'location',
            label: 'Chi nhánh tạo đơn',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn chi nhánh"
                    className="w-full"
                    value={filters.location_ids}
                    onChange={(value) => setFilters({ ...filters, location_ids: value })}
                    options={locations.map(location => ({ label: location.name, value: location.id }))}
                    allowClear
                    notFoundContent="Không có chi nhánh nào"
                />
            ),
        },
        {
            key: 'customer',
            label: 'Khách hàng',
            content: (
                <Space direction="vertical" className="w-full">
                    <Input
                        placeholder="Tìm kiếm"
                        prefix={<Search size={16} className="text-gray-400" />}
                        value={customerSearchKey}
                        onChange={(e) => setCustomerSearchKey(e.target.value)}
                        allowClear
                    />
                    <Select
                        mode="multiple"
                        placeholder="Chọn khách hàng"
                        className="w-full"
                        value={filters.customer_ids}
                        onChange={(value) => setFilters({ ...filters, customer_ids: value })}
                        options={filteredCustomers.map(customer => ({
                            label: customer.email || customer.phone || `Khách hàng #${customer.id}`,
                            value: customer.id
                        }))}
                        allowClear
                        notFoundContent="Không có khách hàng nào"
                        showSearch={false}
                    />
                </Space>
            ),
        },
        {
            key: 'variant',
            label: 'Sản phẩm',
            content: (
                <Space direction="vertical" className="w-full">
                    <Input
                        placeholder="Tìm kiếm"
                        prefix={<Search size={16} className="text-gray-400" />}
                        value={variantSearchKey}
                        onChange={(e) => setVariantSearchKey(e.target.value)}
                        allowClear
                    />
                    <Select
                        mode="multiple"
                        placeholder="Chọn sản phẩm"
                        className="w-full"
                        value={filters.variant_ids}
                        onChange={(value) => setFilters({ ...filters, variant_ids: value })}
                        options={filteredVariants.map(variant => ({
                            label: variant.product_name || variant.sku || variant.product_name || `Sản phẩm #${variant.id}`,
                            value: variant.id
                        }))}
                        allowClear
                        notFoundContent="Không có sản phẩm nào"
                        showSearch={false}
                    />
                </Space>
            ),
        },
        {
            key: 'source',
            label: 'Nguồn đơn',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn nguồn đơn"
                    className="w-full"
                    value={filters.source_ids}
                    onChange={(value) => setFilters({ ...filters, source_ids: value })}
                    options={sources.map(source => ({ label: source.name || source.alias || `Nguồn #${source.id}`, value: source.id }))}
                    allowClear
                    notFoundContent="Không có nguồn đơn nào"
                />
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái đơn hàng',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn trạng thái"
                    className="w-full"
                    value={filters.statuses}
                    onChange={(value) => setFilters({ ...filters, statuses: value })}
                    options={[
                        { label: 'Đặt hàng', value: EOrderStatus.ORDERED },
                        { label: 'Đang giao dịch', value: EOrderStatus.CONFIRMED },
                        { label: 'Đã hoàn thành', value: EOrderStatus.COMPLETED },
                        { label: 'Đã hủy', value: EOrderStatus.CANCELLED },
                    ]}
                    allowClear
                />
            ),
        },
        {
            key: 'fulfillment_status',
            label: 'Trạng thái xử lý',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn trạng thái"
                    className="w-full"
                    value={filters.fulfillment_statuses}
                    onChange={(value) => setFilters({ ...filters, fulfillment_statuses: value })}
                    options={[
                        { label: 'Đã xử lý', value: EFulfillmentOrderStatus.FULFILLED },
                        { label: 'Chưa xử lý', value: EFulfillmentOrderStatus.PENDING },
                        { label: 'Hoàn thành một phần', value: EFulfillmentOrderStatus.PARTIALLY_FULFILLED },
                    ]}
                    allowClear
                />
            ),
        },

        {
            key: 'delivery_status',
            label: 'Trạng thái giao hàng',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn trạng thái"
                    className="w-full"
                    value={filters.delivery_statuses}
                    onChange={(value) => setFilters({ ...filters, delivery_statuses: value })}
                    options={[
                        { label: 'Chờ giao hàng', value: EFulfillmentShipmentStatus.PENDING },
                        { label: 'Đã lấy hàng', value: EFulfillmentShipmentStatus.PICKED_UP },
                        { label: 'Đang vận chuyển', value: EFulfillmentShipmentStatus.DELIVERING },
                        { label: 'Chờ giao lại', value: EFulfillmentShipmentStatus.RETRY_DELIVERY },
                        { label: 'Đang trả hàng', value: EFulfillmentShipmentStatus.RETURNING },
                        { label: 'Chờ xác nhận hoàn hàng', value: EFulfillmentShipmentStatus.WAIT_TO_CONFIRM },
                        { label: 'Đã giao hàng', value: EFulfillmentShipmentStatus.DELIVERED },
                        { label: 'Đã trả hàng', value: EFulfillmentShipmentStatus.RETURNED },
                        { label: 'Đã hủy', value: EFulfillmentShipmentStatus.CANCELLED },
                    ]}
                    allowClear
                />
            ),
        },
        {
            key: 'financial_status',
            label: 'Trạng thái thanh toán',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn trạng thái"
                    className="w-full"
                    value={filters.financial_statuses}
                    onChange={(value) => setFilters({ ...filters, financial_statuses: value })}
                    options={[
                        { label: 'Chưa thanh toán', value: EFinancialStatus.UNPAID },
                        { label: 'Thanh toán một phần', value: EFinancialStatus.PARTIALLY_PAID },
                        { label: 'Đã thanh toán', value: EFinancialStatus.PAID },
                        { label: 'Hoàn tiền một phần', value: EFinancialStatus.PARTIALLY_REFUNDED },
                        { label: 'Đã hoàn tiền', value: EFinancialStatus.REFUNDED },
                    ]}
                    allowClear
                />
            ),
        },
        {
            key: 'payment_method',
            label: 'Phương thức thanh toán',
            content: (
                <Select
                    mode="multiple"
                    placeholder="Chọn phương thức thanh toán"
                    className="w-full"
                    value={filters.payment_method_ids}
                    onChange={(value) => setFilters({ ...filters, payment_method_ids: value })}
                    options={paymentMethods.map(method => ({ label: method.name || `Phương thức #${method.id}`, value: method.id }))}
                    allowClear
                    notFoundContent="Không có phương thức nào"
                />
            ),
        },
        {
            key: 'print_status',
            label: 'Trạng thái in',
            content: (
                <Checkbox
                    checked={filters.print_status === true}
                    onChange={(e) => setFilters({ ...filters, print_status: e.target.checked ? true : undefined })}
                >
                    Đã in
                </Checkbox>
            ),
        },
    ]

    const filteredOptions = filterOptions.filter(option =>
        !filterSearchKey || option.label.toLowerCase().includes(filterSearchKey.toLowerCase())
    )

    return (
        <Drawer
            title="Bộ lọc khác"
            placement="right"
            width={400}
            onClose={onClose}
            open={open}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={handleClearAll} danger>Xóa bộ lọc</Button>
                    <Button type="primary" onClick={handleApply}>
                        Lọc
                    </Button>
                </div>
            }
        >
            <div className="mb-4">
                <Input
                    placeholder="Tìm kiếm"
                    prefix={<Search size={16} className="text-gray-400" />}
                    value={filterSearchKey}
                    onChange={(e) => setFilterSearchKey(e.target.value)}
                    allowClear
                />
            </div>
            <Collapse
                bordered={false}
                expandIconPosition="end"
                defaultActiveKey={['channel', 'dateRange']}
                expandIcon={({ isActive }) => (
                    <ChevronRight
                        size={16}
                        style={{
                            transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                        }}
                    />
                )}
                className="bg-transparent"
                items={filteredOptions.map((option) => ({
                    key: option.key,
                    label: option.label,
                    children: (
                        <div className="py-2">
                            {option.content}
                        </div>
                    ),
                    className: '!bg-transparent !border-b !border-gray-100',
                }))}
            />
        </Drawer>
    )
}

export default FilterDrawer

