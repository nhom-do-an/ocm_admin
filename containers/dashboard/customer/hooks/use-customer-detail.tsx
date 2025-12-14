'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalNotification } from '@/hooks/useNotification'
import customerService from '@/services/customer'
import orderService from '@/services/order'
import { CustomerDetail } from '@/types/response/customer'
import { OrderDetail } from '@/types/response/order'
import { GetListOrdersRequest } from '@/types/request/order'

export const useCustomerDetail = (customerId?: number) => {
    const [customer, setCustomer] = useState<CustomerDetail | null>(null)
    const [orders, setOrders] = useState<OrderDetail[]>([])
    const [loadingCustomer, setLoadingCustomer] = useState(false)
    const [loadingOrders, setLoadingOrders] = useState(false)
    const notification = useGlobalNotification()
    const router = useRouter()

    const fetchCustomer = useCallback(async () => {
        if (!customerId) return
        setLoadingCustomer(true)
        try {
            const data = await customerService.getCustomerDetail(customerId)
            setCustomer(data)
        } catch (error: any) {
            notification.error({
                message: 'Lỗi',
                description: error?.response?.data?.message || 'Không thể tải thông tin khách hàng',
            })
            router.push('/admin/customer/list')
        } finally {
            setLoadingCustomer(false)
        }
    }, [customerId, notification, router])

    const fetchRecentOrders = useCallback(async () => {
        if (!customerId) return
        setLoadingOrders(true)
        try {
            const params: GetListOrdersRequest = {
                page: 1,
                limit: 5,
                sort_field: 'created_at',
                sort_type: 'desc',
                customer_ids: [customerId],
            }
            const response = await orderService.getListOrders(params)
            setOrders(response.orders || [])
        } catch (error: any) {
            notification.error({
                message: 'Lỗi',
                description: error?.response?.data?.message || 'Không thể tải danh sách đơn hàng',
            })
        } finally {
            setLoadingOrders(false)
        }
    }, [customerId, notification])

    useEffect(() => {
        fetchCustomer()
        fetchRecentOrders()
    }, [fetchCustomer, fetchRecentOrders])

    return {
        customer,
        orders,
        loadingCustomer,
        loadingOrders,
        refetchCustomer: fetchCustomer,
        refetchOrders: fetchRecentOrders,
    }
}










