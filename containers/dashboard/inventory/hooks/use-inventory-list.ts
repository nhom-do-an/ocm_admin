'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { UIEvent } from 'react'
import inventoryLevelService from '@/services/inventory-level'
import { InventoryLevel } from '@/types/response/inventory-level'
import { useLoader } from '@/hooks/useGlobalLoader'
import locationService from '@/services/location'
import { Location } from '@/types/response/location'
import variantService, { Variant } from '@/services/variant'
import { ELocationStatus } from '@/types/enums/enum'

interface InventoryFilters {
    variant_id?: number
    location_ids?: number[]
    default_location?: boolean
}

const VARIANT_PAGE_SIZE = 50

export const useInventoryList = () => {
    const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [variantOptions, setVariantOptions] = useState<Variant[]>([])
    const [variantSelectLoading, setVariantSelectLoading] = useState(false)
    const [variantHasMore, setVariantHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    })
    const [filters, setFilters] = useState<InventoryFilters>({
        default_location: true,
    })
    const [defaultLocationIds, setDefaultLocationIds] = useState<number[]>([])
    const { startLoading, stopLoading } = useLoader()
    const startLoadingRef = useRef(startLoading)
    const stopLoadingRef = useRef(stopLoading)
    const variantPaginationRef = useRef({
        page: 1,
        search: '',
    })

    useEffect(() => {
        startLoadingRef.current = startLoading
    }, [startLoading])

    useEffect(() => {
        stopLoadingRef.current = stopLoading
    }, [stopLoading])

    const { variant_id, default_location, location_ids } = filters

    const fetchInventoryLevels = useCallback(async () => {
        startLoadingRef.current?.()
        setLoading(true)
        try {
            const params = {
                page: pagination.current,
                size: pagination.pageSize,
                variant_id,
                default_location,
                location_ids: location_ids && location_ids.length > 0
                    ? location_ids
                    : undefined,
            }

            const response = await inventoryLevelService.getInventoryLevels(params)
            setInventoryLevels(response.inventory_levels || [])
            setPagination(prev => {
                const nextTotal = response.count || 0
                if (prev.total === nextTotal) return prev
                return { ...prev, total: nextTotal }
            })
        } catch (error) {
            console.error('Error fetching inventory levels:', error)
        } finally {
            stopLoadingRef.current?.()
            setLoading(false)
        }
    }, [
        default_location,
        variant_id,
        location_ids,
        pagination,
    ])

    useEffect(() => {
        fetchInventoryLevels()
    }, [fetchInventoryLevels])

    const loadVariants = useCallback(async ({ reset = false, search }: { reset?: boolean; search?: string } = {}) => {
        const currentSearch = search ?? variantPaginationRef.current.search ?? ''
        const page = reset ? 1 : variantPaginationRef.current.page

        setVariantSelectLoading(true)
        try {
            const response = await variantService.getListVariants({
                page,
                limit: VARIANT_PAGE_SIZE,
                key: currentSearch || undefined,
            })

            const fetched = response.variants || []
            setVariantOptions(prev => {
                const base = reset ? [] : prev
                const variantMap = new Map<number, Variant>()
                base.forEach(variant => {
                    variantMap.set(variant.id, variant)
                })
                fetched.forEach(variant => {
                    variantMap.set(variant.id, variant)
                })
                return Array.from(variantMap.values())
            })

            const total = response.count ?? 0
            let hasMore = fetched.length === VARIANT_PAGE_SIZE
            if (total > 0) {
                hasMore = page * VARIANT_PAGE_SIZE < total
            }
            setVariantHasMore(hasMore)

            variantPaginationRef.current = {
                page: hasMore ? page + 1 : page,
                search: currentSearch,
            }
        } catch (error) {
            console.error('Error fetching variants:', error)
        } finally {
            setVariantSelectLoading(false)
        }
    }, [])

    useEffect(() => {
        const fetchMetaData = async () => {
            try {
                const locationResponse = await locationService.getListLocations({
                    inventory_management: true,
                    status: ELocationStatus.ACTIVE,
                })

                const fetchedLocations = locationResponse.locations || []
                const defaults = fetchedLocations
                    .filter(location => location.default_location)
                    .map(location => location.id)

                setLocations(fetchedLocations)
                setDefaultLocationIds(defaults)
                setFilters(prev => {
                    if (prev.default_location && prev.location_ids === undefined) {
                        return {
                            ...prev,
                            location_ids: undefined,
                        }
                    }
                    return prev
                })
            } catch (error) {
                console.error('Error fetching locations:', error)
            }
        }

        fetchMetaData()
        loadVariants({ reset: true })
    }, [loadVariants])

    const handleTableChange = (newPagination: { current?: number; pageSize?: number }) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current ?? prev.current,
            pageSize: newPagination.pageSize ?? prev.pageSize,
        }))
    }

    const handleVariantFilterChange = (variantId?: number) => {
        setFilters(prev => ({
            ...prev,
            variant_id: variantId || undefined,
        }))
        setPagination(prev => ({ ...prev, current: 1 }))
    }

    const handleVariantSearch = (value: string) => {
        variantPaginationRef.current = {
            page: 1,
            search: value,
        }
        loadVariants({ reset: true, search: value })
    }

    const handleVariantPopupScroll = (event: UIEvent<HTMLDivElement>) => {
        if (!variantHasMore || variantSelectLoading) return
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
        if (scrollHeight - scrollTop - clientHeight < 24) {
            loadVariants()
        }
    }

    const handleLocationFilterChange = (locationIds: number[]) => {
        setFilters(prev => ({
            ...prev,
            location_ids: locationIds.length ? locationIds : undefined,
            default_location: locationIds.length ? false : true,
        }))
        setPagination(prev => ({ ...prev, current: 1 }))
    }

    const handleClearFilters = () => {
        setFilters({
            variant_id: undefined,
            location_ids: undefined,
            default_location: true,
        })
        setPagination(prev => ({ ...prev, current: 1 }))
    }

    const selectedLocationIds =
        filters.location_ids !== undefined
            ? filters.location_ids
            : filters.default_location
                ? defaultLocationIds
                : []

    return {
        inventoryLevels,
        locations,
        variants: variantOptions,
        variantSelectLoading,
        loading,
        pagination,
        filters,
        selectedLocationIds,
        defaultLocationIds,
        handleTableChange,
        handleVariantFilterChange,
        handleVariantSearch,
        handleVariantPopupScroll,
        handleLocationFilterChange,
        handleClearFilters,
        refresh: fetchInventoryLevels,
    }
}

