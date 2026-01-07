'use client'

import { useCallback, useEffect, useState } from 'react'
import bannerService from '@/services/banner'
import { Banner } from '@/types/response/banner'
import { CreateBannerRequest, UpdateBannerRequest } from '@/types/request/banner'
import { useGlobalNotification } from '@/hooks/useNotification'

const useBannerManagement = () => {
    const notification = useGlobalNotification()
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchBanners = useCallback(async () => {
        setLoading(true)
        try {
            const response = await bannerService.getListBanners()
            setBanners(response.banners || [])
        } catch (error) {
            console.error('Failed to fetch banners', error)
            notification.error({ message: 'Không thể tải danh sách banner' })
        } finally {
            setLoading(false)
        }
    }, [notification])

    useEffect(() => {
        let mounted = true
        if (mounted) {
            fetchBanners()
        }
        return () => {
            mounted = false
        }
    }, [])

    const createBanner = useCallback(
        async (payload: CreateBannerRequest) => {
            setCreateLoading(true)
            try {
                await bannerService.createBanner(payload)
                notification.success({ message: 'Tạo banner thành công' })
                await fetchBanners()
            } catch (error) {
                console.error('Failed to create banner', error)
                notification.error({ message: 'Không thể tạo banner' })
                throw error
            } finally {
                setCreateLoading(false)
            }
        },
        [fetchBanners, notification],
    )

    const updateBanner = useCallback(
        async (id: number, payload: UpdateBannerRequest) => {
            setUpdateLoading(true)
            try {
                await bannerService.updateBanner(id, { ...payload, id })
                notification.success({ message: 'Cập nhật banner thành công' })
                await fetchBanners()
            } catch (error) {
                console.error('Failed to update banner', error)
                notification.error({ message: 'Không thể cập nhật banner' })
                throw error
            } finally {
                setUpdateLoading(false)
            }
        },
        [fetchBanners, notification],
    )

    const deleteBanner = useCallback(
        async (id: number) => {
            setDeleteLoading(true)
            try {
                await bannerService.deleteBanner(id)
                notification.success({ message: 'Xóa banner thành công' })
                await fetchBanners()
            } catch (error) {
                console.error('Failed to delete banner', error)
                notification.error({ message: 'Không thể xóa banner' })
                throw error
            } finally {
                setDeleteLoading(false)
            }
        },
        [fetchBanners, notification],
    )

    return {
        banners,
        loading,
        createLoading,
        updateLoading,
        deleteLoading,
        fetchBanners,
        createBanner,
        updateBanner,
        deleteBanner,
    }
}

export default useBannerManagement
