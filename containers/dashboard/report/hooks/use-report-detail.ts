'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import dayjs from 'dayjs'
import reportService from '@/services/report'
import { GetRevenueResponse, GetTopSellingProductsResponse } from '@/types/response/report'
import { useLoader } from '@/hooks/useGlobalLoader'

interface ReportFilters {
    min_date?: string // DD/MM/YYYY format
    max_date?: string // DD/MM/YYYY format
    compare_with_previous?: boolean
}

export const useReportDetail = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const { startLoading, stopLoading } = useLoader()

    const reportType = (params?.type as string) || 'revenue'

    // State
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState<ReportFilters>({})
    const [data, setData] = useState<GetRevenueResponse[]>([])
    const [topProductsData, setTopProductsData] = useState<GetTopSellingProductsResponse[]>([])

    // Initialize filters from URL params or defaults
    useEffect(() => {
        const filterParams: ReportFilters = {}

        // Parse date range from URL
        const minDate = searchParams.get('min_date')
        const maxDate = searchParams.get('max_date')
        const compareWithPrevious = searchParams.get('compare_with_previous')

        if (minDate && maxDate) {
            filterParams.min_date = minDate
            filterParams.max_date = maxDate
        } else {
            // Default: last 30 days
            const endDate = dayjs()
            const startDate = endDate.subtract(29, 'day')
            filterParams.min_date = startDate.format('DD/MM/YYYY')
            filterParams.max_date = endDate.format('DD/MM/YYYY')
        }

        if (compareWithPrevious !== null) {
            filterParams.compare_with_previous = compareWithPrevious === 'true'
        } else {
            filterParams.compare_with_previous = true
        }

        setFilters(filterParams)
        // Update URL if using defaults
        if (!minDate || !maxDate) {
            const urlParams = new URLSearchParams()
            urlParams.set('min_date', filterParams.min_date!)
            urlParams.set('max_date', filterParams.max_date!)
            urlParams.set('compare_with_previous', filterParams.compare_with_previous!.toString())
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
        const urlParams = new URLSearchParams()

        if (newFilters.min_date) urlParams.set('min_date', newFilters.min_date)
        if (newFilters.max_date) urlParams.set('max_date', newFilters.max_date)
        if (newFilters.compare_with_previous !== undefined) {
            urlParams.set('compare_with_previous', newFilters.compare_with_previous.toString())
        }

        router.push(`?${urlParams.toString()}`, { scroll: false })
    }

    // Handle filter changes
    const handleFilterChange = (updates: Partial<ReportFilters>) => {
        const newFilters = { ...filters, ...updates }
        setFilters(newFilters)
        updateURLParams(newFilters)
    }

    // Determine which API to call based on report type
    const getApiCall = () => {
        const requestParams = {
            min_date: dateToTimestamp(filters.min_date!),
            max_date: dateToTimestamp(filters.max_date!),
            compare_with_previous: filters.compare_with_previous ?? true,
        }

        switch (reportType) {
            case 'revenue':
            case 'revenue-by-date':
                return reportService.statsRevenueByDate(requestParams)
            case 'revenue-by-location':
                return reportService.statsRevenueByLocation(requestParams)
            case 'revenue-by-source':
                return reportService.statsRevenueBySource(requestParams)
            case 'revenue-by-customer':
                return reportService.statsRevenueByCustomer(requestParams)
            case 'orders':
            case 'orders-by-date':
                return reportService.statsRevenueByDate(requestParams)
            case 'average-order-value':
                return reportService.statsRevenueByDate(requestParams)
            case 'top-products':
                // Top products uses different API
                return null
            default:
                return reportService.statsRevenueByDate(requestParams)
        }
    }

    // Fetch data when filters change
    useEffect(() => {
        if (filters.min_date && filters.max_date) {
            const fetchData = async () => {
                startLoading()
                setLoading(true)

                try {
                    if (reportType === 'top-products') {
                        // Fetch top products with different params
                        if (!filters.min_date || !filters.max_date) return
                        const topProductsParams = {
                            min_date: dateToTimestamp(filters.min_date),
                            max_date: dateToTimestamp(filters.max_date),
                            limit: 100, // Get more products for detail view
                        }
                        const result = await reportService.statsTopSellingProducts(topProductsParams)
                        setTopProductsData(result || [])
                        setData([]) // Clear revenue data
                    } else {
                        const result = await getApiCall()
                        setData(result || [])
                        setTopProductsData([]) // Clear top products data
                    }
                } catch (error) {
                    console.error('Error fetching report detail:', error)
                } finally {
                    stopLoading()
                    setLoading(false)
                }
            }
            fetchData()
        }
    }, [filters.min_date, filters.max_date, filters.compare_with_previous, reportType])

    // Get report title based on type
    const getReportTitle = (): string => {
        switch (reportType) {
            case 'revenue':
            case 'revenue-by-date':
                return 'Doanh thu theo thời gian'
            case 'revenue-by-location':
                return 'Doanh thu theo chi nhánh'
            case 'revenue-by-source':
                return 'Doanh thu theo nguồn đơn'
            case 'revenue-by-customer':
                return 'Doanh thu theo khách hàng'
            case 'orders':
            case 'orders-by-date':
                return 'Số lượng đơn hàng theo thời gian'
            case 'average-order-value':
                return 'Giá trị đơn hàng trung bình'
            case 'top-products':
                return 'Top sản phẩm bán chạy'
            default:
                return 'Báo cáo chi tiết'
        }
    }

    // Process data based on report type
    const processedData = (): GetRevenueResponse[] => {
        if (reportType === 'average-order-value') {
            return data.map((item) => ({
                ...item,
                current: item.total_orders > 0 ? item.current / item.total_orders : 0,
                previous:
                    item.previous_orders && item.previous_orders > 0
                        ? (item.previous || 0) / item.previous_orders
                        : undefined,
            }))
        }
        if (reportType === 'orders' || reportType === 'orders-by-date') {
            return data.map((item) => ({
                ...item,
                current: item.total_orders,
                previous: item.previous_orders,
            }))
        }
        return data
    }

    return {
        loading,
        filters,
        data: processedData(),
        topProductsData,
        reportType,
        reportTitle: getReportTitle(),
        handleFilterChange,
    }
}

