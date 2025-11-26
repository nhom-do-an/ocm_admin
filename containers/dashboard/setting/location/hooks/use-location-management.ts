'use client'

import { useCallback, useEffect, useState } from 'react'
import locationService from '@/services/location'
import { Location } from '@/types/response/location'
import { CreateLocationRequest, UpdateLocationRequest } from '@/types/request/location'
import { useGlobalNotification } from '@/hooks/useNotification'

const PAGE_SIZE = 10

const useLocationManagement = () => {
    const notification = useGlobalNotification()
    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, size: PAGE_SIZE, total: 0 })

    const fetchLocations = useCallback(
        async (page = 1) => {
            setLoading(true)
            try {
                const response = await locationService.getListLocations({ page, size: PAGE_SIZE })
                setLocations(response.locations || [])
                setPagination(prev => ({
                    ...prev,
                    page,
                    size: PAGE_SIZE,
                    total: response.count || 0,
                }))
            } catch (error) {
                console.error('Failed to fetch locations', error)
                notification.error({ message: 'Không thể tải danh sách chi nhánh' })
            } finally {
                setLoading(false)
            }
        },
        [notification],
    )

    useEffect(() => {
        let mounted = true
        if (mounted) {
            fetchLocations(1)
        }
        return () => {
            mounted = false
        }
    }, [])

    const createLocation = useCallback(
        async (payload: CreateLocationRequest) => {
            setCreateLoading(true)
            try {
                await locationService.createLocation(payload)
                notification.success({ message: 'Tạo chi nhánh thành công' })
                await fetchLocations(1)
            } catch (error) {
                console.error('Failed to create location', error)
                notification.error({ message: 'Không thể tạo chi nhánh' })
                throw error
            } finally {
                setCreateLoading(false)
            }
        },
        [fetchLocations, notification],
    )

    const updateLocation = useCallback(
        async (id: number, payload: UpdateLocationRequest) => {
            setUpdateLoading(true)
            try {
                await locationService.updateLocation(id, { ...payload, id })
                notification.success({ message: 'Cập nhật chi nhánh thành công' })
                await fetchLocations(pagination.page)
            } catch (error) {
                console.error('Failed to update location', error)
                notification.error({ message: 'Không thể cập nhật chi nhánh' })
                throw error
            } finally {
                setUpdateLoading(false)
            }
        },
        [fetchLocations, notification, pagination.page],
    )

    return {
        locations,
        loading,
        createLoading,
        updateLoading,
        pagination,
        fetchLocations,
        createLocation,
        updateLocation,
    }
}

export default useLocationManagement

