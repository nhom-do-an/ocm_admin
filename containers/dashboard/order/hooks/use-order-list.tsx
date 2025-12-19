'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import orderService from '@/services/order'
import { GetListOrdersRequest } from '@/types/request/order'
import { OrderDetail } from '@/types/response/order'
import { useLoader } from '@/hooks/useGlobalLoader'
import channelService from '@/services/channel'
import variantService from '@/services/variant'
import { TChannelResponse } from '@/types/response/channel'
import { Customer } from '@/types/response/customer'
import { Variant } from '@/services/variant'
import paymentService from '@/services/payment-method'
import { PaymentMethod } from '@/types/response/payment-method'
import customerService from '@/services/customer'
import sourceService from '@/services/source'
import { Source } from '@/types/response/source'
import locationService from '@/services/location'
import { Location } from '@/types/response/locations'
import { EFulfillmentStatus, ELocationStatus } from '@/types/enums/enum'
import type { TablePaginationConfig } from 'antd/es/table'

// Interface for internal state (arrays)
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
}

export const useOrderList = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [orders, setOrders] = useState<OrderDetail[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    })
    const [filters, setFilters] = useState<InternalFilters>({})
    const [channels, setChannels] = useState<TChannelResponse[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [variants, setVariants] = useState<Variant[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [sources, setSources] = useState<Source[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const { startLoading, stopLoading } = useLoader();

    // 📌 Parse params từ URL khi khởi tạo
    useEffect(() => {
        const params: InternalFilters = {}

        // Parse pagination
        const page = searchParams.get('page')
        const limit = searchParams.get('limit')
        if (page) setPagination(prev => ({ ...prev, current: parseInt(page) }))
        if (limit) setPagination(prev => ({ ...prev, pageSize: parseInt(limit) }))

        // Parse string filters
        const key = searchParams.get('key')
        if (key) params.key = key

        // Parse comma-separated strings to arrays
        const statuses = searchParams.get('statuses')
        const financial_statuses = searchParams.get('financial_statuses')
        const fulfillment_statuses = searchParams.get('fulfillment_statuses')
        const delivery_statuses = searchParams.get('delivery_statuses')
        const channel_ids = searchParams.get('channel_ids')
        const source_ids = searchParams.get('source_ids')
        const location_ids = searchParams.get('location_ids')
        const customer_ids = searchParams.get('customer_ids')
        const variant_ids = searchParams.get('variant_ids')
        const payment_method_ids = searchParams.get('payment_method_ids')
        const assignee_ids = searchParams.get('assignee_ids')
        const created_user_ids = searchParams.get('created_user_ids')
        const print_status = searchParams.get('print_status')

        if (statuses) params.statuses = statuses.split(',')
        if (financial_statuses) params.financial_statuses = financial_statuses.split(',')
        if (fulfillment_statuses) params.fulfillment_statuses = fulfillment_statuses.split(',')
        if (delivery_statuses) params.delivery_statuses = delivery_statuses.split(',')
        if (channel_ids) params.channel_ids = channel_ids.split(',').map(id => parseInt(id))
        if (source_ids) params.source_ids = source_ids.split(',').map(id => parseInt(id))
        if (location_ids) params.location_ids = location_ids.split(',').map(id => parseInt(id))
        if (customer_ids) params.customer_ids = customer_ids.split(',').map(id => parseInt(id))
        if (variant_ids) params.variant_ids = variant_ids.split(',').map(id => parseInt(id))
        if (payment_method_ids) params.payment_method_ids = payment_method_ids.split(',').map(id => parseInt(id))
        if (assignee_ids) params.assignee_ids = assignee_ids.split(',').map(id => parseInt(id))
        if (created_user_ids) params.created_user_ids = created_user_ids.split(',').map(id => parseInt(id))
        if (print_status) params.print_status = print_status === 'true'

        // Parse date range
        const min_created_at = searchParams.get('min_created_at')
        const max_created_at = searchParams.get('max_created_at')
        if (min_created_at) params.min_created_at = min_created_at
        if (max_created_at) params.max_created_at = max_created_at

        // Parse sorting
        const sort_field = searchParams.get('sort_field')
        const sort_type = searchParams.get('sort_type')
        if (sort_field) params.sort_field = sort_field as 'created_at' | 'order_name'
        if (sort_type) params.sort_type = sort_type as 'asc' | 'desc'

        setFilters(params)
    }, [])

    // 📌 Convert arrays to comma-separated strings for API
    const prepareRequestParams = (internalFilters: InternalFilters): GetListOrdersRequest => {
        const apiParams: GetListOrdersRequest = {
            page: pagination.current,
            limit: pagination.pageSize,
        }

        if (internalFilters.key) apiParams.key = internalFilters.key
        if (internalFilters.store_id) apiParams.store_id = internalFilters.store_id

        // Convert arrays
        if (internalFilters.statuses?.length) {
            apiParams.statuses = internalFilters.statuses
        }
        if (internalFilters.financial_statuses?.length) {
            apiParams.financial_statuses = internalFilters.financial_statuses
        }
        if (internalFilters.fulfillment_statuses?.length) {
            apiParams.fulfillment_statuses = internalFilters.fulfillment_statuses
        }
        if (internalFilters.channel_ids?.length) {
            apiParams.channel_ids = internalFilters.channel_ids
        }
        if (internalFilters.source_ids?.length) {
            apiParams.source_ids = internalFilters.source_ids
        }
        if (internalFilters.location_ids?.length) {
            apiParams.location_ids = internalFilters.location_ids
        }
        if (internalFilters.customer_ids?.length) {
            apiParams.customer_ids = internalFilters.customer_ids
        }
        if (internalFilters.variant_ids?.length) {
            apiParams.variant_ids = internalFilters.variant_ids
        }
        if (internalFilters.payment_method_ids?.length) {
            apiParams.payment_method_ids = internalFilters.payment_method_ids
        }
        if (internalFilters.assignee_ids?.length) {
            apiParams.assignee_ids = internalFilters.assignee_ids
        }
        if (internalFilters.created_user_ids?.length) {
            apiParams.created_user_ids = internalFilters.created_user_ids
        }
        if (internalFilters.delivery_statuses?.length) {
            apiParams.delivery_statuses = internalFilters.delivery_statuses
        }
        if (internalFilters.print_status !== undefined) {
            apiParams.print_status = internalFilters.print_status
        }

        // Date range - convert DD/MM/YYYY to timestamp
        if (internalFilters.min_created_at) {
            const [day, month, year] = internalFilters.min_created_at.split('/')
            apiParams.min_created_at = new Date(`${year}-${month}-${day}`).getTime() / 1000
        }
        if (internalFilters.max_created_at) {
            const [day, month, year] = internalFilters.max_created_at.split('/')
            // Set to end of day (23:59:59)
            apiParams.max_created_at = new Date(`${year}-${month}-${day}T23:59:59`).getTime() / 1000
        }

        // Sorting
        if (internalFilters.sort_field) apiParams.sort_field = internalFilters.sort_field
        if (internalFilters.sort_type) apiParams.sort_type = internalFilters.sort_type

        return apiParams
    }

    const updateURLParams = (newFilters: InternalFilters, newPagination?: TablePaginationConfig) => {
        const params = new URLSearchParams()

        // Add pagination
        const currentPage = newPagination?.current || pagination.current
        const currentPageSize = newPagination?.pageSize || pagination.pageSize
        params.set('page', currentPage.toString())
        params.set('limit', currentPageSize.toString())

        // Add string filters
        if (newFilters.key) params.set('key', newFilters.key)

        if (newFilters.statuses?.length) params.set('statuses', newFilters.statuses.join(','))
        if (newFilters.financial_statuses?.length) params.set('financial_statuses', newFilters.financial_statuses.join(','))
        if (newFilters.fulfillment_statuses?.length) params.set('fulfillment_statuses', newFilters.fulfillment_statuses.join(','))
        if (newFilters.channel_ids?.length) params.set('channel_ids', newFilters.channel_ids.join(','))
        if (newFilters.source_ids?.length) params.set('source_ids', newFilters.source_ids.join(','))
        if (newFilters.location_ids?.length) params.set('location_ids', newFilters.location_ids.join(','))
        if (newFilters.customer_ids?.length) params.set('customer_ids', newFilters.customer_ids.join(','))
        if (newFilters.variant_ids?.length) params.set('variant_ids', newFilters.variant_ids.join(','))
        if (newFilters.payment_method_ids?.length) params.set('payment_method_ids', newFilters.payment_method_ids.join(','))
        if (newFilters.assignee_ids?.length) params.set('assignee_ids', newFilters.assignee_ids.join(','))
        if (newFilters.created_user_ids?.length) params.set('created_user_ids', newFilters.created_user_ids.join(','))
        if (newFilters.delivery_statuses?.length) params.set('delivery_statuses', newFilters.delivery_statuses.join(','))
        if (newFilters.print_status !== undefined) params.set('print_status', newFilters.print_status.toString())

        // Add date range
        if (newFilters.min_created_at) params.set('min_created_at', newFilters.min_created_at)
        if (newFilters.max_created_at) params.set('max_created_at', newFilters.max_created_at)

        // Add sorting
        if (newFilters.sort_field) params.set('sort_field', newFilters.sort_field)
        if (newFilters.sort_type) params.set('sort_type', newFilters.sort_type)

        router.push(`?${params.toString()}`, { scroll: false })
    }

    const fetchOrders = async () => {
        startLoading()
        setLoading(true)
        try {
            const requestParams = prepareRequestParams(filters)
            const response = await orderService.getListOrders(requestParams)
            setOrders(response.orders || [])
            setPagination((prev) => ({ ...prev, total: response.count || 0 }))
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            stopLoading()
            setLoading(false)
        }
    }

    // 📌 Khi chọn dòng
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    // 📌 Khi đổi trang hoặc kích thước bảng
    const handleTableChange = (newPagination: TablePaginationConfig) => {
        const updatedPagination = {
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }
        setPagination(updatedPagination)
        updateURLParams(filters, updatedPagination)
    }

    const handleFilterChange = (key: keyof InternalFilters, value: string | number | string[] | undefined) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        const newPagination = { current: 1, pageSize: pagination.pageSize }
        setPagination((prev) => ({ ...prev, current: 1 }))
        updateURLParams(newFilters, newPagination)
    }

    const handleMultipleFilterChange = (updates: Partial<InternalFilters>) => {
        const newFilters = { ...filters, ...updates }
        setFilters(newFilters)
        const newPagination = { current: 1, pageSize: pagination.pageSize }
        setPagination((prev) => ({ ...prev, current: 1 }))
        updateURLParams(newFilters, newPagination)
    }

    // 📌 Clear all filters
    const handleClearFilters = () => {
        setFilters({})
        setPagination((prev) => ({ ...prev, current: 1 }))
        router.push('?page=1&limit=20', { scroll: false })
    }

    // Load filter options
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [channelsRes, customersRes, variantsRes, paymentMethodsRes, sourcesRes, locationsRes] = await Promise.all([
                    channelService.getListChannel(),
                    customerService.getListCustomers({ limit: 1000 }),
                    variantService.getListVariants({ limit: 1000 }),
                    paymentService.getListPaymentMethods({ limit: 1000 }),
                    sourceService.getListSources(),
                    locationService.getListLocations({ inventory_management: true, status: ELocationStatus.ACTIVE }),
                ])
                setChannels(channelsRes || [])
                setCustomers(customersRes.customers || [])
                setVariants(variantsRes.variants || [])
                setPaymentMethods(paymentMethodsRes || [])
                setSources(sourcesRes || [])
                setLocations(locationsRes.locations || [])

            } catch (error) {
                console.error('Error loading filter options:', error)
            }
        }
        loadFilterOptions()
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [pagination.current, pagination.pageSize, filters])

    return {
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
        handleApplyAdvancedFilter: (filterValues: InternalFilters) => {
            setFilters(filterValues)
            const newPagination = { current: 1, pageSize: pagination.pageSize }
            setPagination((prev) => ({ ...prev, current: 1 }))
            updateURLParams(filterValues, newPagination)
        },
        fetchOrders,
    }
}

