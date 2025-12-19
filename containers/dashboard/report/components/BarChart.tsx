'use client'
import React, { useMemo } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register chart.js modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
)

interface BarChartData {
    label: string
    current: number
    previous?: number
}

interface BarChartProps {
    data: BarChartData[]
    currentLabel?: string
    previousLabel?: string
    formatValue?: (value: number) => string
    height?: number
    valueType?: 'currency' | 'number'
}

const BarChart: React.FC<BarChartProps> = ({
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
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                },
                ...(data.some(d => d.previous != null)
                    ? [
                        {
                            label: previousLabel,
                            data: data.map(d => d.previous ?? null),
                            backgroundColor: '#93c5fd',
                            borderRadius: 4,
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
                        label: (ctx: { dataset: { label?: string }; raw: unknown }) => {
                            const label = ctx.dataset.label || ''
                            const value = Number(ctx.raw)
                            return `${label}: ${finalFormatValue(value)}`
                        },
                    },
                },
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value: string | number) => formatYAxis(Number(value)),
                    },
                },
            },
        }
    }, [finalFormatValue, valueType])

    if (!data || data.length === 0) return null

    return (
        <div style={{ height }}>
            <Bar data={chartData} options={options} />
        </div>
    )
}

export default BarChart

