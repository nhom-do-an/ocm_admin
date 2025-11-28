'use client'

import { useCallback, useEffect, useState } from 'react'
import paymentMethodService from '@/services/payment-method'
import { PaymentMethod } from '@/types/response/payment-method'
import { CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '@/types/request/payment-method'
import { useGlobalNotification } from '@/hooks/useNotification'

const usePaymentMethodManagement = () => {
    const notification = useGlobalNotification()
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)

    const fetchPaymentMethods = useCallback(async () => {
        setLoading(true)
        try {
            const data = await paymentMethodService.getListPaymentMethods()
            setPaymentMethods(data || [])
        } catch (error) {
            console.error('Failed to fetch payment methods', error)
            notification.error({ message: 'Không thể tải danh sách phương thức thanh toán' })
        } finally {
            setLoading(false)
        }
    }, [notification])

    useEffect(() => {
        let mounted = true
        if (mounted) {
            fetchPaymentMethods()
        }
        return () => {
            mounted = false
        }
    }, [fetchPaymentMethods])

    const createPaymentMethod = useCallback(
        async (payload: CreatePaymentMethodRequest) => {
            setCreateLoading(true)
            try {
                await paymentMethodService.createPaymentMethod(payload)
                notification.success({ message: 'Tạo phương thức thanh toán thành công' })
                await fetchPaymentMethods()
            } catch (error) {
                console.error('Failed to create payment method', error)
                notification.error({ message: 'Không thể tạo phương thức thanh toán' })
                throw error
            } finally {
                setCreateLoading(false)
            }
        },
        [fetchPaymentMethods, notification],
    )

    const updatePaymentMethod = useCallback(
        async (payload: UpdatePaymentMethodRequest) => {
            setUpdateLoading(true)
            try {
                await paymentMethodService.updatePaymentMethod(payload)
                notification.success({ message: 'Cập nhật phương thức thanh toán thành công' })
                await fetchPaymentMethods()
            } catch (error) {
                console.error('Failed to update payment method', error)
                notification.error({ message: 'Không thể cập nhật phương thức thanh toán' })
                throw error
            } finally {
                setUpdateLoading(false)
            }
        },
        [fetchPaymentMethods, notification],
    )

    return {
        paymentMethods,
        loading,
        createLoading,
        updateLoading,
        fetchPaymentMethods,
        createPaymentMethod,
        updatePaymentMethod,
    }
}

export default usePaymentMethodManagement

