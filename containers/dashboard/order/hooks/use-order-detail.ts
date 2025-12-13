'use client'

import { useCallback, useEffect, useState } from 'react'
import orderService from '@/services/order'
import shipmentService from '@/services/shipment'
import { ShipmentDetail } from '@/types/response/shipment'
import { OrderDetail } from '@/types/response/order'
import { Event } from '@/types/response/event'
import { Transaction } from '@/types/response/transation'
import { useGlobalNotification } from '@/hooks/useNotification'
import { ESubjectType, ETransactionStatus } from '@/types/enums/enum'
import { AddressDetail } from '@/types/response/customer'
import { UpdateLineItemRequest } from '@/types/request/order'

interface UseOrderDetailResult {
    order: OrderDetail | null
    loading: boolean
    events: Event[]
    eventsLoading: boolean
    hasMoreEvents: boolean
    transactions: Transaction[]
    shipments: ShipmentDetail[]
    shipmentsLoading: boolean
    handleLoadMoreEvents: () => void
    refreshOrder: () => Promise<void>
    updateLineItemNote: (lineItemId: number, note: string, quantity?: number) => Promise<void>
    updateShippingAddress: (address: AddressDetail | null) => Promise<void>
    updateAssignee: (assigneeId: number) => Promise<void>
    updateOrderNote: (note: string) => Promise<void>
    updateExpectedDeliveryDate: (timestamp: number | null) => Promise<void>
}

