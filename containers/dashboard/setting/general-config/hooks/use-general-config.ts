'use client'

import { useState, useEffect } from 'react'
import { StoreDetail } from '@/types/response/store'
import { UpdateStoreRequest, UploadStoreLogoRequest } from '@/types/request/store'
import storeService from '@/services/store'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import { message } from 'antd'

const useGeneralConfig = () => {
    const { user } = useGlobalContext()
    const [store, setStore] = useState<StoreDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    const fetchStore = async () => {
        if (!user?.store_id) return

        try {
            setLoading(true)
            const storeDetail = await storeService.getStoreDetail(user.store_id)
            setStore(storeDetail)
        } catch (error) {
            console.error('Failed to fetch store detail:', error)
            message.error('Không thể tải thông tin cửa hàng')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStore()
    }, [user?.store_id])

    const updateStore = async (data: UpdateStoreRequest) => {
        if (!user?.store_id) return

        try {
            setUpdating(true)
            await storeService.updateStore(data)
            message.success('Cập nhật thông tin cửa hàng thành công')
            await fetchStore()
        } catch (error) {
            console.error('Failed to update store:', error)
            message.error('Không thể cập nhật thông tin cửa hàng')
            throw error
        } finally {
            setUpdating(false)
        }
    }

    const uploadLogo = async (data: UploadStoreLogoRequest) => {
        if (!user?.store_id) return

        try {
            setUploadingLogo(true)
            await storeService.uploadLogo(user.store_id, data)
            message.success('Cập nhật logo thành công')
            await fetchStore()
        } catch (error) {
            console.error('Failed to upload logo:', error)
            message.error('Không thể cập nhật logo')
            throw error
        } finally {
            setUploadingLogo(false)
        }
    }

    return {
        store,
        loading,
        updating,
        uploadingLogo,
        updateStore,
        uploadLogo,
        refreshStore: fetchStore,
    }
}

export default useGeneralConfig

