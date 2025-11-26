'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Empty, Select } from 'antd'
import { Filter } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import useEventList, { EventFilters } from './hooks/use-event-list'
import Loader from '@/components/Loader'
import { ESubjectType } from '@/types/enums/enum'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const { RangePicker } = DatePicker

const SUBJECT_OPTIONS = [
    { label: 'Đơn hàng', value: ESubjectType.Order },
    { label: 'Vận đơn', value: ESubjectType.Shipment },
    { label: 'Tài khoản', value: ESubjectType.User },
    { label: 'Sản phẩm', value: ESubjectType.Product },
    { label: 'Danh mục', value: ESubjectType.Collection },
]

const SUBJECT_LABELS = SUBJECT_OPTIONS.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label
    return acc
}, {})

const EventListView: React.FC = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const urlFilters = useMemo<EventFilters>(() => {
        const subject = (searchParams.get('subject_type') as ESubjectType) || undefined
        const min = searchParams.get('min_date')
        const max = searchParams.get('max_date')
        return {
            subject_type: subject,
            min_date: min ? Number(min) : undefined,
            max_date: max ? Number(max) : undefined,
        }
    }, [searchParams])

    const buildRangeFromFilters = (filters: EventFilters): [Dayjs, Dayjs] | null => {
        if (!filters.min_date || !filters.max_date) return null
        return [dayjs(filters.min_date * 1000), dayjs(filters.max_date * 1000)]
    }

    const [subjectType, setSubjectType] = useState<ESubjectType | undefined>(urlFilters.subject_type)
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(buildRangeFromFilters(urlFilters))

    const { events, loading, loadingMore, hasMore, total, loadMore, applyFilters } = useEventList(urlFilters)

    useEffect(() => {
        setSubjectType(urlFilters.subject_type)
        setDateRange(buildRangeFromFilters(urlFilters))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlFilters.subject_type, urlFilters.min_date, urlFilters.max_date])

    const groupedEvents = useMemo(() => {
        if (!events.length) return []
        const map = new Map<string, typeof events>()
        events.forEach(event => {
            const key = event.created_at ? dayjs(event.created_at).format('DD/MM/YYYY') : 'Không xác định'
            const list = map.get(key) || []
            list.push(event)
            map.set(key, list)
        })
        return Array.from(map.entries())
    }, [events])

    const updateUrlFilters = (nextFilters: EventFilters) => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('subject_type')
        params.delete('min_date')
        params.delete('max_date')
        if (nextFilters.subject_type) {
            params.set('subject_type', nextFilters.subject_type)
        }
        if (nextFilters.min_date) {
            params.set('min_date', String(nextFilters.min_date))
        }
        if (nextFilters.max_date) {
            params.set('max_date', String(nextFilters.max_date))
        }
        const query = params.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }

    const handleApplyFilter = () => {
        const nextFilters: EventFilters = {
            subject_type: subjectType,
            min_date: dateRange ? dateRange[0].startOf('day').unix() : undefined,
            max_date: dateRange ? dateRange[1].endOf('day').unix() : undefined,
        }
        applyFilters(nextFilters)
        updateUrlFilters(nextFilters)
    }

    const handleResetFilter = () => {
        setSubjectType(undefined)
        setDateRange(null)
        applyFilters({})
        updateUrlFilters({})
    }

    const handleDateChange = (values: null | (Dayjs | null)[]) => {
        if (!values || !values[0] || !values[1]) {
            setDateRange(null)
            return
        }
        setDateRange([values[0], values[1]] as [Dayjs, Dayjs])
    }

    const formatTime = (value?: string) => {
        if (!value) return '--:--'
        return dayjs(value).format('HH:mm')
    }

    const renderTimeline = () => {
        if (loading && events.length === 0) {
            return (
                <div className="py-16">
                    <Loader />
                </div>
            )
        }

        if (!events.length) {
            return <Empty description="Chưa có nhật ký hoạt động" className="py-10" />
        }

        return (
            <div className="space-y-8">
                {groupedEvents.map(([date, dateEvents]) => (
                    <div key={date}>
                        <div className="text-sm font-semibold text-gray-700 mb-3">{date}</div>
                        <div className="relative pl-8">
                            <div className="absolute left-[6px] top-0 bottom-0 w-0.5 bg-blue-200"></div>
                            {dateEvents.map((event, index) => (
                                <div key={`${event.id}-${index}`} className="relative mb-5 last:mb-0">
                                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white z-10 -translate-x-1/2"></div>
                                    <div className="ml-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{formatTime(event.created_at)}</span>
                                            <span className="text-sm text-gray-600">{event.author_name || 'Hệ thống'}</span>
                                            {event.subject_type && (
                                                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                                                    {SUBJECT_LABELS[event.subject_type] || event.subject_type}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            {event.description || event.message || 'Không có mô tả'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6">
            <div className="flex flex-col gap-2 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-2xl font-semibold text-gray-900">Nhật ký hoạt động</h1>
                    <div className="text-sm text-gray-600">
                        Tổng sự kiện:{' '}
                        <span className="font-semibold text-gray-900">{total.toLocaleString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            <Card className="mb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="flex-1 min-w-[220px]">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Chức năng</label>
                        <Select
                            placeholder="Chọn chức năng"
                            allowClear
                            options={SUBJECT_OPTIONS}
                            value={subjectType}
                            onChange={value => setSubjectType(value as ESubjectType | undefined)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 min-w-[260px]">
                        <label className="text-sm font-medium text-gray-700 block mb-1">Khoảng thời gian</label>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            format="DD/MM/YYYY"
                            className="w-full"
                            allowClear
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleResetFilter}>Xóa lọc</Button>
                        <Button type="primary" icon={<Filter size={16} />} onClick={handleApplyFilter}>
                            Lọc
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                {renderTimeline()}
                {hasMore && events.length > 0 && (
                    <div className="text-center mt-4">
                        <Button type="default" onClick={loadMore} loading={loadingMore}>
                            Xem thêm
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default EventListView

