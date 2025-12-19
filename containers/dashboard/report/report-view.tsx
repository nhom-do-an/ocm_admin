'use client'
import React, { useState } from 'react'
import { Select, DatePicker, Button } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useReport } from './hooks/use-report'
import ReportCard from './components/ReportCard'
import ReportChartCard from './components/ReportChartCard'
import ReportListCard from './components/ReportListCard'
import { useRouter } from 'next/navigation'
import ReportLineItem from './components/ReportLineItem'

const { RangePicker } = DatePicker

export const ReportView: React.FC = () => {
    const router = useRouter()
    const {
        loading,
        filters,
        revenueByDate,
        revenueByLocation,
        revenueBySource,
        revenueByCustomer,
        topSellingProducts,
        summary,
        handleFilterChange,
    } = useReport()

    const [datePickerOpen, setDatePickerOpen] = useState(false)

    // Format date range for display
    const getDateRangeLabel = () => {
        if (filters.min_date && filters.max_date) {
            const start = dayjs(filters.min_date, 'DD/MM/YYYY')
            const end = dayjs(filters.max_date, 'DD/MM/YYYY')
            return `${start.format('DD/MM')} - ${end.format('DD/MM/YYYY')}`
        }
        return 'Chọn khoảng thời gian'
    }

    // Get comparison period label
    const getComparisonLabel = () => {
        if (!filters.compare_with_previous || !filters.min_date || !filters.max_date) {
            return 'Không so sánh'
        }
        const start = dayjs(filters.min_date, 'DD/MM/YYYY').subtract(1, 'month')
        const end = dayjs(filters.max_date, 'DD/MM/YYYY').subtract(1, 'month')
        return `So với: ${start.format('DD/MM')} - ${end.format('DD/MM/YYYY')}`
    }

    // Handle quick date selection
    const handleQuickDateSelect = (value: string) => {
        const today = dayjs()
        let startDate: Dayjs
        let endDate: Dayjs = today

        switch (value) {
            case 'today':
                startDate = today
                break
            case 'yesterday':
                startDate = today.subtract(1, 'day')
                endDate = today.subtract(1, 'day')
                break
            case '7days':
                startDate = today.subtract(6, 'day')
                break
            case '30days':
                startDate = today.subtract(29, 'day')
                break
            case 'lastWeek':
                startDate = today.subtract(1, 'week').startOf('week')
                endDate = today.subtract(1, 'week').endOf('week')
                break
            case 'thisWeek':
                startDate = today.startOf('week')
                break
            case 'lastMonth':
                startDate = today.subtract(1, 'month').startOf('month')
                endDate = today.subtract(1, 'month').endOf('month')
                break
            case 'thisMonth':
                startDate = today.startOf('month')
                break
            case 'lastYear':
                startDate = today.subtract(1, 'year').startOf('year')
                endDate = today.subtract(1, 'year').endOf('year')
                break
            case 'thisYear':
                startDate = today.startOf('year')
                break
            default:
                return
        }

        handleFilterChange({
            min_date: startDate.format('DD/MM/YYYY'),
            max_date: endDate.format('DD/MM/YYYY'),
        })
        setDatePickerOpen(false)
    }

    // Handle custom date range
    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            handleFilterChange({
                min_date: dates[0].format('DD/MM/YYYY'),
                max_date: dates[1].format('DD/MM/YYYY'),
            })
        }
    }

    // Get current date range for RangePicker
    const getDateRangeValue = (): [Dayjs, Dayjs] | null => {
        if (filters.min_date && filters.max_date) {
            return [
                dayjs(filters.min_date, 'DD/MM/YYYY'),
                dayjs(filters.max_date, 'DD/MM/YYYY'),
            ]
        }
        return null
    }

    // Calculate orders by date (for order count chart)
    const ordersByDate = revenueByDate.map((item) => ({
        label: item.label,
        current: item.total_orders,
        previous: item.previous_orders || undefined,
    }))

    // Navigation handlers
    const handleNavigateToDetail = (type: string) => {
        const params = new URLSearchParams()
        if (filters.min_date) params.set('min_date', filters.min_date)
        if (filters.max_date) params.set('max_date', filters.max_date)
        if (filters.compare_with_previous !== undefined) {
            params.set('compare_with_previous', filters.compare_with_previous.toString())
        }
        router.push(`/admin/report/${type}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden max-md:max-w-[1000px] overflow-x-scroll mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <span className="text-2xl font-semibold mb-4">Tổng quan báo cáo</span>

                {/* Date and Comparison Selectors */}
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Date Range Selector */}
                    <div className="flex items-center gap-2">
                        <Select
                            open={datePickerOpen}
                            onDropdownVisibleChange={setDatePickerOpen}
                            value={getDateRangeLabel()}
                            className="min-w-[280px]"
                            dropdownRender={() => (
                                <div className="bg-white rounded-lg shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('today')}
                                            className="text-left"
                                        >
                                            Hôm nay
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('yesterday')}
                                            className="text-left"
                                        >
                                            Hôm qua
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('7days')}
                                            className="text-left"
                                        >
                                            7 ngày qua
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('30days')}
                                            className="text-left"
                                        >
                                            30 ngày qua
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('lastWeek')}
                                            className="text-left"
                                        >
                                            Tuần trước
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('thisWeek')}
                                            className="text-left"
                                        >
                                            Tuần này
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('lastMonth')}
                                            className="text-left"
                                        >
                                            Tháng trước
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('thisMonth')}
                                            className="text-left"
                                        >
                                            Tháng này
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('lastYear')}
                                            className="text-left"
                                        >
                                            Năm trước
                                        </Button>
                                        <Button
                                            type="text"
                                            block
                                            onClick={() => handleQuickDateSelect('thisYear')}
                                            className="text-left"
                                        >
                                            Năm nay
                                        </Button>
                                    </div>
                                    <div className="border-t pt-4">
                                        <RangePicker
                                            value={getDateRangeValue()}
                                            onChange={handleDateRangeChange}
                                            format="DD/MM/YYYY"
                                            className="w-full"
                                            placeholder={['Từ ngày', 'Đến ngày']}
                                        />
                                        <Button
                                            type="primary"
                                            block
                                            className="mt-2"
                                            onClick={() => setDatePickerOpen(false)}
                                        >
                                            Lọc
                                        </Button>
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    {/* Comparison Selector */}
                    <Select
                        value={filters.compare_with_previous ? 'previous' : 'none'}
                        onChange={(value) =>
                            handleFilterChange({
                                compare_with_previous: value === 'previous',
                            })
                        }
                        className="min-w-[200px]"
                    >
                        <Select.Option value="none">Không so sánh</Select.Option>
                        <Select.Option value="previous">So sánh với kỳ trước</Select.Option>
                    </Select>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <ReportCard
                        title="Doanh thu thuần"
                        value={summary.netRevenue.current}
                        percentage={summary.netRevenue.percentage}
                        onClick={() => handleNavigateToDetail('revenue')}
                    />
                    <ReportCard
                        title="Đơn hàng"
                        value={summary.orders.current}
                        percentage={summary.orders.percentage}
                        formatValue={(val) => String(val)}
                        onClick={() => handleNavigateToDetail('orders')}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ReportChartCard
                        title="Doanh thu theo thời gian"
                        data={revenueByDate}
                        totalValue={summary.netRevenue.current}
                        percentage={summary.netRevenue.percentage}
                        onClick={() => handleNavigateToDetail('revenue-by-date')}
                        currentLabel={
                            filters.min_date && filters.max_date
                                ? `${filters.min_date} - ${filters.max_date}`
                                : undefined
                        }
                        previousLabel={getComparisonLabel()}
                    />
                    <ReportChartCard
                        title="Giá trị đơn hàng trung bình"
                        data={revenueByDate.map((item) => ({
                            ...item,
                            current:
                                item.total_orders > 0
                                    ? item.current / item.total_orders
                                    : 0,
                            previous:
                                item.previous_orders && item.previous_orders > 0
                                    ? (item.previous || 0) / item.previous_orders
                                    : undefined,
                        }))}
                        totalValue={summary.averageOrderValue.current}
                        percentage={summary.averageOrderValue.percentage}
                        onClick={() => handleNavigateToDetail('average-order-value')}
                        currentLabel={
                            filters.min_date && filters.max_date
                                ? `${filters.min_date} - ${filters.max_date}`
                                : undefined
                        }
                        previousLabel={getComparisonLabel()}
                    />
                </div>

                {/* Lists Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <ReportLineItem
                        title="Top sản phẩm bán chạy"
                        items={topSellingProducts}
                        type="products"
                        onClick={() => handleNavigateToDetail('top-products')}
                    />
                    <ReportChartCard
                        title="Số lượng đơn hàng theo thời gian"
                        data={ordersByDate.map((item) => ({
                            label: item.label,
                            current: item.current,
                            previous: item.previous,
                            total_revenue: 0,
                            total_shipping_fee: 0,
                            total_line_item_fee: 0,
                            total_orders: item.current,
                            previous_revenue: undefined,
                            previous_shipping_fee: undefined,
                            previous_line_item_fee: undefined,
                            previous_orders: item.previous,
                        }))}
                        totalValue={summary.orders.current}
                        percentage={summary.orders.percentage}
                        formatValue={(val) => {
                            if (typeof val === 'number') {
                                return val.toLocaleString('vi-VN')
                            }
                            return String(val)
                        }}
                        valueType="number"
                        onClick={() => handleNavigateToDetail('orders-by-date')}
                        currentLabel={
                            filters.min_date && filters.max_date
                                ? `${filters.min_date} - ${filters.max_date}`
                                : undefined
                        }
                        previousLabel={getComparisonLabel()}
                    />
                </div>

                {/* Additional Reports Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ReportListCard
                        title="Doanh thu theo chi nhánh"
                        items={revenueByLocation}
                        type="revenue"
                        onClick={() => handleNavigateToDetail('revenue-by-location')}
                    />
                    <ReportListCard
                        title="Doanh thu theo nguồn đơn"
                        items={revenueBySource}
                        type="revenue"
                        onClick={() => handleNavigateToDetail('revenue-by-source')}
                    />
                    <ReportListCard
                        title="Doanh thu theo khách hàng"
                        items={revenueByCustomer}
                        type="revenue"
                        onClick={() => handleNavigateToDetail('revenue-by-customer')}
                    />
                </div>
            </div>
        </div>
    )
}

export default ReportView
