'use client'
import React from 'react'
import { ArrowRight } from 'lucide-react'

interface ReportCardProps {
    title: string
    value: number | string
    percentage?: number
    onClick?: () => void
    formatValue?: (value: number | string) => string
}

const ReportCard: React.FC<ReportCardProps> = ({
    title,
    value,
    percentage,
    onClick,
    formatValue = (val) => {
        if (typeof val === 'number') {
            return val.toLocaleString('vi-VN') + '₫'
        }
        return String(val)
    },
}) => {

    const handleClick = () => {
        if (onClick) {
            onClick()
        }
    }

    const getPercentageColor = () => {
        if (percentage === undefined || percentage === null) return 'text-gray-500'
        if (percentage > 0) return 'text-green-600'
        if (percentage < 0) return 'text-red-600'
        return 'text-gray-500'
    }

    const formatPercentage = () => {
        if (percentage === undefined || percentage === null) return '-'
        const sign = percentage > 0 ? '+' : ''
        return `${sign}${percentage.toFixed(0)}%`
    }

    return (
        <div className="bg-white rounded-lg shadow-sm px-3 py-2 hover:shadow-md transition-shadow">
            <div className="flex flex-col">
                <div className=" justify-between flex items-center ">
                    <span className="font-light text-gray-600 ">{title}</span>

                    {onClick && (
                        <button
                            onClick={handleClick}
                            className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ArrowRight size={20} className="text-gray-400" />
                        </button>
                    )}

                </div>
                <div className="flex gap-1 items-center">
                    <p className="text-[18px] font-semibold text-gray-900 ">
                        <span className="mr-1">{formatValue(value)}</span>
                        {percentage !== undefined && percentage !== null && (
                            <sup className={`text-[10px] font-medium ${getPercentageColor()}`}>
                                {percentage > 0 && <span>↑</span>}
                                {percentage < 0 && <span>↓</span>}
                                {formatPercentage()}
                            </sup>
                        )}
                    </p>

                </div>

            </div>
        </div>
    )
}

export default ReportCard


