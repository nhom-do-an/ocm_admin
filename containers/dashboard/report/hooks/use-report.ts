'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import reportService from '@/services/report'
import { GetRevenueResponse, GetTopSellingProductsResponse } from '@/types/response/report'
import { useLoader } from '@/hooks/useGlobalLoader'

interface ReportFilters {
    min_date?: string // DD/MM/YYYY format
    max_date?: string // DD/MM/YYYY format
    compare_with_previous?: boolean
}

export const useReport = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { startLoading, stopLoading } = useLoader()

    // State
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState<ReportFilters>({})

    // Data states
    const [revenueByDate, setRevenueByDate] = useState<GetRevenueResponse[]>([])
    const [revenueByLocation, setRevenueByLocation] = useState<GetRevenueResponse[]>([])
    const [revenueBySource, setRevenueBySource] = useState<GetRevenueResponse[]>([])
    const [revenueByCustomer, setRevenueByCustomer] = useState<GetRevenueResponse[]>([])
    const [topSellingProducts, setTopSellingProducts] = useState<GetTopSellingProductsResponse[]>([])

    // Initialize filters from URL params or defaults
    useEffect(() => {
        const params: ReportFilters = {}

        // Parse date range from URL
        const minDate = searchParams.get('min_date')
        const maxDate = searchParams.get('max_date')
        const compareWithPrevious = searchParams.get('compare_with_previous')

        if (minDate && maxDate) {
            params.min_date = minDate
            params.max_date = maxDate
        } else {
            // Default: last 30 days
            const endDate = dayjs()
            const startDate = endDate.subtract(29, 'day') // 30 days including today
            params.min_date = startDate.format('DD/MM/YYYY')
            params.max_date = endDate.format('DD/MM/YYYY')
        }

        if (compareWithPrevious !== null) {
            params.compare_with_previous = compareWithPrevious === 'true'
        } else {
            // Default: compare with previous period
            params.compare_with_previous = true
        }

        setFilters(params)
        // Update URL if using defaults
        if (!minDate || !maxDate) {
            const urlParams = new URLSearchParams()
            urlParams.set('min_date', params.min_date!)
            urlParams.set('max_date', params.max_date!)
            urlParams.set('compare_with_previous', params.compare_with_previous!.toString())
            router.replace(`?${urlParams.toString()}`, { scroll: false })
        }
    }, [searchParams, router])

    // Convert DD/MM/YYYY to timestamp (seconds)
    const dateToTimestamp = (dateStr: string): number => {
        const [day, month, year] = dateStr.split('/')
        return new Date(`${year}-${month}-${day}`).getTime() / 1000
    }

    // Update URL params
    const updateURLParams = (newFilters: ReportFilters) => {
        const params = new URLSearchParams()

        if (newFilters.min_date) params.set('min_date', newFilters.min_date)
        if (newFilters.max_date) params.set('max_date', newFilters.max_date)
        if (newFilters.compare_with_previous !== undefined) {
            params.set('compare_with_previous', newFilters.compare_with_previous.toString())
        }

        router.push(`?${params.toString()}`, { scroll: false })
    }


    // Handle filter changes
    const handleFilterChange = (updates: Partial<ReportFilters>) => {
        const newFilters = { ...filters, ...updates }
        setFilters(newFilters)
        updateURLParams(newFilters)
    }

    // Calculate summary statistics
    const calculateSummary = () => {
        // Net revenue (total current from all revenueByDate items)
        const totalCurrent = revenueByDate.reduce((sum, item) => sum + item.current, 0)
        const totalPrevious = revenueByDate.reduce((sum, item) => sum + (item.previous || 0), 0)

        // Total orders
        const totalOrders = revenueByDate.reduce((sum, item) => sum + item.total_orders, 0)
        const previousOrders = revenueByDate.reduce((sum, item) => sum + (item.previous_orders || 0), 0)

        // Calculate percentage change
        const calculatePercentage = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0
            return ((current - previous) / previous) * 100
        }

        const revenuePercentage = calculatePercentage(totalCurrent, totalPrevious)
        const ordersPercentage = calculatePercentage(totalOrders, previousOrders)

        // Average order value
        const averageOrderValue = totalOrders > 0 ? totalCurrent / totalOrders : 0
        const previousAverageOrderValue = previousOrders > 0 ? totalPrevious / previousOrders : 0
        const averageOrderValuePercentage = calculatePercentage(averageOrderValue, previousAverageOrderValue)

        return {
            netRevenue: {
                current: totalCurrent,
                previous: totalPrevious,
                percentage: revenuePercentage,
            },
            orders: {
                current: totalOrders,
                previous: previousOrders,
                percentage: ordersPercentage,
            },
            averageOrderValue: {
                current: averageOrderValue,
                previous: previousAverageOrderValue,
                percentage: averageOrderValuePercentage,
            },
        }
    }

    // Fetch data when filters change
    useEffect(() => {
        if (filters.min_date && filters.max_date) {
            const fetchData = async () => {
                startLoading()
                setLoading(true)

                try {
                    const requestParams = {
                        min_date: dateToTimestamp(filters.min_date),
                        max_date: dateToTimestamp(filters.max_date),
                        compare_with_previous: filters.compare_with_previous ?? true,
                    }

                    const topProductsParams = {
                        min_date: dateToTimestamp(filters.min_date),
                        max_date: dateToTimestamp(filters.max_date),
                        limit: 10,
                    }

                    const [
                        revenueByDateData,
                        revenueByLocationData,
                        revenueBySourceData,
                        revenueByCustomerData,
                        topSellingProductsData,
                    ] = await Promise.all([
                        reportService.statsRevenueByDate(requestParams),
                        reportService.statsRevenueByLocation(requestParams),
                        reportService.statsRevenueBySource(requestParams),
                        reportService.statsRevenueByCustomer(requestParams),
                        reportService.statsTopSellingProducts(topProductsParams),
                    ])

                    setRevenueByDate(revenueByDateData || [])
                    setRevenueByLocation(revenueByLocationData || [])
                    setRevenueBySource(revenueBySourceData || [])
                    setRevenueByCustomer(revenueByCustomerData || [])
                    setTopSellingProducts(topSellingProductsData || [])
                } catch (error) {
                    console.error('Error fetching reports:', error)
                } finally {
                    stopLoading()
                    setLoading(false)
                }
            }
            fetchData()
        }
    }, [filters.min_date, filters.max_date, filters.compare_with_previous])

    const summary = calculateSummary()

    return {
        loading,
        filters,
        revenueByDate,
        revenueByLocation,
        revenueBySource,
        revenueByCustomer,
        topSellingProducts,
        summary,
        handleFilterChange,
    }
}


