'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLoader } from '@/hooks/useGlobalLoader'
import { Collection } from '@/types/response/collection'
import collectionService from '@/services/collection'

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
    const { startLoading, stopLoading } = useLoader();


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

        setFilters(params)
    }, [])


    const updateURLParams = (newFilters: InternalFilters, newPagination?: any) => {
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
            const response = await collectionService.getCollections()
            setCollections(response.collections || [])
            setPagination((prev) => ({ ...prev, total: response.count || 0 }))
        } catch (error) {
            console.error('Error fetching collections:', error)
        } finally {
            stopLoading()
            setLoading(false)
        }
    }


    const handleTableChange = (newPagination: any) => {
        const updatedPagination = {
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }
        setPagination(updatedPagination)
        updateURLParams(filters, updatedPagination)
    }

    const handleFilterChange = (key: keyof InternalFilters, value: any) => {
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
        fetchCollections()
    }, [pagination.current, pagination.pageSize, filters])

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