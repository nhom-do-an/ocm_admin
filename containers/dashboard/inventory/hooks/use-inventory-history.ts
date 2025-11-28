'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLoader } from '@/hooks/useGlobalLoader'
import inventoryAdjustmentService from '@/services/inventory-adjustment'
import locationService from '@/services/location'
import { Location } from '@/types/response/location'
import { ELocationStatus } from '@/types/enums/enum'
import {
    InventoryAdjustment,
    InventoryAdjustmentChange,
} from '@/types/response/inventory-adjustment'
import variantService, { Variant } from '@/services/variant'

interface UseInventoryHistoryProps {
    initialVariantId?: number
    initialLocationId?: number
}

export interface InventoryAdjustmentWithChanges extends InventoryAdjustment {
    parsed_changes: InventoryAdjustmentChange[]
}

const parseChanges = (changes: string): InventoryAdjustmentChange[] => {
    if (!changes) return []
    try {
        const parsed = JSON.parse(changes)
        if (Array.isArray(parsed)) {
            return parsed
        }
        return []
    } catch (error) {
        console.error('Failed to parse inventory adjustment changes', error)
        return []
    }
}

export const useInventoryHistory = ({
    initialVariantId,
    initialLocationId,
}: UseInventoryHistoryProps = {}) => {
    const [adjustments, setAdjustments] = useState<InventoryAdjustmentWithChanges[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [variantDetail, setVariantDetail] = useState<Variant | null>(null)
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState<{
        variant_id?: number
        location_id?: number
    }>({
        variant_id: initialVariantId,
        location_id: initialLocationId,
    })
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    })
    const { startLoading, stopLoading } = useLoader()
    const startLoadingRef = useRef(startLoading)
    const stopLoadingRef = useRef(stopLoading)

    useEffect(() => {
        startLoadingRef.current = startLoading
    }, [startLoading])

    useEffect(() => {
        stopLoadingRef.current = stopLoading
    }, [stopLoading])

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await locationService.getListLocations({
                    inventory_management: true,
                    status: ELocationStatus.ACTIVE,
                })
                const fetchedLocations = response.locations || []
                setLocations(fetchedLocations)

                const defaultLocation =
                    fetchedLocations.find(location => location.default_location) ||
                    fetchedLocations[0]

                if (defaultLocation) {
                    setFilters(prev =>
                        prev.location_id
                            ? prev
                            : {
                                ...prev,
                                location_id: defaultLocation.id,
                            },
                    )
                }
            } catch (error) {
                console.error('Error fetching locations:', error)
            }
        }

        fetchLocations()
    }, [])

    useEffect(() => {
        if (!filters.variant_id) {
            setVariantDetail(null)
            return
        }
        let cancelled = false
        const fetchVariant = async () => {
            try {
                const detail = await variantService.getVariantDetail(filters.variant_id!)
                if (!cancelled) {
                    setVariantDetail(detail)
                }
            } catch (error) {
                console.error('Error fetching variant detail:', error)
            }
        }
        fetchVariant()
        return () => {
            cancelled = true
        }
    }, [filters.variant_id])

    const { variant_id, location_id } = filters
    const { current, pageSize } = pagination

    const fetchAdjustments = useCallback(async () => {
        if (!location_id) return
        startLoadingRef.current?.()
        setLoading(true)
        try {
            const response = await inventoryAdjustmentService.getInventoryAdjustments({
                page: current,
                size: pageSize,
                variant_id,
                location_id,
            })
            const withChanges = (response.inventory_adjustments || []).map(item => ({
                ...item,
                parsed_changes: parseChanges(item.changes),
            }))
            setAdjustments(withChanges)
            setPagination(prev => ({
                ...prev,
                total: response.count || 0,
            }))
        } catch (error) {
            console.error('Error fetching inventory adjustments:', error)
        } finally {
            stopLoadingRef.current?.()
            setLoading(false)
        }
    }, [current, pageSize, variant_id, location_id])

    useEffect(() => {
        fetchAdjustments()
    }, [fetchAdjustments])

    const handleLocationFilterChange = (locationId?: number) => {
        setFilters(prev => ({
            ...prev,
            location_id: locationId,
        }))
        setPagination(prev => ({ ...prev, current: 1 }))
    }

    const handleTableChange = (newPagination: { current?: number; pageSize?: number }) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current ?? prev.current,
            pageSize: newPagination.pageSize ?? prev.pageSize,
        }))
    }

    return {
        adjustments,
        locations,
        variantDetail,
        filters,
        loading,
        pagination,
        handleLocationFilterChange,
        handleTableChange,
        refresh: fetchAdjustments,
    }
}

