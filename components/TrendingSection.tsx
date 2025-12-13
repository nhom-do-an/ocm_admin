'use client'
import React, { useEffect, useState } from 'react'
import aiService from '@/services/ai'
import { TrendingItem, TrendingPrediction } from '@/types/response/trending'
import { TrendingUp, TrendingDown, DollarSign, Package, BarChart3, Eye, Calendar, Flame } from 'lucide-react'
import TrendingReportPreviewModal from './TrendingReportPreviewModal'

interface TrendingSectionProps {
    limit?: number
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ limit = 10 }) => {
    const [trending, setTrending] = useState<TrendingItem[]>([])
    const [predictions, setPredictions] = useState<TrendingPrediction[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPredictedSales, setTotalPredictedSales] = useState(0)
    const [totalPredictedRevenue, setTotalPredictedRevenue] = useState(0)
    const [previewModalOpen, setPreviewModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<string>('')

    useEffect(() => {
        fetchTrendingData()
    }, [limit, selectedDate])

    const fetchTrendingData = async () => {
        try {
            setLoading(true)
            const [trendingRes, predictionsRes] = await Promise.all([
                aiService.getTrending(limit),
                aiService.getTrendingPredictions(limit, selectedDate || undefined)
            ])

            setTrending(trendingRes.trending || [])
            setPredictions(predictionsRes.predictions || [])
            setTotalPredictedSales(predictionsRes.total_predicted_sales || 0)
            setTotalPredictedRevenue(predictionsRes.total_predicted_revenue || 0)
        } catch (error) {
            console.error('Error fetching trending data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(Math.round(num))
    }

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(num)
    }

    const getGrowthRateColor = (rate: number) => {
        if (rate > 0) return 'text-green-600'
        if (rate < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    const getGrowthIcon = (rate: number) => {
        if (rate > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
        if (rate < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
        return null
    }

    const handleOpenPreview = () => {
        setPreviewModalOpen(true)
    }

    const handleClosePreview = () => {
        setPreviewModalOpen(false)
    }

    const handleDownloadComplete = () => {
        // Optional: Close modal after download or show notification
        // setPreviewModalOpen(false)
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date()
        return today.toISOString().split('T')[0]
    }

    // Get yesterday's date in YYYY-MM-DD format
    const getYesterdayDate = () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return yesterday.toISOString().split('T')[0]
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value)
    }

    const handleResetDate = () => {
        setSelectedDate('')
    }

    return (
        <div className="space-y-6">
            {/* Filter and Export Buttons */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                {/* Date Filter */}
                <div className="flex items-center gap-3">
                    <label htmlFor="date-filter" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>Lọc theo ngày:</span>
                    </label>
                    <input
                        id="date-filter"
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        max={getTodayDate()}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {selectedDate && (
                        <button
                            onClick={handleResetDate}
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Xóa lọc
                        </button>
                    )}
                    {!selectedDate && (
                        <span className="text-xs text-gray-500">(Mặc định: predictions mới nhất)</span>
                    )}
                </div>

                {/* Export Button */}
                <button
                    onClick={handleOpenPreview}
                    disabled={loading || (trending.length === 0 && predictions.length === 0)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                    <Eye className="w-4 h-4" />
                    <span>Xem trước & Xuất báo cáo PDF</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-700 mb-1">Tổng dự báo bán</p>
                            <p className="text-2xl font-bold text-orange-900">{formatNumber(totalPredictedSales)}</p>
                            <p className="text-xs text-orange-600 mt-1">sản phẩm</p>
                        </div>
                        <div className="bg-orange-200 rounded-full p-3">
                            <Package className="w-6 h-6 text-orange-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">Tổng dự báo doanh thu</p>
                            <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalPredictedRevenue)}</p>
                            <p className="text-xs text-blue-600 mt-1">VND</p>
                        </div>
                        <div className="bg-blue-200 rounded-full p-3">
                            <DollarSign className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6 border border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-700 mb-1">Sản phẩm trending hôm nay</p>
                            <p className="text-2xl font-bold text-red-900">{trending.length}</p>
                            <p className="text-xs text-red-600 mt-1">đang hot</p>
                        </div>
                        <div className="bg-red-200 rounded-full p-3">
                            <Flame className="w-6 h-6 text-red-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Predictions with Actual Sales */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-blue-500" />
                        <h2 className="text-xl font-bold text-gray-800">Dự báo doanh số chi tiết</h2>
                    </div>
                    {selectedDate && predictions.length > 0 && (
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Ngày:</span> {new Date(selectedDate).toLocaleDateString('vi-VN')}
                        </div>
                    )}
                </div>

                {predictions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Chưa có dữ liệu dự báo</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sản phẩm</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Dự báo bán</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Thực tế</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Chênh lệch</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Dự báo doanh thu</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {predictions.map((pred) => {
                                    const difference = pred.actual_sales !== undefined 
                                        ? pred.actual_sales - pred.predicted_sales 
                                        : null
                                    const differencePercent = pred.actual_sales !== undefined && pred.actual_sales > 0
                                        ? ((difference! / pred.actual_sales) * 100)
                                        : null

                                    return (
                                        <tr key={pred.item_id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{pred.product_name}</div>
                                                    <div className="text-sm text-gray-500">{pred.variant_title}</div>
                                                </div>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <span className="font-medium text-blue-600">
                                                    {formatNumber(pred.predicted_sales)}
                                                </span>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                {pred.actual_sales !== undefined ? (
                                                    <span className="font-medium text-gray-900">
                                                        {formatNumber(pred.actual_sales)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Chưa có</span>
                                                )}
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                {difference !== null ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        {difference > 0 ? (
                                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                                        ) : difference < 0 ? (
                                                            <TrendingDown className="w-4 h-4 text-red-600" />
                                                        ) : null}
                                                        <span className={`font-medium ${
                                                            difference > 0 ? 'text-green-600' : 
                                                            difference < 0 ? 'text-red-600' : 
                                                            'text-gray-600'
                                                        }`}>
                                                            {difference > 0 ? '+' : ''}{formatNumber(difference)}
                                                        </span>
                                                        {differencePercent !== null && (
                                                            <span className={`text-xs ml-1 ${
                                                                difference > 0 ? 'text-green-600' : 
                                                                difference < 0 ? 'text-red-600' : 
                                                                'text-gray-600'
                                                            }`}>
                                                                ({differencePercent > 0 ? '+' : ''}{differencePercent.toFixed(1)}%)
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <span className="font-medium text-green-600">
                                                    {formatCurrency(pred.predicted_revenue)}
                                                </span>
                                            </td>
                                            <td className="text-right py-3 px-4">
                                                <span className="text-gray-600">
                                                    {formatCurrency(pred.price)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Trending Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <h2 className="text-xl font-bold text-gray-800">Sản phẩm đang trending hôm nay</h2>
                </div>

                {trending.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Chưa có dữ liệu trending</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {trending.map((item, index) => (
                            <div
                                key={item.item_id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                                            {item.rank}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {item.product_name || `Sản phẩm #${item.item_id}`}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-sm text-gray-600">
                                                Dự báo: <span className="font-medium text-gray-900">{formatNumber(item.predicted_sales)}</span>
                                            </span>
                                            {item.price && (
                                                <span className="text-sm text-gray-600">
                                                    Giá: <span className="font-medium text-gray-900">{formatCurrency(item.price)}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {item.growth_rate !== undefined && (
                                        <div className={`flex items-center gap-1 ${getGrowthRateColor(item.growth_rate)}`}>
                                            {getGrowthIcon(item.growth_rate)}
                                            <span className="text-sm font-medium">
                                                {item.growth_rate > 0 ? '+' : ''}{item.growth_rate.toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Trend Score</div>
                                        <div className="text-sm font-bold text-orange-600">
                                            {item.trend_score.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <TrendingReportPreviewModal
                open={previewModalOpen}
                trending={trending}
                predictions={predictions}
                totalPredictedSales={totalPredictedSales}
                totalPredictedRevenue={totalPredictedRevenue}
                selectedDate={selectedDate}
                onCancel={handleClosePreview}
                onDownload={handleDownloadComplete}
            />
        </div>
    )
}

export default TrendingSection

