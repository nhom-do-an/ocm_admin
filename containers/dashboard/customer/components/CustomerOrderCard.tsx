'use client'

import React from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { Card } from 'antd'
import StatusChip from '@/containers/dashboard/order/components/StatusChip'
import { OrderDetail } from '@/types/response/order'

interface CustomerOrderCardProps {
    order: OrderDetail
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
})

const CustomerOrderCard: React.FC<CustomerOrderCardProps> = ({ order }) => {
    const orderDisplayName = order.name || `#${order.order_number ?? order.id}`
    const createdAt = order.created_at ? dayjs(order.created_at).format('DD/MM/YYYY HH:mm') : '---'
    const totalPrice = order.total_price ?? 0

    return (
        <Card
            size="small"
            className=" shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <Link
                        href={`/admin/order/${order.id}`}
                        className="text-base font-semibold text-blue-600 hover:text-blue-800"
                    >
                        {orderDisplayName}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">{createdAt}</p>
                </div>
                <StatusChip status={order.status || ''} type="order" />
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-xs uppercase text-gray-500">Thành tiền</p>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                        {totalPrice > 0 ? currencyFormatter.format(totalPrice) : '---'}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase text-gray-500">Thanh toán</p>
                    <div className="mt-1">
                        <StatusChip status={order.financial_status || ''} type="payment" />
                    </div>
                </div>
                <div>
                    <p className="text-xs uppercase text-gray-500">Chi nhánh</p>
                    <p className="font-medium text-gray-800 mt-1">{order.location?.name || '-'}</p>
                </div>
                <div>
                    <p className="text-xs uppercase text-gray-500">Nguồn đơn</p>
                    <p className="font-medium text-gray-800 mt-1">{order.source?.name || order.channel?.name || 'Admin'}</p>
                </div>
            </div>
        </Card>
    )
}

export default CustomerOrderCard










