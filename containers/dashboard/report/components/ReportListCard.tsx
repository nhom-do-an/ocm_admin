'use client'
import React, { useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import {
    GetRevenueResponse,
    GetTopSellingProductsResponse,
} from '@/types/response/report'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
)

interface ReportListCardProps {
    title: string
    items: GetRevenueResponse[] | GetTopSellingProductsResponse[]
    type: 'revenue' | 'products'
    onClick?: () => void
}

const ReportListCard: React.FC<ReportListCardProps> = ({
    title,
    items,
    type,
    onClick,
}) => {
    const formatCurrency = (value: number) =>
        value.toLocaleString('vi-VN') + '₫'

    const chartData = useMemo(() => {
        if (type === 'revenue') {
            const data = items as GetRevenueResponse[]
            return {
                labels: data.map(i => i.label),
                datasets: [
                    {
                        label: 'Doanh thu',
                        data: data.map(i => i.current),
                        backgroundColor: '#3b82f6',
                        borderRadius: 6,
                    },
                ],
            }
        }

        const data = items as GetTopSellingProductsResponse[]
        return {
            labels: data.map(i => i.product_name || i.title),
            datasets: [
                {
                    label: 'Doanh thu',
                    data: data.map(i => i.total_revenue),
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                },
            ],
        }
    }, [items, type])

    const options = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y' as const, // 👈 Horizontal bar
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => formatCurrency(ctx.raw),
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        callback: (value: any) =>
                            formatCurrency(Number(value)),
                    },
                },
            },
        }
    }, [])

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {onClick && (
                    <button
                        onClick={onClick}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowRight size={20} className="text-gray-400" />
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                    Không có dữ liệu
                </p>
            ) : (
                <div style={{ height: Math.max(items.length * 40, 200) }}>
                    <Bar data={chartData} options={options} />
                </div>
            )}
        </div>
    )
}

export default ReportListCard
