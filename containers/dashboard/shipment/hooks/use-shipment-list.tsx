'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import shipmentService from '@/services/shipment'
import { GetListShipmentsRequest } from '@/types/response/shipment'
import { ShipmentDetail } from '@/types/response/shipment'
import { useLoader } from '@/hooks/useGlobalLoader'
import locationService from '@/services/location'
import { Location } from '@/types/response/locations'
import { ELocationStatus } from '@/types/enums/enum'
import type { TablePaginationConfig } from 'antd/es/table'

interface InternalFilters {
    key?: string;
    order_id?: number;
    location_ids?: number[];
    statuses?: string[];
    min_created_at?: string;
    max_created_at?: string;
}

export const useShipmentList = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [shipments, setShipments] = useState<ShipmentDetail[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    })
    const [filters, setFilters] = useState<InternalFilters>({})
    const [locations, setLocations] = useState<Location[]>([])
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

        const order_id = searchParams.get('order_id')
        if (order_id) params.order_id = parseInt(order_id)

        // Parse comma-separated strings to arrays
        const statuses = searchParams.get('statuses')
        const location_ids = searchParams.get('location_ids')

        if (statuses) params.statuses = statuses.split(',')
        if (location_ids) params.location_ids = location_ids.split(',').map(id => parseInt(id))

        // Parse date range
        const min_created_at = searchParams.get('min_created_at')
        const max_created_at = searchParams.get('max_created_at')
        if (min_created_at) params.min_created_at = min_created_at
        if (max_created_at) params.max_created_at = max_created_at

        setFilters(params)
    }, [])

    // Convert arrays to comma-separated strings for API
    const prepareRequestParams = (internalFilters: InternalFilters): GetListShipmentsRequest => {
        const apiParams: GetListShipmentsRequest = {
            page: pagination.current,
            size: pagination.pageSize,
        }

        if (internalFilters.key) apiParams.key = internalFilters.key
        if (internalFilters.order_id) apiParams.order_id = internalFilters.order_id

        if (internalFilters.location_ids?.length) {
            apiParams.location_ids = internalFilters.location_ids
        }
        if (internalFilters.statuses?.length) {
            apiParams.statuses = internalFilters.statuses
        }

        // Convert date strings (DD/MM/YYYY) to timestamps
        if (internalFilters.min_created_at) {
            const [day, month, year] = internalFilters.min_created_at.split('/')
            const date = new Date(`${year}-${month}-${day}`)
            apiParams.min_created_at = Math.floor(date.getTime() / 1000)
        }
        if (internalFilters.max_created_at) {
            const [day, month, year] = internalFilters.max_created_at.split('/')
            // Set to end of day (23:59:59)
            const date = new Date(`${year}-${month}-${day}T23:59:59`)
            apiParams.max_created_at = Math.floor(date.getTime() / 1000)
        }

        return apiParams
    }

    // Fetch shipments
    const fetchShipments = async (currentFilters: InternalFilters) => {
        setLoading(true)
        startLoading()
        try {
            const apiParams = prepareRequestParams(currentFilters)
            const response = await shipmentService.getListShipments(apiParams)
            setShipments(response.shipments || [])
            setPagination(prev => ({
                ...prev,
                total: response.count || 0,
            }))
        } catch (error) {
            console.error('Error fetching shipments:', error)
        } finally {
            setLoading(false)
            stopLoading()
        }
    }

    // Fetch locations
    const fetchLocations = async () => {
        try {
            const response = await locationService.getListLocations({
                status: ELocationStatus.ACTIVE,
            })
            setLocations(response.locations || [])
        } catch (error) {
            console.error('Error fetching locations:', error)
        }
    }

    // Initial fetch
    useEffect(() => {
        fetchLocations()
    }, [])

    useEffect(() => {
        fetchShipments(filters)
    }, [pagination.current, pagination.pageSize, filters])

    // Update URL with current filters
    const updateURL = (newFilters: InternalFilters) => {
        const params = new URLSearchParams()
        params.set('page', pagination.current.toString())
        params.set('size', pagination.pageSize.toString())

        if (newFilters.key) params.set('key', newFilters.key)
        if (newFilters.order_id) params.set('order_id', newFilters.order_id.toString())
        if (newFilters.statuses?.length) params.set('statuses', newFilters.statuses.join(','))
        if (newFilters.location_ids?.length) params.set('location_ids', newFilters.location_ids.join(','))
        if (newFilters.min_created_at) params.set('min_created_at', newFilters.min_created_at)
        if (newFilters.max_created_at) params.set('max_created_at', newFilters.max_created_at)

        router.push(`?${params.toString()}`, { scroll: false })
    }

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        setPagination({
            current: newPagination.current ?? pagination.current,
            pageSize: newPagination.pageSize ?? pagination.pageSize,
            total: pagination.total,
        })
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', (newPagination.current ?? pagination.current).toString())
        params.set('size', (newPagination.pageSize ?? pagination.pageSize).toString())
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const handleFilterChange = (key: keyof InternalFilters, value: string | number | undefined) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        setPagination(prev => ({ ...prev, current: 1 }))
        updateURL(newFilters)
    }

    const handleMultipleFilterChange = (newFilters: Partial<InternalFilters>) => {
        const updatedFilters = { ...filters, ...newFilters }
        setFilters(updatedFilters)
        setPagination(prev => ({ ...prev, current: 1 }))
        updateURL(updatedFilters)
    }

    const handleClearFilters = () => {
        const emptyFilters: InternalFilters = {}
        setFilters(emptyFilters)
        setPagination(prev => ({ ...prev, current: 1 }))
        router.push('?page=1&size=20', { scroll: false })
    }

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    return {
        shipments,
        loading,
        selectedRowKeys,
        pagination,
        filters,
        locations,
        onSelectChange,
        handleTableChange,
        handleFilterChange,
        handleMultipleFilterChange,
        handleClearFilters,
    }
}

