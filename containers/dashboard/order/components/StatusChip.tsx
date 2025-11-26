'use client'
import React from 'react'
import {
    EOrderStatus,
    EFulfillmentOrderStatus,
    EFulfillmentShipmentStatus,
    EFinancialStatus,
    EFulfillmentStatus,
} from '@/types/enums/enum'

interface StatusChipProps {
    status: string
    type: 'payment' | 'processing' | 'fulfillment' | 'delivery' | 'print' | 'order' | 'packaging'
    className?: string
}

const StatusChip: React.FC<StatusChipProps> = ({ status, type, className = '' }) => {
    const getStatusConfig = (status: string, type: string) => {
        const configs: Record<string, Record<string, { text: string; bgColor: string; textColor: string }>> = {
            payment: {
                [EFinancialStatus.UNPAID]: { text: 'Chưa thanh toán', bgColor: '#fffbe6', textColor: '#faad14' },
                [EFinancialStatus.PAID]: { text: 'Đã thanh toán', bgColor: '#f6ffed', textColor: '#52c41a' },
                [EFinancialStatus.PARTIALLY_PAID]: { text: 'Thanh toán một phần', bgColor: '#e6f7ff', textColor: '#1890ff' },
                [EFinancialStatus.PARTIALLY_REFUNDED]: { text: 'Hoàn tiền một phần', bgColor: '#e6f7ff', textColor: '#1890ff' },
                [EFinancialStatus.REFUNDED]: { text: 'Đã hoàn tiền', bgColor: '#fff1f0', textColor: '#ff4d4f' },
            },
            order: {
                [EOrderStatus.ORDERED]: { text: 'Đặt hàng', bgColor: '#e6f7ff', textColor: '#1890ff' },
                [EOrderStatus.CONFIRMED]: { text: 'Đang giao dịch', bgColor: '#e6f7ff', textColor: '#1890ff' },
                [EOrderStatus.COMPLETED]: { text: 'Đã hoàn thành', bgColor: '#f6ffed', textColor: '#52c41a' },
                [EOrderStatus.CANCELLED]: { text: 'Đã hủy', bgColor: '#fff1f0', textColor: '#ff4d4f' },
            },
            processing: {
                [EFulfillmentOrderStatus.FULFILLED]: { text: 'Đã xử lý', bgColor: '#e6f7ff', textColor: '#1890ff' },
                [EFulfillmentOrderStatus.PENDING]: { text: 'Chưa xử lý', bgColor: '#fffbe6', textColor: '#faad14' },
                [EFulfillmentOrderStatus.PARTIALLY_FULFILLED]: { text: 'Xử lý một phần', bgColor: '#e6f7ff', textColor: '#1890ff' },
                partial: { text: 'Xử lý một phần', bgColor: '#e6f7ff', textColor: '#1890ff' },
            },
            fulfillment: {
                [EFulfillmentStatus.SUCCESS]: { text: 'Đã đóng gói', bgColor: '#f6ffed', textColor: '#52c41a' },
            },
            packaging: {
                [EFulfillmentStatus.SUCCESS]: { text: 'Đã đóng gói', bgColor: '#f6ffed', textColor: '#52c41a' },
                'fulfilled': { text: 'Đã đóng gói', bgColor: '#f6ffed', textColor: '#52c41a' },
                'unfulfilled': { text: 'Chưa đóng gói', bgColor: '#fffbe6', textColor: '#faad14' },
            },
            delivery: {
                [EFulfillmentShipmentStatus.DELIVERED]: { text: 'Đã giao hàng', bgColor: '#f6ffed', textColor: '#52c41a' },
                [EFulfillmentShipmentStatus.DELIVERING]: { text: 'Đang vận chuyển', bgColor: '#e6f7ff', textColor: '#1890ff' },
                [EFulfillmentShipmentStatus.PICKED_UP]: { text: 'Đã lấy hàng', bgColor: '#e6f7ff', textColor: '#1890ff' },
                [EFulfillmentShipmentStatus.PENDING]: { text: 'Chờ giao hàng', bgColor: '#fffbe6', textColor: '#faad14' },
                [EFulfillmentShipmentStatus.RETRY_DELIVERY]: { text: 'Chờ giao lại', bgColor: '#fffbe6', textColor: '#faad14' },
                [EFulfillmentShipmentStatus.RETURNING]: { text: 'Đang trả hàng', bgColor: '#fffbe6', textColor: '#faad14' },
                [EFulfillmentShipmentStatus.WAIT_TO_CONFIRM]: { text: 'Chờ xác nhận hoàn hàng', bgColor: '#fffbe6', textColor: '#faad14' },
                [EFulfillmentShipmentStatus.RETURNED]: { text: 'Đã trả hàng', bgColor: '#fff1f0', textColor: '#ff4d4f' },
                [EFulfillmentShipmentStatus.CANCELLED]: { text: 'Đã hủy', bgColor: '#fff1f0', textColor: '#ff4d4f' },
                in_transit: { text: 'Đang vận chuyển', bgColor: '#e6f7ff', textColor: '#1890ff' },
                deliveried: { text: 'Đã giao hàng', bgColor: '#f6ffed', textColor: '#52c41a' },
            },
            print: {
                'printed': { text: 'Đã in', bgColor: '#fafafa', textColor: '#8c8c8c' },
                'not_printed': { text: 'Chưa in', bgColor: '#fffbe6', textColor: '#faad14' },
            },
        }

        return configs[type]?.[status] || { text: status || '-', bgColor: '#fafafa', textColor: '#8c8c8c' }
    }

    const config = getStatusConfig(status, type)

    return (
        <span
            className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${className}`}
            style={{
                backgroundColor: config.bgColor,
                color: config.textColor,
            }}
        >
            {config.text}
        </span>
    )
}

export default StatusChip


