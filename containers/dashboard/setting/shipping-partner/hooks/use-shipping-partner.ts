'use client'

import { useCallback, useEffect, useState } from 'react'
import deliveryProviderService from '@/services/delivery-provider'
import { DeliveryProvider } from '@/types/request/order'
import { DeliveryProviderStatus, DeliveryProviderType } from '@/types/enums/enum'
import { CreateDeliveryProviderRequest, GetListDeliveryProvidersRequest } from '@/types/request/delivery-provider'
import { useGlobalNotification } from '@/hooks/useNotification'

interface Filters extends Pick<GetListDeliveryProvidersRequest, 'status' | 'key'> { }

export const useShippingPartner = () => {
    const [providers, setProviders] = useState<DeliveryProvider[]>([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    })
    const [filters, setFilters] = useState<Filters>({
        status: undefined,
        key: undefined,
    })
    const notification = useGlobalNotification()
    const [editingProvider, setEditingProvider] = useState<DeliveryProvider | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const fetchProviders = useCallback(async () => {
        setLoading(true)
        try {
            const response = await deliveryProviderService.getListDeliveryProviders({
                type: DeliveryProviderType.ExternalShipper,
                status: filters.status,
                key: filters.key,
                page: pagination.current,
                size: pagination.pageSize,
            })
            setProviders(response.delivery_providers || [])
            setPagination(prev => ({
                ...prev,
                total: response.count || 0,
            }))
        } catch (error) {
            console.error('Error fetching delivery providers:', error)
            notification.error({ message: 'Không thể tải danh sách đối tác vận chuyển' })
        } finally {
            setLoading(false)
        }
    }, [filters.key, filters.status, notification, pagination.current, pagination.pageSize])

    useEffect(() => {
        fetchProviders()
    }, [fetchProviders])

    const handleCreate = async (data: CreateDeliveryProviderRequest) => {
        try {
            await deliveryProviderService.createDeliveryProvider({
                address: data.address || '',
                email: data.email || '',
                name: data.name || '',
                note: data.note || '',
                phone: data.phone || '',
                status: (data.status as DeliveryProviderStatus) || DeliveryProviderStatus.Active,
                type: (data.type as DeliveryProviderType) || DeliveryProviderType.ExternalShipper,
            })
            notification.success({ message: 'Thêm đối tác vận chuyển thành công' })
            setModalOpen(false)
            fetchProviders()
        } catch (error) {
            console.error('Error creating delivery provider:', error)
            notification.error({ message: 'Không thể thêm đối tác vận chuyển' })
            throw error
        }
    }

    const handleUpdate = async (id: number, data: CreateDeliveryProviderRequest) => {
        try {
            await deliveryProviderService.updateDeliveryProvider(id, data)
            notification.success({ message: 'Cập nhật đối tác vận chuyển thành công' })
            setModalOpen(false)
            setEditingProvider(null)
            fetchProviders()
        } catch (error) {
            console.error('Error updating delivery provider:', error)
            notification.error({ message: 'Không thể cập nhật đối tác vận chuyển' })
            throw error
        }
    }

    const handleSubmit = async (data: CreateDeliveryProviderRequest) => {
        if (editingProvider) {
            await handleUpdate(editingProvider.id, data)
        } else {
            await handleCreate(data)
        }
    }

    const openCreateModal = () => {
        setEditingProvider(null)
        setModalOpen(true)
    }

    const openEditModal = (provider: DeliveryProvider) => {
        setEditingProvider(provider)
        setModalOpen(true)
    }

    const handleTableChange = (page: number, pageSize?: number) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize ?? prev.pageSize,
        }))
    }

    const handleSearch = (value?: string) => {
        setFilters(prev => ({
            ...prev,
            key: value || undefined,
        }))
        setPagination(prev => ({ ...prev, current: 1 }))
    }

    const handleStatusFilter = (status?: DeliveryProviderStatus) => {
        setFilters(prev => ({
            ...prev,
            status,
        }))
        setPagination(prev => ({ ...prev, current: 1 }))
    }

    return {
        providers,
        loading,
        pagination,
        filters,
        modalOpen,
        editingProvider,
        openCreateModal,
        openEditModal,
        handleSubmit,
        setModalOpen,
        handleTableChange,
        handleSearch,
        handleStatusFilter,
    }
}

