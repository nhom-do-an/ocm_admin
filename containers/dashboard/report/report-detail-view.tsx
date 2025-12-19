'use client'
import React, { useState, useMemo } from 'react'
import { Select, DatePicker, Button, Table } from 'antd'
import { ArrowLeft, Download, BarChart3, TrendingUp } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import { useRouter } from 'next/navigation'
import { useReportDetail } from './hooks/use-report-detail'
import LineChart from './components/LineChart'
import BarChart from './components/BarChart'
import { exportToExcel } from '@/utils/exportExcel'

const { RangePicker } = DatePicker

type ChartType = 'line' | 'bar'

export const ReportDetailView: React.FC = () => {
    const router = useRouter()
    const {
        loading,
        filters,
        data,
        topProductsData,
        reportType,
        reportTitle,
        handleFilterChange,
    } = useReportDetail()

    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [chartType, setChartType] = useState<ChartType>('line')

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

    // Format currency
    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN') + '₫'
    }

    // Prepare chart data
    const chartData = useMemo(() => {
        return data.map((item) => ({
            label: item.label,
            current: item.current,
            previous: item.previous,
        }))
    }, [data])

    // Prepare table data for top products
    const topProductsTableData = useMemo(() => {
        if (reportType !== 'top-products') return []

        // Sort by total_revenue (descending)
        const sorted = [...topProductsData].sort((a, b) => b.total_revenue - a.total_revenue)

        // Calculate totals
        const totals = sorted.reduce(
            (acc, item) => ({
                total_revenue: acc.total_revenue + item.total_revenue,
                total_sold: acc.total_sold + item.total_sold,
            }),
            {
                total_revenue: 0,
                total_sold: 0,
            }
        )

        // Create total row
        const totalRow = {
            key: 'total',
            product_name: 'Tổng cộng',
            title: '',
            sku: '',
            total_revenue: totals.total_revenue,
            total_sold: totals.total_sold,
            isTotal: true,
        }

        // Create data rows
        const dataRows = sorted.map((item, index) => ({
            key: index,
            product_name: item.product_name,
            title: item.title,
            sku: item.sku,
            total_revenue: item.total_revenue,
            total_sold: item.total_sold,
            isTotal: false,
        }))

        return [totalRow, ...dataRows]
    }, [topProductsData, reportType])

    // Prepare table data - sorted by date (newest first) with total row at top
    const tableData = useMemo(() => {
        if (reportType === 'top-products') return []

        // Check if this is a date-based report (revenue-by-date, orders-by-date, etc.)
        const isDateBasedReport =
            reportType === 'revenue' ||
            reportType === 'revenue-by-date' ||
            reportType === 'orders' ||
            reportType === 'orders-by-date' ||
            reportType === 'average-order-value'

        // Parse and sort data
        const sortedData = [...data]

        if (isDateBasedReport) {
            // Sort by date (newest first) for date-based reports
            sortedData.sort((a, b) => {
                // Parse label as DD/MM/YYYY format
                const parseDate = (label: string): Date | null => {
                    try {
                        const parts = label.split('/')
                        if (parts.length === 3) {
                            const [day, month, year] = parts
                            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                        }
                    } catch {
                        // If parsing fails, return null
                    }
                    return null
                }

                const dateA = parseDate(a.label)
                const dateB = parseDate(b.label)

                // If both are valid dates, sort by date
                if (dateA && dateB) {
                    return dateB.getTime() - dateA.getTime() // Descending order (newest first)
                }
                // If parsing fails, keep original order
                return 0
            })
        } else {
            // For non-date reports (location, source, customer), sort by value (descending)
            sortedData.sort((a, b) => b.current - a.current)
        }

        // Calculate totals
        const totals = sortedData.reduce(
            (acc, item) => ({
                total_line_item_fee: acc.total_line_item_fee + item.total_line_item_fee,
                total_shipping_fee: acc.total_shipping_fee + item.total_shipping_fee,
                total_revenue: acc.total_revenue + item.total_revenue,
                net_revenue: acc.net_revenue + (item.total_line_item_fee + item.total_shipping_fee),
                total_orders: acc.total_orders + item.total_orders,
            }),
            {
                total_line_item_fee: 0,
                total_shipping_fee: 0,
                total_revenue: 0,
                net_revenue: 0,
                total_orders: 0,
            }
        )

        // Create total row
        const totalRow = {
            key: 'total',
            label: 'Tổng cộng',
            total_line_item_fee: totals.total_line_item_fee,
            total_shipping_fee: totals.total_shipping_fee,
            total_revenue: totals.total_revenue,
            net_revenue: totals.net_revenue,
            total_orders: totals.total_orders,
            isTotal: true,
        }

        // Create data rows
        const dataRows = sortedData.map((item, index) => ({
            key: index,
            label: item.label,
            total_line_item_fee: item.total_line_item_fee,
            total_shipping_fee: item.total_shipping_fee,
            total_revenue: item.total_revenue,
            net_revenue: item.total_line_item_fee + item.total_shipping_fee,
            total_orders: item.total_orders,
            isTotal: false,
        }))

        // Return total row first, then data rows
        return [totalRow, ...dataRows]
    }, [data, reportType])

    // Table columns for top products
    const topProductsColumns = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'product_name',
            key: 'product_name',
            width: 200,
            render: (text: string, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>{text}</span>
            ),
        },
        {
            title: 'Thuộc tính',
            dataIndex: 'title',
            key: 'title',
            width: 150,
            render: (text: string, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>{text || '-'}</span>
            ),
        },
        {
            title: 'Mã SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
            render: (text: string, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>{text || '-'}</span>
            ),
        },
        {
            title: 'Doanh thu',
            dataIndex: 'total_revenue',
            key: 'total_revenue',
            align: 'right' as const,
            render: (value: number, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: 'Đã bán',
            dataIndex: 'total_sold',
            key: 'total_sold',
            align: 'right' as const,
            render: (value: number, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>
                    {value.toLocaleString('vi-VN')}
                </span>
            ),
        },
    ]

    // Table columns for revenue reports
    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'label',
            key: 'label',
            width: 120,
            render: (text: string, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>{text}</span>
            ),
        },
        {
            title: 'Tiền hàng',
            dataIndex: 'total_line_item_fee',
            key: 'total_line_item_fee',
            align: 'right' as const,
            render: (value: number, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: 'Phí giao hàng',
            dataIndex: 'total_shipping_fee',
            key: 'total_shipping_fee',
            align: 'right' as const,
            render: (value: number, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: 'Tổng đã nhận',
            dataIndex: 'total_revenue',
            key: 'total_revenue',
            align: 'right' as const,
            render: (value: number, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: 'Doanh thu thuần',
            dataIndex: 'net_revenue',
            key: 'net_revenue',
            align: 'right' as const,
            render: (value: number, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>
                    {formatCurrency(value)}
                </span>
            ),
        },
        {
            title: 'SL đơn hàng',
            dataIndex: 'total_orders',
            key: 'total_orders',
            align: 'right' as const,
            render: (value: number, record: { isTotal?: boolean }) => (
                <span className={record.isTotal ? 'font-semibold' : ''}>
                    {value.toLocaleString('vi-VN')}
                </span>
            ),
        },
    ]

    // Handle export Excel
    const handleExportExcel = () => {
        if (reportType === 'top-products') {
            // Export top products data
            const exportData = topProductsTableData.map((row) => ({
                'Tên sản phẩm': row.product_name,
                'Thuộc tính': row.title,
                'Mã SKU': row.sku,
                'Doanh thu': row.total_revenue,
                'Đã bán': row.total_sold,
            }))

            const exportColumns = [
                { key: 'Tên sản phẩm', label: 'Tên sản phẩm' },
                { key: 'Thuộc tính', label: 'Thuộc tính' },
                { key: 'Mã SKU', label: 'Mã SKU' },
                { key: 'Doanh thu', label: 'Doanh thu' },
                { key: 'Đã bán', label: 'Đã bán' },
            ]

            const filename = `${reportTitle}_${filters.min_date}_${filters.max_date}.xlsx`
            exportToExcel(exportData, exportColumns, filename)
        } else {
            // Export revenue data
            const exportData = tableData.map((row) => ({
                'Ngày': row.label,
                'Tiền hàng': row.total_line_item_fee,
                'Phí giao hàng': row.total_shipping_fee,
                'Tổng đã nhận': row.total_revenue,
                'Doanh thu thuần': row.net_revenue,
                'SL đơn hàng': row.total_orders,
            }))

            const exportColumns = [
                { key: 'Ngày', label: 'Ngày' },
                { key: 'Tiền hàng', label: 'Tiền hàng' },
                { key: 'Phí giao hàng', label: 'Phí giao hàng' },
                { key: 'Tổng đã nhận', label: 'Tổng đã nhận' },
                { key: 'Doanh thu thuần', label: 'Doanh thu thuần' },
                { key: 'SL đơn hàng', label: 'SL đơn hàng' },
            ]

            const filename = `${reportTitle}_${filters.min_date}_${filters.max_date}.xlsx`
            exportToExcel(exportData, exportColumns, filename)
        }
    }

    // Determine value type for chart
    const valueType: 'currency' | 'number' =
        reportType === 'orders' || reportType === 'orders-by-date' ? 'number' : 'currency'

    return (
        <div className="flex flex-col w-full h-fit overflow-hidden max-md:max-w-[1000px] overflow-x-scroll mx-auto max-w-[1600px]">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <h1 className="text-2xl font-semibold">{reportTitle}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            icon={<Download size={16} />}
                            onClick={handleExportExcel}
                            className="flex items-center gap-2"
                        >
                            Xuất báo cáo
                        </Button>
                    </div>
                </div>

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

                    {/* Comparison Selector - Hide for top products */}
                    {reportType !== 'top-products' && (
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
                    )}

                    {/* Chart Type Selector - Hide for top products */}
                    {reportType !== 'top-products' && (
                        <div className="flex items-center gap-2 border rounded-lg p-1">
                            <button
                                onClick={() => setChartType('line')}
                                className={`px-3 py-1 rounded flex items-center gap-2 transition-colors ${chartType === 'line'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <TrendingUp size={16} />
                                Đường
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                className={`px-3 py-1 rounded flex items-center gap-2 transition-colors ${chartType === 'bar'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <BarChart3 size={16} />
                                Cột
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
                {/* Chart - Hide for top products */}
                {reportType !== 'top-products' && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div style={{ height: 400 }}>
                            {chartType === 'line' ? (
                                <LineChart
                                    data={chartData}
                                    currentLabel={
                                        filters.min_date && filters.max_date
                                            ? `${filters.min_date} - ${filters.max_date}`
                                            : undefined
                                    }
                                    previousLabel={getComparisonLabel()}
                                    valueType={valueType}
                                />
                            ) : (
                                <BarChart
                                    data={chartData}
                                    currentLabel={
                                        filters.min_date && filters.max_date
                                            ? `${filters.min_date} - ${filters.max_date}`
                                            : undefined
                                    }
                                    previousLabel={getComparisonLabel()}
                                    valueType={valueType}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {reportType === 'top-products' ? (
                        <Table
                            columns={topProductsColumns}
                            dataSource={topProductsTableData}
                            loading={loading}
                            pagination={{
                                pageSize: 20,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} bản ghi`,
                            }}
                            scroll={{ x: 'max-content' }}
                            rowClassName={(record) =>
                                (record as { isTotal?: boolean }).isTotal ? 'bg-gray-50 font-semibold' : ''
                            }
                        />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={tableData}
                            loading={loading}
                            pagination={{
                                pageSize: 20,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} bản ghi`,
                            }}
                            scroll={{ x: 'max-content' }}
                            rowClassName={(record) =>
                                (record as { isTotal?: boolean }).isTotal ? 'bg-gray-50 font-semibold' : ''
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default ReportDetailView

