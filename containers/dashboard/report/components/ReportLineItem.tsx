'use client'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import { GetRevenueResponse, GetTopSellingProductsResponse } from '@/types/response/report'
import { Tag } from 'antd'

interface ReportLineItemProps {
    title: string
    items: GetRevenueResponse[] | GetTopSellingProductsResponse[]
    type: 'revenue' | 'products'
    onClick?: () => void
}

const ReportLineItem: React.FC<ReportLineItemProps> = ({
    title,
    items,
    type,
    onClick,
}) => {
    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN') + '₫'
    }

    const renderRevenueItem = (item: GetRevenueResponse, index: number) => (
        <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
        >
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.current)}
                </p>
            </div>
        </div>
    )

    const renderProductItem = (item: GetTopSellingProductsResponse, index: number) => (
        <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
        >
            <div className="flex-1  flex flex-col">
                <span className="text-sm font-medium text-gray-900 wrap-break-word">{item.product_name}</span>
                <Tag color="blue" className='w-fit rounded-full border-none'>{item.title}</Tag>
            </div>
            <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 ">
                    {formatCurrency(item.total_revenue)}
                </span>
                <p className="text-xs text-gray-500">{item.total_sold} sản phẩm</p>
            </div>
        </div>
    )

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

            <div className="space-y-0">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Không có dữ liệu</p>
                ) : (
                    items.map((item, index) =>
                        type === 'revenue'
                            ? renderRevenueItem(item as GetRevenueResponse, index)
                            : renderProductItem(item as GetTopSellingProductsResponse, index)
                    )
                )}
            </div>
        </div>
    )
}

export default ReportLineItem



