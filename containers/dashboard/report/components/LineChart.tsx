'use client'
import React, { useMemo } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register chart.js modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
)

interface LineChartData {
    label: string
    current: number
    previous?: number
}

interface LineChartProps {
    data: LineChartData[]
    currentLabel?: string
    previousLabel?: string
    formatValue?: (value: number) => string
    height?: number
    valueType?: 'currency' | 'number'
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    currentLabel = 'Kỳ hiện tại',
    previousLabel = 'Kỳ trước',
    formatValue,
    height = 300,
    valueType = 'currency',
}) => {
    const defaultFormatValue = (val: number) => {
        if (valueType === 'currency') {
            return `${val.toLocaleString('vi-VN')}₫`
        }
        return val.toLocaleString('vi-VN')
    }

    const finalFormatValue = formatValue || defaultFormatValue

    const formatYAxis = (value: number) => {
        if (valueType === 'currency') {
            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₫`
            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k ₫`
            return `${value}₫`
        }
        return value.toLocaleString('vi-VN')
    }

    const chartData = useMemo(() => {
        return {
            labels: data.map(d => d.label),
            datasets: [
                {
                    label: currentLabel,
                    data: data.map(d => d.current),
                    borderColor: '#3b82f6',
                    backgroundColor: '#3b82f6',
                    tension: 0.4,
                    pointRadius: 3,
                },
                ...(data.some(d => d.previous != null)
                    ? [
                        {
                            label: previousLabel,
                            data: data.map(d => d.previous ?? null),
                            borderColor: '#93c5fd',
                            backgroundColor: '#93c5fd',
                            borderDash: [5, 5],
                            tension: 0.4,
                            pointRadius: 3,
                        },
                    ]
                    : []),
            ],
        }
    }, [data, currentLabel, previousLabel])

    const options = useMemo(() => {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                tooltip: {
                    callbacks: {
                        label: (ctx: any) => {
                            const label = ctx.dataset.label || ''
                            const value = ctx.raw
                            return `${label}: ${finalFormatValue(value)}`
                        },
                    },
                },
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value: any) => formatYAxis(Number(value)),
                    },
                },
            },
        }
    }, [finalFormatValue, valueType])

    if (!data || data.length === 0) return null

    return (
        <div style={{ height }}>
            <Line data={chartData} options={options} />
        </div>
    )
}

export default LineChart
