'use client'

import React, { useMemo } from 'react'
import { Button, Card, Divider, Empty, Space, Spin, Tag } from 'antd'
import { ArrowLeft, Pencil, ShoppingBag } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import dayjs from 'dayjs'
import CustomerOrderCard from './components/CustomerOrderCard'
import { useCustomerDetail } from './hooks/use-customer-detail'
import EmptyState from '@/components/common/EmptyState'
import NotFoundOrder from '@/resources/icons/not-found-order.svg'

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
})

const CustomerDetailView: React.FC = () => {
    const router = useRouter()
    const params = useParams()
    const rawId = params?.id
    const customerId = useMemo(() => {
        if (Array.isArray(rawId)) {
            return parseInt(rawId[0], 10)
        }
        return rawId ? parseInt(rawId, 10) : undefined
    }, [rawId])

    const {
        customer,
        orders,
        loadingCustomer,
        loadingOrders,
    } = useCustomerDetail(customerId)

    const customerName = useMemo(() => {
        if (!customer) return 'Khách hàng'
        const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim()
        return fullName || customer.email || customer.phone || 'Khách hàng'
    }, [customer])

    const totalSpent = customer?.total_spent || 0
    const orderCount = customer?.orders_count || 0
    const averageSpent = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0
    const lastOrderName = customer?.last_order_name || '---'
    const lastOrderAt = customer?.updated_at ? dayjs(customer.updated_at).format('DD/MM/YYYY HH:mm') : '---'
    const statusTag = customer?.status === 'enabled'
        ? { color: 'green', text: 'Đã có tài khoản' }
        : { color: 'orange', text: 'Chưa có tài khoản' }

    if (!customerId) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <Empty description="Không tìm thấy khách hàng" />
            </div>
        )
    }

    if (loadingCustomer && !customer) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <Spin size="large" />
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <EmptyState
                    imageSrc={NotFoundOrder}
                    title="Không tìm thấy khách hàng"
                    description="Có thể khách hàng đã bị xóa hoặc không tồn tại. Vui lòng quay lại danh sách khách hàng."
                    actionLabel="Quay lại danh sách"
                    actionHref="/admin/customer/list"
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 flex items-start justify-center px-4 py-6 overflow-y-auto">
                <div className="w-full max-w-[1400px] flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    type="text"
                                    icon={<ArrowLeft size={20} />}
                                    onClick={() => router.back()}
                                />
                                <div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-2xl font-semibold text-gray-900">{customerName}</h1>
                                        <Tag color={statusTag.color}>{statusTag.text}</Tag>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">ID khách hàng: #{customer.id}</p>
                                </div>
                            </div>
                            <Space wrap>
                                <Button
                                    icon={<ShoppingBag size={16} />}
                                    onClick={() => router.push(`/admin/order/create?customer_id=${customer.id}`)}
                                >
                                    Tạo đơn hàng
                                </Button>
                                <Button
                                    icon={<Pencil size={16} />}
                                    onClick={() => router.push(`/admin/customer/create?id=${customer.id}`)}
                                >
                                    Chỉnh sửa thông tin
                                </Button>
                            </Space>
                        </div>

                        <Card className="!rounded-2xl !border-gray-200 shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Đơn hàng gần nhất</p>
                                    <p className="text-xl font-semibold text-gray-900 mt-2">{lastOrderName}</p>
                                    <p className="text-sm text-gray-500 mt-1">Cập nhật: {lastOrderAt}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tổng chi tiêu</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-2">
                                        {currencyFormatter.format(totalSpent)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Chi tiêu trung bình</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-2">
                                        {currencyFormatter.format(averageSpent)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{orderCount} đơn hàng</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card
                                className="!rounded-2xl !border-gray-200 shadow-md h-full"
                                title="Đơn hàng gần đây"
                                extra={
                                    <Space>
                                        <Button
                                            type="link"
                                            className="!px-0"
                                            onClick={() => router.push(`/admin/order/list?customer_ids=${customer.id}`)}
                                        >
                                            Xem tất cả
                                        </Button>
                                    </Space>
                                }
                            >
                                {loadingOrders ? (
                                    <div className="flex justify-center py-10">
                                        <Spin />
                                    </div>
                                ) : orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map(order => (
                                            <CustomerOrderCard key={order.id} order={order} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState
                                        imageSrc={NotFoundOrder}
                                        title="Chưa có đơn hàng nào"
                                        description="Khách hàng này chưa phát sinh đơn hàng. Bạn có thể tạo đơn ngay bây giờ."
                                        actionLabel="Tạo đơn hàng"
                                        onActionClick={() => router.push(`/admin/order/create?customer_id=${customer.id}`)}
                                    />
                                )}
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="!rounded-2xl !border-gray-200 shadow-sm" title="Thông tin liên hệ">
                                <div className="space-y-3 text-sm text-gray-700">
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium">{customer.email || 'Chưa có email'}</p>
                                    </div>
                                    <Divider className="my-2" />
                                    <div>
                                        <p className="text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{customer.phone || 'Chưa có số điện thoại'}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="!rounded-2xl !border-gray-200 shadow-sm" title="Địa chỉ mặc định">
                                {customer.default_address ? (
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p className="font-semibold">
                                            {[customer.default_address.first_name, customer.default_address.last_name]
                                                .filter(Boolean)
                                                .join(' ')
                                                .trim() || customerName}
                                        </p>
                                        <p>{customer.default_address.phone || customer.phone || '---'}</p>
                                        <p className="text-gray-500">
                                            {[
                                                customer.default_address.address,
                                                customer.default_address.ward_name,
                                                customer.default_address.district_name,
                                                customer.default_address.province_name,
                                            ]
                                                .filter(Boolean)
                                                .join(', ') || 'Chưa có địa chỉ'}
                                        </p>
                                        {customer.default_address.zip && (
                                            <p className="text-gray-500">Zipcode: {customer.default_address.zip}</p>
                                        )}
                                    </div>
                                ) : (
                                    <Empty
                                        description="Chưa có địa chỉ"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>

                            <Card className="!rounded-2xl !border-gray-200 shadow-sm" title="Ghi chú">
                                <p className="text-sm text-gray-700 min-h-[80px]">
                                    {customer.note || 'Chưa có ghi chú cho khách hàng này.'}
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerDetailView










