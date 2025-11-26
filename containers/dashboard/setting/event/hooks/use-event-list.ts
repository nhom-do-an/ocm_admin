'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Event } from '@/types/response/event'
import { useGlobalNotification } from '@/hooks/useNotification'
import eventService from '@/services/event'
import { GetEventsRequest } from '@/types/request/event'

const PAGE_SIZE = 20

export type EventFilters = Pick<GetEventsRequest, 'subject_type' | 'min_date' | 'max_date'>

const useEventList = (initialFilters: EventFilters = {}) => {
    const notification = useGlobalNotification()

    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<EventFilters>(initialFilters)
    const filtersRef = useRef<EventFilters>(initialFilters)

    const fetchEvents = useCallback(
        async (pageNumber = 1, reset = false, overrideFilters?: EventFilters) => {
            const requestFilters = overrideFilters ?? filtersRef.current
            if (reset) {
                setLoading(true)
            } else {
                setLoadingMore(true)
            }

            try {
                const response = await eventService.getEvents({
                    ...requestFilters,
                    page: pageNumber,
                    size: PAGE_SIZE,
                })
                const list = response.events || []

                if (reset) {
                    setEvents(list)
                    setPage(1)
                } else {
                    setEvents(prev => [...prev, ...list])
                }

                setTotal(response.count || 0)
                setPage(pageNumber)
                const totalCount = response.count || 0
                const currentSize = (pageNumber) * PAGE_SIZE
                setHasMore(currentSize < totalCount)
            } catch (error) {
                console.error('Failed to fetch events:', error)
                notification.error({ message: 'Không thể tải nhật ký hoạt động' })
            } finally {
                if (reset) {
                    setLoading(false)
                } else {
                    setLoadingMore(false)
                }
            }
        },
        [notification],
    )

    const applyFilters = useCallback(
        async (nextFilters: EventFilters) => {
            setFilters(nextFilters)
            filtersRef.current = nextFilters
            await fetchEvents(1, true, nextFilters)
        },
        [fetchEvents],
    )

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return
        await fetchEvents(page + 1, false)
    }, [fetchEvents, hasMore, loadingMore, page])

    const refresh = useCallback(async () => {
        await fetchEvents(1, true)
    }, [fetchEvents])

    useEffect(() => {
        setFilters(initialFilters)
        filtersRef.current = initialFilters
        fetchEvents(1, true, initialFilters)
    }, [initialFilters, fetchEvents])

    return {
        events,
        loading,
        loadingMore,
        hasMore,
        total,
        filters,
        applyFilters,
        loadMore,
        refresh,
        page,
        pageSize: PAGE_SIZE,
        totalCount: total,
    }
}

export default useEventList

