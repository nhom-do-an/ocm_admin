'use client'

import { useLoader } from "@/hooks/useGlobalLoader"
import { useGlobalNotification } from "@/hooks/useNotification"
import variantService, { Variant } from "@/services/variant"
import { OrderDetail } from "@/types/response/order"
import { useParams, } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import orderService from "@/services/order"

export const useEditOrder = () => {
    const [variants, setVariants] = useState<Variant[]>([])
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const { startLoading, stopLoading } = useLoader()
    const params = useParams()
    const notification = useGlobalNotification()
    const orderId = params?.id ? Number(params.id) : null

    const fetchOrderDetail = useCallback(async () => {
        if (!orderId) return

        setLoading(true)
        startLoading()
        try {
            const orderData = await orderService.getOrderDetail(orderId)
            setOrder(orderData)
        } catch (error) {
            console.error('Error fetching order detail:', error)
            notification.error({ message: 'Không thể tải chi tiết đơn hàng' })
        } finally {
            setLoading(false)
            stopLoading()
        }
    }, [orderId, startLoading, stopLoading, notification])

    const getVariants = useCallback(async (keyword: string, locationID: number) => {
        const response = await variantService.getListVariants({ key: keyword, location_id: locationID })
        setVariants(response.variants || [])
    }, [])

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail()
        }
    }, [orderId])

    return {
        order,
        variants,
        loading,
        getVariants,
        orderId,
    }
}

