'use client'

import { useCallback, useEffect, useState } from 'react'
import shipmentService from '@/services/shipment'
import eventService from '@/services/event'
import { ShipmentDetail } from '@/types/response/shipment'
import { Event } from '@/types/response/event'
import { useGlobalNotification } from '@/hooks/useNotification'
import { ESubjectType } from '@/types/enums/enum'

interface UseShipmentDetailResult {
    shipment: ShipmentDetail | null
    loading: boolean
    events: Event[]
    eventsLoading: boolean
    hasMoreEvents: boolean
    handleLoadMoreEvents: () => void
    refreshShipment: () => Promise<void>
}

const useShipmentDetail = (shipmentId: number | null): UseShipmentDetailResult => {
    const notification = useGlobalNotification()

    const [shipment, setShipment] = useState<ShipmentDetail | null>(null)
    const [loading, setLoading] = useState(false)
    const [events, setEvents] = useState<Event[]>([])
    const [eventsPage, setEventsPage] = useState(1)
    const [eventsLoading, setEventsLoading] = useState(false)
    const [hasMoreEvents, setHasMoreEvents] = useState(false)

    const fetchShipmentDetail = useCallback(async () => {
        if (!shipmentId) return
        setLoading(true)
        try {
            const data = await shipmentService.getDetailShipment(shipmentId)
            setShipment(data)
        } catch (error) {
            console.error('Error fetching shipment detail:', error)
            notification.error({ message: 'Không thể tải thông tin vận đơn' })
        } finally {
            setLoading(false)
        }
    }, [shipmentId, notification])

    const fetchEvents = useCallback(async (page = 1, reset = false) => {
        if (!shipmentId) return
        setEventsLoading(true)
        try {
            const response = await eventService.getEvents({
                subject_type: ESubjectType.Shipment,
                subject_id: shipmentId,
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
            notification.error({ message: 'Không thể tải lịch sử vận đơn' })
        } finally {
            setEventsLoading(false)
        }
    }, [shipmentId, notification])

    const handleLoadMoreEvents = useCallback(() => {
        fetchEvents(eventsPage + 1, false)
    }, [eventsPage, fetchEvents])

    const refreshShipment = useCallback(async () => {
        if (!shipmentId) return
        await fetchShipmentDetail()
        await fetchEvents(1, true)
    }, [shipmentId, fetchShipmentDetail, fetchEvents])

    useEffect(() => {
        if (!shipmentId) return
        fetchShipmentDetail()
        fetchEvents(1, true)
    }, [shipmentId, fetchShipmentDetail, fetchEvents])

    return {
        shipment,
        loading,
        events,
        eventsLoading,
        hasMoreEvents,
        handleLoadMoreEvents,
        refreshShipment,
    }
}

export default useShipmentDetail

