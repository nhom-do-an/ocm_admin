'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLoader } from '@/hooks/useGlobalLoader'
import { Collection } from '@/types/response/collection'
import collectionService from '@/services/collection'
import type { TablePaginationConfig } from 'antd/es/table'

interface InternalFilters {
    store_id?: number;
    key?: string;
}

export const useCollectionList = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [collections, setCollections] = useState<Collection[]>([])

    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    })
    const [filters, setFilters] = useState<InternalFilters>({})
    const [initialized, setInitialized] = useState(false)
    const { startLoading, stopLoading } = useLoader();


    useEffect(() => {
        const params: InternalFilters = {}

        // Parse pagination
        const page = searchParams.get('page')
        const limit = searchParams.get('limit')
        if (page) {
            const pageNum = parseInt(page)
            if (!isNaN(pageNum)) {
                setPagination(prev => ({ ...prev, current: pageNum }))
            }
        }
        if (limit) {
            const sizeNum = parseInt(limit)
            if (!isNaN(sizeNum)) {
                setPagination(prev => ({ ...prev, pageSize: sizeNum }))
            }
        }

        // Parse string filters
        const key = searchParams.get('key')
        if (key) params.key = key

        setFilters(params)
        setInitialized(true)
    }, [searchParams])


    const updateURLParams = (newFilters: InternalFilters, newPagination?: TablePaginationConfig) => {
        const params = new URLSearchParams()

        // Add pagination
        const currentPage = newPagination?.current || pagination.current
        const currentPageSize = newPagination?.pageSize || pagination.pageSize
        params.set('page', currentPage.toString())
        params.set('limit', currentPageSize.toString())

        // Add string filters
        if (newFilters.key) params.set('key', newFilters.key)

        router.push(`?${params.toString()}`, { scroll: false })
    }

    const fetchCollections = async () => {
        startLoading()
        setLoading(true)
        try {
            const response = await collectionService.getCollections({
                page: pagination.current,
                size: pagination.pageSize,
                key: filters.key,
            })
            setCollections(response.collections || [])
            setPagination((prev) => ({ ...prev, total: response.count || 0 }))
        } catch (error) {
            console.error('Error fetching collections:', error)
        } finally {
            stopLoading()
            setLoading(false)
        }
    }


    const handleTableChange = (newPagination: TablePaginationConfig) => {
        const updatedPagination = {
            ...pagination,
            current: newPagination.current ?? pagination.current,
            pageSize: newPagination.pageSize ?? pagination.pageSize,
        }
        setPagination(updatedPagination)
        updateURLParams(filters, updatedPagination)
    }

    const handleFilterChange = (key: keyof InternalFilters, value: string | undefined) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        const newPagination = { current: 1, pageSize: pagination.pageSize }
        setPagination((prev) => ({ ...prev, current: 1 }))
        updateURLParams(newFilters, newPagination)
    }

    const handleApplyAdvancedFilter = (filterValues: InternalFilters) => {
        setFilters(filterValues)
        const newPagination = { current: 1, pageSize: pagination.pageSize }
        setPagination((prev) => ({ ...prev, current: 1 }))
        updateURLParams(filterValues, newPagination)
    }

    const handleClearFilters = () => {
        setFilters({})
        setPagination((prev) => ({ ...prev, current: 1 }))
        router.push('?page=1&limit=20', { scroll: false })
    }

    useEffect(() => {
        if (!initialized) return
        fetchCollections()
    }, [initialized, pagination.current, pagination.pageSize, filters])

    return {
        collections,
        loading,
        pagination,
        filters,
        handleApplyAdvancedFilter,
        handleClearFilters,
        fetchCollections,
        handleTableChange,
        handleFilterChange,
    }
}