const useOrderDetail = (orderId: number | null): UseOrderDetailResult => {
    const notification = useGlobalNotification()

    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [eventsPage, setEventsPage] = useState(1)
    const [eventsLoading, setEventsLoading] = useState(false)
    const [hasMoreEvents, setHasMoreEvents] = useState(false)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [shipments, setShipments] = useState<ShipmentDetail[]>([])
    const [shipmentsLoading, setShipmentsLoading] = useState(false)

    const fetchOrderDetail = useCallback(async () => {
        if (!orderId) return
        setLoading(true)
        try {
            const data = await orderService.getOrderDetail(orderId)
            setOrder(data)
        } catch (error) {
            console.error('Error fetching order detail:', error)
            notification.error({ message: 'Không thể tải thông tin đơn hàng' })
        } finally {
            setLoading(false)
        }
    }, [orderId, notification])

    const fetchEvents = useCallback(async (page = 1, reset = false) => {
        if (!orderId) return
        setEventsLoading(true)
        try {
            const response = await orderService.getOrderEvents({
                subject_type: ESubjectType.Order,
                subject_id: orderId,
                page,
                size: 20,
            })
            if (reset) {
                setEvents(response.events || [])
            } else {
                setEvents(prev => [...prev, ...(response.events || [])])
            }
            setHasMoreEvents((response.events?.length || 0) >= 20)
            setEventsPage(page)
        } catch (error) {
            console.error('Error fetching events:', error)
            notification.error({ message: 'Không thể tải lịch sử đơn hàng' })
        } finally {
            setEventsLoading(false)
        }
    }, [orderId, notification])

    const fetchTransactions = useCallback(async () => {
        if (!orderId) return
        try {
            const data = await orderService.getOrderTransactions(orderId)
            const successTransactions = (data || []).filter(
                transaction => transaction.status === ETransactionStatus.Success
            )
            setTransactions(successTransactions)
        } catch (error) {
            console.error('Error fetching transactions:', error)
        }
    }, [orderId])

    const fetchShipments = useCallback(async () => {
        if (!orderId) return
        setShipmentsLoading(true)
        try {
            const data = await shipmentService.getListShipments({
                order_id: orderId,
                page: 1,
                size: 100,
            })
            setShipments(data.shipments || [])
        } catch (error) {
            console.error('Error fetching shipments:', error)
        } finally {
            setShipmentsLoading(false)
        }
    }, [orderId])

    const handleLoadMoreEvents = useCallback(() => {
        fetchEvents(eventsPage + 1, false)
    }, [eventsPage, fetchEvents])

    const refreshOrder = useCallback(async () => {
        if (!orderId) return
        await fetchOrderDetail()
        await fetchEvents(1, true)
        await fetchTransactions()
        await fetchShipments()
    }, [orderId, fetchOrderDetail, fetchEvents, fetchTransactions, fetchShipments])

    const updateLineItemNote = async (lineItemId: number, note: string, quantity?: number) => {
        if (!orderId) return
        try {
            const payload: UpdateLineItemRequest = {
                id: lineItemId,
                note,
            }
            if (typeof quantity !== 'undefined') {
                payload.quantity = quantity
            }
            const updatedOrder = await orderService.updateOrder(orderId, { line_items: [payload] })
            setOrder(updatedOrder)
            notification.success({ message: 'Cập nhật ghi chú thành công' })
            await fetchEvents(1, true)
        } catch (error) {
            console.error('Error updating line item note:', error)
            notification.error({ message: 'Cập nhật ghi chú thất bại' })
            throw error
        }
    }

    const updateShippingAddress = async (address: AddressDetail | null) => {
        if (!orderId) return
        try {
            const payload = {
                shipping_address: address || undefined,
            }
            const updatedOrder = await orderService.updateOrder(orderId, payload)
            setOrder(updatedOrder)
            notification.success({ message: 'Cập nhật địa chỉ giao hàng thành công' })
            await fetchEvents(1, true)
        } catch (error) {
            console.error('Error updating shipping address:', error)
            notification.error({ message: 'Cập nhật địa chỉ giao hàng thất bại' })
            throw error
        }
    }

    const updateAssignee = async (assigneeId: number) => {
        if (!orderId) return
        try {
            const updatedOrder = await orderService.updateOrder(orderId, { assignee_id: assigneeId })
            setOrder(updatedOrder)
            notification.success({ message: 'Cập nhật nhân viên phụ trách thành công' })
            await fetchEvents(1, true)
        } catch (error) {
            console.error('Error updating assignee:', error)
            notification.error({ message: 'Cập nhật nhân viên phụ trách thất bại' })
            throw error
        }
    }

    const updateOrderNote = async (note: string) => {
        if (!orderId) return
        try {
            const updatedOrder = await orderService.updateOrder(orderId, { note })
            setOrder(updatedOrder)
            notification.success({ message: 'Cập nhật ghi chú đơn hàng thành công' })
            await fetchEvents(1, true)
        } catch (error) {
            console.error('Error updating order note:', error)
            notification.error({ message: 'Cập nhật ghi chú đơn hàng thất bại' })
            throw error
        }
    }

    const updateExpectedDeliveryDate = async (timestamp: number | null) => {
        if (!orderId) return
        try {
            const payload = {
                expected_delivery_date: timestamp ?? undefined,
            }
            const updatedOrder = await orderService.updateOrder(orderId, payload)
            setOrder(updatedOrder)
            notification.success({ message: 'Cập nhật ngày hẹn giao thành công' })
            await fetchEvents(1, true)
        } catch (error) {
            console.error('Error updating expected delivery date:', error)
            notification.error({ message: 'Cập nhật ngày hẹn giao thất bại' })
            throw error
        }
    }

    useEffect(() => {
        if (!orderId) return
        fetchOrderDetail()
        fetchEvents(1, true)
        fetchTransactions()
        fetchShipments()
    }, [orderId, fetchOrderDetail, fetchEvents, fetchTransactions, fetchShipments])

    return {
        order,
        loading,
        events,
        eventsLoading,
        hasMoreEvents,
        transactions,
        shipments,
        shipmentsLoading,
        handleLoadMoreEvents,
        refreshOrder,
        updateLineItemNote,
        updateShippingAddress,
        updateAssignee,
        updateOrderNote,
        updateExpectedDeliveryDate,
    }
}

export default useOrderDetail

