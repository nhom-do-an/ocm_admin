'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Tag, Table, Row, Col } from 'antd'
import { ArrowLeft, Edit, Printer, X, Pencil } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { OrderDetail, LineItemDetail } from '@/types/response/order'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import { EFinancialStatus, EFulfillmentOrderStatus, EAuthorType } from '@/types/enums/enum'
import Image from 'next/image'
import { Source } from '@/types/response/source'
import Link from 'next/link'
import ReceivePaymentModal from './components/ReceivePaymentModal'
import LineItemNoteModal from './components/LineItemNoteModal'
import EditShippingAddressModal from './components/EditShippingAddressModal'
import UpdateAssigneeModal from './components/UpdateAssigneeModal'
import UpdateOrderNoteModal from './components/UpdateOrderNoteModal'
import UpdateExpectedDeliveryModal from './components/UpdateExpectedDeliveryModal'
import useOrderDetail from './hooks/use-order-detail'
import type { Event } from '@/types/response/event'
import DefaultProductImage from '@/resources/icons/default_img.svg'
import { AddressDetail } from '@/types/response/customer'

const OrderDetailView: React.FC = () => {
    const params = useParams()
    const router = useRouter()
    const { collapsed } = useGlobalContext()
    const [receivePaymentModalOpen, setReceivePaymentModalOpen] = useState(false)

    const orderId = params?.id ? Number(params.id) : null

    const {
        order,
        loading,
        events,
        eventsLoading,
        hasMoreEvents,
        transactions,
        handleLoadMoreEvents,
        refreshOrder,
        updateLineItemNote,
        updateShippingAddress,
        updateAssignee,
        updateOrderNote,
        updateExpectedDeliveryDate,
    } = useOrderDetail(orderId)
    const [noteModal, setNoteModal] = useState<{ open: boolean; lineItem?: LineItemDetail }>({
        open: false,
    })
    const [shippingModalOpen, setShippingModalOpen] = useState(false)
    const [assigneeModalOpen, setAssigneeModalOpen] = useState(false)
    const [orderNoteModalOpen, setOrderNoteModalOpen] = useState(false)
    const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)

    const openLineItemNoteModal = (lineItem: LineItemDetail) => {
        setNoteModal({
            open: true,
            lineItem,
        })
    }

    const closeLineItemNoteModal = () => {
        setNoteModal({
            open: false,
        })
    }

    const handleSaveLineItemNote = async (note: string) => {
        if (!noteModal.lineItem?.id) return
        await updateLineItemNote(noteModal.lineItem.id, note, noteModal.lineItem.quantity)
        closeLineItemNoteModal()
    }

    const handleOpenShippingModal = () => setShippingModalOpen(true)
    const handleCloseShippingModal = () => setShippingModalOpen(false)

    const handleSaveShippingAddress = async (address: AddressDetail | null) => {
        await updateShippingAddress(address)
        handleCloseShippingModal()
    }

    const handleSaveAssignee = async (assigneeId: number) => {
        await updateAssignee(assigneeId)
        setAssigneeModalOpen(false)
    }

    const handleSaveOrderNote = async (note: string) => {
        await updateOrderNote(note)
        setOrderNoteModalOpen(false)
    }

    const handleSaveExpectedDelivery = async (timestamp: number | null) => {
        const timestampSeconds = timestamp ? Math.floor(timestamp / 1000) : null
        await updateExpectedDeliveryDate(timestampSeconds)
        setDeliveryModalOpen(false)
    }

    const getFinancialStatusTag = (status?: EFinancialStatus | string) => {
        const normalizedStatus = (status || 'unpaid').toString().toLowerCase()
        const statusMap: Record<string, { color: string; text: string }> = {
            unpaid: { color: 'warning', text: 'Chưa thanh toán' },
            partial_paid: { color: 'processing', text: 'Thanh toán một phần' },
            paid: { color: 'success', text: 'Đã thanh toán' },
            partially_refunded: { color: 'warning', text: 'Hoàn tiền một phần' },
            refunded: { color: 'error', text: 'Đã hoàn tiền' },
        }
        return statusMap[normalizedStatus] || statusMap.unpaid
    }

    const getFulfillmentStatusTag = (status?: EFulfillmentOrderStatus) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            pending: { color: 'warning', text: 'Chưa xử lý' },
            fulfilled: { color: 'success', text: 'Đã xử lý' },
            partial_fulfilled: { color: 'processing', text: 'Xử lý một phần' },
        }
        return statusMap[status || 'pending'] || { color: 'warning', text: 'Chưa xử lý' }
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return '0₫'
        return `${amount.toLocaleString('vi-VN')}₫`
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatDateOnly = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const groupEventsByDate = (eventsList: Event[]) => {
        const grouped: Record<string, Event[]> = {}
        eventsList.forEach(event => {
            const dateKey = formatDateOnly(event.created_at)
            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(event)
        })
        return grouped
    }

    const getAuthorName = (event: Event) => {
        if (event.author_type === EAuthorType.System) {
            return 'Hệ thống'
        }
        return event.author_name || 'Người dùng'
    }

    const buildCustomerDisplayName = (customer?: OrderDetail['customer']) => {
        if (!customer) return ''
        const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim()
        return name || customer.email || 'Khách hàng'
    }

    const formatFullAddress = (address?: OrderDetail['shipping_address']) => {
        if (!address) return 'Chưa có địa chỉ giao hàng'
        return [address.address, address.ward_name, address.district_name, address.province_name]
            .filter(Boolean)
            .join(', ')
    }

    const renderSourceOption = (source?: Source) => (
        <div className="flex items-center gap-2 py-1">
            <div className="w-7 h-7 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-xs text-gray-500">
                {source?.image_url ? (
                    <Image
                        src={source.image_url}
                        alt={source.name || 'Nguồn đơn'}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    (source?.name || '?').slice(0, 2).toUpperCase()
                )}
            </div>
            <span className="text-sm text-gray-800">{source?.name || 'Nguồn đơn'}</span>
        </div>
    )

    const lineItemColumns: ColumnsType<LineItemDetail> = [
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 250,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                            src={record.image_url || DefaultProductImage}
                            alt={record.product_name || 'Sản phẩm'}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className='flex-flex-col'>
                        <Link href={`/product/${record.product_id}`} className="font-medium block">{record.product_name || 'Sản phẩm'}</Link>
                        {record.variant_title && (
                            <p className="text-xs text-gray-500">{record.variant_title}</p>
                        )}
                        {record.note && (
                            <div className="text-xs text-gray-600 mt-1">{record.note}</div>
                        )}
                        <button
                            type="button"
                            className="text-xs text-blue-600 mt-1"
                            onClick={() => openLineItemNoteModal(record)}
                        >
                            {record.note ? 'Sửa ghi chú' : 'Thêm ghi chú'}
                        </button>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 80,
            align: 'center',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            align: 'right',
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: 150,
            align: 'right',
            render: (_, record) => formatCurrency((record.price || 0) * (record.quantity || 0)),
        },
    ]

    if (loading) {
        return <div>Đang tải...</div>
    }

    if (!order) {
        return <div>Không tìm thấy đơn hàng</div>
    }

    const financialStatusValue = (order.financial_status || 'unpaid').toLowerCase() as EFinancialStatus
    const financialStatus = getFinancialStatusTag(financialStatusValue)
    const fulfillmentStatus = getFulfillmentStatusTag(order.fulfillment_status)
    const isFulfilled = order.fulfillment_status === 'fulfilled' || order.fulfillment_status === 'partial_fulfilled'

    const totalAmount = order.total_price || 0
    const shippingFee = order.shipping_lines?.reduce((sum, line) => sum + (line.price || 0), 0) || 0
    const finalAmount = totalAmount + shippingFee

    // Tính tổng số tiền đã thanh toán (từ transactions success)
    const totalPaidAmount = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
    // Số tiền còn lại
    const remainingAmount = finalAmount - totalPaidAmount

    return (
        <>
            {loading ? <></> : (
                <div className="min-h-screen">
                    {/* Header */}
                    <div className={`bg-white h-[65px] z-100 fixed top-0 left-0 w-full flex flex-col justify-center ${collapsed ? '!w-[calc(100%-80px)] left-20' : '!w-[calc(100%-256px)] left-64'} transition-all max-sm:!w-full max-sm:left-0`}>
                        <div className="bg-white h-full flex items-center justify-between shadow-lg w-full px-5">
                            <div className="flex gap-1 items-center">
                                <Button
                                    className='!border !border-gray-200'
                                    type="text"
                                    icon={<ArrowLeft size={20} />}
                                    onClick={() => router.back()}
                                />
                                <h2 className="text-xl font-semibold ml-3 text-center max-md:hidden">Chi tiết đơn hàng</h2>
                            </div>
                            <div className='flex gap-2 overflow-wrap'>
                                {!isFulfilled && (
                                    <Button icon={<Edit size={16} />}>Sửa đơn</Button>
                                )}
                                <Button icon={<Printer size={16} />}>In đơn hàng</Button>

                                <Button danger icon={<X size={16} />}>Hủy đơn hàng</Button>

                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-[1400px] mx-auto p-6">
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-4 h-[60px]">
                                <span className="text-2xl font-medium">{order.name || order.order_number}</span>
                                <div className="flex">
                                    <Tag color={financialStatus.color}>{financialStatus.text}</Tag>
                                    <Tag color={fulfillmentStatus.color}>{fulfillmentStatus.text}</Tag>
                                </div>

                            </div>
                            {/* Timeline - sẽ bổ sung sau */}
                        </div>

                        <Row gutter={24}>
                            {/* Left Column */}
                            <Col xs={24} lg={16}>
                                {/* Sản phẩm */}
                                <Card className="!mb-4">
                                    <Tag color={fulfillmentStatus.color}>{fulfillmentStatus.text}</Tag>
                                    <p className="text-sm text-gray-500 font-semibold">Chi nhánh: {order.location?.name}</p>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold mt-2">Sản phẩm</h2>
                                    </div>

                                    {order.line_items && order.line_items.length > 0 ? (
                                        <Table
                                            dataSource={order.line_items}
                                            scroll={{ x: 'max-content' }}
                                            columns={lineItemColumns}
                                            pagination={false}
                                            rowKey="id"
                                        />
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            Chưa có sản phẩm
                                        </div>
                                    )}

                                    {order.fulfillment_status === 'pending' && (
                                        <div className="flex gap-3 mt-4 justify-end">
                                            <Button type="default">Đẩy vận chuyển</Button>
                                            <Button type="primary">Xác nhận giao hàng</Button>
                                        </div>
                                    )}
                                </Card>

                                {/* Thanh toán */}
                                <Card className="!mb-4">
                                    <Tag color={financialStatus.color}>{financialStatus.text}</Tag>
                                    <div className="space-y-4">

                                        <div className="space-y-3">
                                            <div className="flex justify-between text-base">
                                                <span>Tổng tiền hàng</span>
                                                <span className="font-medium">{formatCurrency(totalAmount)}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-base">
                                                <span>Phí giao hàng</span>
                                                <span className="font-medium">{order.shipping_lines?.[0]?.price ? formatCurrency(order.shipping_lines?.[0]?.price) : '0₫'}</span>
                                            </div>

                                            <div className="flex justify-between items-center text-lg font-semibold">
                                                <span>Thành tiền</span>
                                                <span className="w-24 text-right">{formatCurrency(finalAmount)}</span>
                                            </div>
                                        </div>

                                        {transactions.length > 0 && (
                                            <div className="border-t pt-3 space-y-2">
                                                <div className="text-sm font-semibold text-gray-700 mb-2">Khách đã trả</div>
                                                {transactions.map((transaction) => (
                                                    <div key={transaction.id} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{transaction.payment_method_name || 'N/A'}</span>
                                                        <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(financialStatusValue === EFinancialStatus.UNPAID || (financialStatusValue === EFinancialStatus.PARTIALLY_PAID && remainingAmount > 0)) && (
                                            <div className="flex gap-3 mt-4 justify-end">
                                                <Button type="default">Lấy mã QR</Button>
                                                <Button type="primary" onClick={() => setReceivePaymentModalOpen(true)}>
                                                    Nhận tiền
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Lịch sử đơn hàng */}
                                <Card className="!mb-4">
                                    <h2 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h2>
                                    {events.length > 0 ? (
                                        <div className="space-y-6">
                                            {Object.entries(groupEventsByDate(events)).map(([date, dateEvents]) => (
                                                <div key={date}>
                                                    <div className="text-sm font-semibold text-gray-700 mb-3">{date}</div>
                                                    <div className="relative pl-8">
                                                        <div className="absolute left-[6px] top-0 bottom-0 w-0.5 bg-blue-200"></div>
                                                        {dateEvents.map((event, index) => (
                                                            <div key={event.id || index} className="relative mb-4 last:mb-0">
                                                                <div className="absolute -left-[25px]  top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white z-10 -translate-x-1/2"></div>
                                                                <div className="ml-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-sm font-medium text-gray-900">
                                                                            {formatTime(event.created_at)}
                                                                        </span>
                                                                        <span className="text-sm text-gray-600">
                                                                            {getAuthorName(event)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700">
                                                                        {event.description || event.message || 'Không có mô tả'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {hasMoreEvents && (
                                                <div className="text-center pt-4">
                                                    <Button
                                                        type="link"
                                                        onClick={handleLoadMoreEvents}
                                                        loading={eventsLoading}
                                                    >
                                                        Xem thêm
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            {eventsLoading ? 'Đang tải...' : 'Chưa có lịch sử'}
                                        </div>
                                    )}
                                </Card>

                            </Col>

                            {/* Right Column */}
                            <Col xs={24} lg={8}>
                                {/* Nguồn đơn */}
                                {order.source && (
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-1">Nguồn đơn</h2>
                                        <div className="flex items-center gap-2">
                                            {renderSourceOption(order.source)}
                                        </div>
                                    </Card>
                                )}

                                {/* Khách hàng */}
                                {order.customer && (
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Khách hàng</h2>
                                        <div className="space-y-1">
                                            {/* Customer summary */}
                                            <div className="">
                                                <div className="space-y-2">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {buildCustomerDisplayName(order.customer)}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Tổng chi tiêu ({order.customer.orders_count ?? 0} đơn):
                                                        <span className="font-semibold text-gray-900 ml-1">{formatCurrency(order.customer.total_spent)}</span>
                                                    </p>
                                                    {order.customer.last_order_name && (
                                                        <button
                                                            type="button"
                                                            className="text-xs text-blue-600"
                                                            onClick={() => order.customer?.last_order_id && router.push(`/order/${order.customer.last_order_id}`)}
                                                        >
                                                            Đơn gần nhất: {order.customer.last_order_name}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact info */}
                                            <div className=" space-y-1  border-gray-200 border-t">
                                                <h3 className="font-semibold text-sm text-gray-900 mb-1">Thông tin liên hệ</h3>
                                                <p className="text-sm text-gray-700">Email: {order.customer.email || 'Chưa có email'}</p>
                                                <p className="text-sm text-gray-700">Số điện thoại: {order.customer.phone || 'Chưa có số điện thoại'}</p>
                                            </div>

                                            {/* Shipping address */}
                                            {order.shipping_address ? (
                                                <div className=" border-gray-200 border-t">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-semibold text-sm text-gray-900">Địa chỉ giao hàng</h3>
                                                        <Button type="text" size="small" icon={<Pencil size={14} />} onClick={handleOpenShippingModal} />
                                                    </div>
                                                    <div className="text-sm text-gray-700 space-y-1">
                                                        <p>{[order.shipping_address.first_name, order.shipping_address.last_name].filter(Boolean).join(' ') || buildCustomerDisplayName(order.customer)}</p>
                                                        <p>{order.shipping_address.email || order.customer.email || 'Chưa có email'}</p>
                                                        <p>{order.shipping_address.phone || order.customer.default_address?.phone || order.customer.phone || 'Chưa có số điện thoại'}</p>
                                                        <p>{formatFullAddress(order.shipping_address)}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 border-gray-200 border-t">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-semibold text-sm text-gray-900">Địa chỉ giao hàng</h3>
                                                        <Button type="text" size="small" icon={<Pencil size={14} />} onClick={handleOpenShippingModal} />
                                                    </div>
                                                    <p className="text-sm text-gray-700">Chưa có địa chỉ giao hàng</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                {/* Ghi chú */}
                                <Card className="!mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
                                        <Button type="text" size="small" icon={<Pencil size={14} />} onClick={() => setOrderNoteModalOpen(true)} />
                                    </div>

                                    <p className="text-sm text-gray-700">
                                        {order.note || 'Chưa có ghi chú'}
                                    </p>
                                </Card>

                                {/* Thông tin bổ sung */}
                                <Card className="!mb-4">
                                    <h2 className="text-lg font-semibold mb-4">Thông tin bổ sung</h2>

                                    {order.location && (
                                        <div className="mb-4">
                                            <label className="text-sm text-gray-600 mb-1 block">Bán tại chi nhánh</label>
                                            <p className="text-sm font-medium">{order.location.name}</p>
                                        </div>
                                    )}

                                    {order.assignee && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-sm text-gray-600">Nhân viên phụ trách</label>
                                                <Button type="text" size="small" icon={<Pencil size={14} />} onClick={() => setAssigneeModalOpen(true)} />
                                            </div>
                                            <p className="text-sm font-medium">{order.assignee.name}</p>
                                        </div>
                                    )}

                                    {order.user && (
                                        <div className="mb-4">
                                            <label className="text-sm text-gray-600 mb-1 block">Nhân viên tạo đơn</label>
                                            <p className="text-sm font-medium">{order.user.name}</p>
                                        </div>
                                    )}

                                    {order.created_at && (
                                        <div className="mb-4">
                                            <label className="text-sm text-gray-600 mb-1 block">Ngày đặt hàng</label>
                                            <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                                            <p className="text-xs text-gray-500 mt-1">Giá trị chỉ ghi nhận khi tạo đơn hàng</p>
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-sm text-gray-600">Ngày hẹn giao</label>
                                            <Button type="text" size="small" icon={<Pencil size={14} />} onClick={() => setDeliveryModalOpen(true)} />
                                        </div>
                                        <p className="text-sm font-medium">
                                            {order.expected_delivery_date ? formatDate(order.expected_delivery_date) : 'Chưa có ngày hẹn giao'}
                                        </p>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            )}

            {orderId && order && (
                <ReceivePaymentModal
                    open={receivePaymentModalOpen}
                    onCancel={() => setReceivePaymentModalOpen(false)}
                    onSuccess={refreshOrder}
                    orderId={orderId}
                    amount={financialStatusValue === EFinancialStatus.PARTIALLY_PAID ? remainingAmount : finalAmount}
                />
            )}
            <LineItemNoteModal
                open={noteModal.open}
                defaultValue={noteModal.lineItem?.note}
                onCancel={closeLineItemNoteModal}
                onSave={handleSaveLineItemNote}
            />
            {order && (
                <EditShippingAddressModal
                    open={shippingModalOpen}
                    customerId={order.customer?.id}
                    initialAddress={order.shipping_address}
                    onCancel={handleCloseShippingModal}
                    onSave={handleSaveShippingAddress}
                />
            )}
            <UpdateAssigneeModal
                open={assigneeModalOpen}
                currentAssigneeId={order?.assignee?.id}
                onCancel={() => setAssigneeModalOpen(false)}
                onSave={handleSaveAssignee}
            />
            <UpdateOrderNoteModal
                open={orderNoteModalOpen}
                defaultValue={order?.note || ''}
                onCancel={() => setOrderNoteModalOpen(false)}
                onSave={handleSaveOrderNote}
            />
            <UpdateExpectedDeliveryModal
                open={deliveryModalOpen}
                defaultValue={order?.expected_delivery_date || null}
                onCancel={() => setDeliveryModalOpen(false)}
                onSave={handleSaveExpectedDelivery}
            />
        </>
    )
}

export default OrderDetailView
