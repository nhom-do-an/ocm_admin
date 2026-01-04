'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import customerService from '@/services/customer'
import { GetListCustomersRequest } from '@/types/request/customer'
import { Customer } from '@/types/response/customer'
import { useLoader } from '@/hooks/useGlobalLoader'
import type { TablePaginationConfig } from 'antd/es/table'

// Interface for internal state
interface InternalFilters {
    store_id?: number;
    key?: string;
    status?: 'enabled' | 'disabled';
    sort_field?: 'name' | 'created_at';
    sort_type?: 'asc' | 'desc';
}

export const useCustomerList = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    })
    const [filters, setFilters] = useState<InternalFilters>({})
    const { startLoading, stopLoading } = useLoader();

    // Parse params từ URL khi khởi tạo
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

        const status = searchParams.get('status')
        if (status) params.status = status as 'enabled' | 'disabled'

        // Parse sorting
        const sort_field = searchParams.get('sort_field')
        const sort_type = searchParams.get('sort_type')
        if (sort_field) params.sort_field = sort_field as 'name' | 'created_at'
        if (sort_type) params.sort_type = sort_type as 'asc' | 'desc'

        setFilters(params)
    }, [])

    // Convert filters to API request params
    const prepareRequestParams = (internalFilters: InternalFilters): GetListCustomersRequest => {
        const apiParams: GetListCustomersRequest = {
            page: pagination.current,
            limit: pagination.pageSize,
        }

        if (internalFilters.key) apiParams.key = internalFilters.key
        if (internalFilters.store_id) apiParams.store_id = internalFilters.store_id
        if (internalFilters.status) apiParams.status = internalFilters.status

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
        if (newFilters.status) params.set('status', newFilters.status)

        // Add sorting
        if (newFilters.sort_field) params.set('sort_field', newFilters.sort_field)
        if (newFilters.sort_type) params.set('sort_type', newFilters.sort_type)

        router.push(`?${params.toString()}`, { scroll: false })
    }

    const fetchCustomers = async () => {
        startLoading()
        setLoading(true)
        try {
            const requestParams = prepareRequestParams(filters)
            const response = await customerService.getListCustomers(requestParams)
            setCustomers(response.customers || [])
            setPagination((prev) => ({ ...prev, total: response.count || 0 }))
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            stopLoading()
            setLoading(false)
        }
    }

    // Khi chọn dòng
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    // Khi đổi trang hoặc kích thước bảng
    const handleTableChange = (newPagination: TablePaginationConfig) => {
        const updatedPagination = {
            ...pagination,
            current: newPagination.current ?? pagination.current,
            pageSize: newPagination.pageSize ?? pagination.pageSize,
        }
        setPagination(updatedPagination)
        updateURLParams(filters, updatedPagination)
    }

    const handleFilterChange = (key: keyof InternalFilters, value: string | number | 'enabled' | 'disabled' | 'asc' | 'desc' | undefined) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        const newPagination = { current: 1, pageSize: pagination.pageSize }
        setPagination((prev) => ({ ...prev, current: 1 }))
        updateURLParams(newFilters, newPagination)
    }

    // Clear all filters
    const handleClearFilters = () => {
        setFilters({})
        setPagination((prev) => ({ ...prev, current: 1 }))
        router.push('?page=1&limit=20', { scroll: false })
    }

    useEffect(() => {
        fetchCustomers()
    }, [pagination.current, pagination.pageSize, filters])

    return {
        customers,
        loading,
        selectedRowKeys,
        pagination,
        filters,
        onSelectChange,
        handleTableChange,
        handleFilterChange,
        handleClearFilters,
        fetchCustomers,
    }
}







