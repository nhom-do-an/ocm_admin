'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Tag, Row, Col } from 'antd'
import { ArrowLeft, Edit, Printer, X, Pencil } from 'lucide-react'
import { OrderDetail, LineItemDetail } from '@/types/response/order'
import { EFinancialStatus, EFulfillmentOrderStatus, EAuthorType, EOrderStatus } from '@/types/enums/enum'
import Image from 'next/image'
import { Source } from '@/types/response/source'
import ReceivePaymentModal from './components/ReceivePaymentModal'
import LineItemNoteModal from './components/LineItemNoteModal'
import EditShippingAddressModal from './components/EditShippingAddressModal'
import UpdateAssigneeModal from './components/UpdateAssigneeModal'
import UpdateOrderNoteModal from './components/UpdateOrderNoteModal'
import UpdateExpectedDeliveryModal from './components/UpdateExpectedDeliveryModal'
import OrderQRPaymentModal from './components/OrderQRPaymentModal'
import useOrderDetail from './hooks/use-order-detail'
import type { Event } from '@/types/response/event'
import { AddressDetail } from '@/types/response/customer'
import InvoiceViewer from './components/InvoiceViewer'
import OrderLineItemsView from './components/OrderLineItemsView'
import CancelOrderModal from './components/CancelOrderModal'
import StatusChip from './components/StatusChip'
import orderService from '@/services/order'
import { message } from 'antd'

const OrderDetailView: React.FC = () => {
    const params = useParams()
    const router = useRouter()
    const [receivePaymentModalOpen, setReceivePaymentModalOpen] = useState(false)

    const orderId = params?.id ? Number(params.id) : null

    const {
        order,
        loading,
        events,
        eventsLoading,
        hasMoreEvents,
        transactions,
        shipments,
        shipmentsLoading,
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
    const [invoiceViewerOpen, setInvoiceViewerOpen] = useState(false)
    const [printingOrder, setPrintingOrder] = useState(false)
    const [cancelOrderModalOpen, setCancelOrderModalOpen] = useState(false)
    const [cancellingOrder, setCancellingOrder] = useState(false)
    const [qrPaymentModalOpen, setQrPaymentModalOpen] = useState(false)

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
        console.log('Saving shipping address:', address)
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

    const handlePrintOrder = async () => {
        if (!orderId) return

        try {
            setPrintingOrder(true)
            const htmlContent = await orderService.GetOrderPrint(orderId)

            // Tạo iframe ẩn để in
            const iframe = document.createElement('iframe')
            iframe.style.position = 'fixed'
            iframe.style.right = '0'
            iframe.style.bottom = '0'
            iframe.style.width = '0'
            iframe.style.height = '0'
            iframe.style.border = '0'
            document.body.appendChild(iframe)

            // Ghi HTML vào iframe
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
            if (iframeDoc) {
                iframeDoc.open()
                iframeDoc.write(htmlContent)
                iframeDoc.close()

                // Đợi một chút để đảm bảo nội dung đã load
                setTimeout(() => {
                    iframe.contentWindow?.focus()
                    iframe.contentWindow?.print()

                    // Xóa iframe sau khi in
                    setTimeout(() => {
                        document.body.removeChild(iframe)
                    }, 1000)
                }, 250)
            }
        } catch (error) {
            console.error('Error printing order:', error)
            message.error('Không thể in đơn hàng')
        } finally {
            setPrintingOrder(false)
        }
    }

    const handleCancelOrder = async (data: { cancel_reason: string; restore_inventory?: boolean; send_email?: boolean }) => {
        if (!orderId) return

        try {
            setCancellingOrder(true)
            await orderService.cancelOrder(orderId, {
                cancel_reason: data.cancel_reason,
            })
            message.success('Hủy đơn hàng thành công')
            setCancelOrderModalOpen(false)
            await refreshOrder()
        } catch (error) {
            console.error('Error cancelling order:', error)
            message.error('Không thể hủy đơn hàng')
        } finally {
            setCancellingOrder(false)
        }
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
                    <div className={` z-100 w-full flex flex-col justify-center transition-all pt-4`}>
                        <div className=" h-full flex items-center justify-between w-full">
                            <div className="flex gap-1 items-center bg-white rounded-[10px]!">
                                <Button
                                    className='border! border-gray-200!'
                                    type="text"
                                    icon={<ArrowLeft size={20} />}
                                    onClick={() => router.push("/admin/order/list")}
                                />
                            </div>
                            <div className='flex gap-2 overflow-wrap'>
                                {!isFulfilled && order.status !== EOrderStatus.CANCELLED && (
                                    <Button
                                        icon={<Edit size={16} />}
                                        onClick={() => router.push(`/admin/order/${orderId}/edit`)}
                                    >
                                        Sửa đơn
                                    </Button>
                                )}
                                <Button
                                    icon={<Printer size={16} />}
                                    onClick={handlePrintOrder}
                                    loading={printingOrder}
                                >
                                    In đơn hàng
                                </Button>

                                {order.status !== EOrderStatus.CANCELLED && (
                                    <Button
                                        danger
                                        icon={<X size={16} />}
                                        onClick={() => setCancelOrderModalOpen(true)}
                                    >
                                        Hủy đơn hàng
                                    </Button>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-[1400px] mx-auto p-2">
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-4 h-[60px]">
                                <span className="text-2xl font-medium">{order.name || order.order_number}</span>
                                <div className="flex gap-2">
                                    <Tag color={financialStatus.color}>{financialStatus.text}</Tag>
                                    <Tag color={fulfillmentStatus.color}>{fulfillmentStatus.text}</Tag>
                                    {order.status === EOrderStatus.CANCELLED && (
                                        <StatusChip status={EOrderStatus.CANCELLED} type="order" />
                                    )}
                                </div>

                            </div>
                            {/* Timeline - sẽ bổ sung sau */}
                        </div>

                        <Row gutter={22} >
                            {/* Left Column */}
                            <Col xs={24} lg={16}>
                                {/* Sản phẩm */}
                                <OrderLineItemsView
                                    order={order}
                                    shipments={shipments}
                                    shipmentsLoading={shipmentsLoading}
                                    fulfillmentStatus={fulfillmentStatus}
                                    onOpenLineItemNoteModal={openLineItemNoteModal}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                    onRefreshShipments={refreshOrder}
                                    onRefreshOrder={refreshOrder}
                                    isOrderCancelled={order.status === EOrderStatus.CANCELLED}
                                />

                                {/* Thanh toán */}
                                <Card className="mb-2!">
                                    <Tag color={financialStatus.color}>{financialStatus.text}</Tag>
                                    <div className="space-y-2">

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Tổng tiền hàng</span>
                                                <span className="font-medium">{formatCurrency(totalAmount)}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span>Phí giao hàng</span>
                                                <span className="font-medium">{order.shipping_lines?.[0]?.price ? formatCurrency(order.shipping_lines?.[0]?.price) : '0₫'}</span>
                                            </div>

                                            <div className="flex justify-between items-center font-semibold">
                                                <span>Thành tiền</span>
                                                <span className="w-24 text-right">{formatCurrency(finalAmount)}</span>
                                            </div>
                                        </div>

                                        {transactions.length > 0 && (
                                            <div className="border-t pt-3 space-y-2 border-gray-100">
                                                <div className="text-sm font-semibold text-gray-700 mb-2">Khách đã trả</div>
                                                {transactions.map((transaction) => (
                                                    <div key={transaction.id} className="flex justify-between text-sm">
                                                        <span className="text-gray-600">{transaction.payment_method_name || 'N/A'}</span>
                                                        <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(financialStatusValue === EFinancialStatus.UNPAID || (financialStatusValue === EFinancialStatus.PARTIALLY_PAID && remainingAmount > 0)) && order.status !== EOrderStatus.CANCELLED && (
                                            <div className="flex gap-3 mt-4 justify-end">
                                                <Button type="default" onClick={() => setQrPaymentModalOpen(true)}>Lấy mã QR</Button>
                                                <Button type="primary" onClick={() => setReceivePaymentModalOpen(true)}>
                                                    Nhận tiền
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Lịch sử đơn hàng */}
                                <Card className="mb-2!">
                                    <h2 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h2>
                                    {events.length > 0 ? (
                                        <div className="space-y-6">
                                            {Object.entries(groupEventsByDate(events)).map(([date, dateEvents]) => (
                                                <div key={date}>
                                                    <div className="text-sm font-semibold text-gray-700 mb-3">{date}</div>
                                                    <div className="relative pl-8">
                                                        <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-blue-200"></div>
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
                                    <Card className="mb-2!">
                                        <h2 className="text-lg font-semibold mb-1">Nguồn đơn</h2>
                                        <div className="flex items-center gap-2">
                                            {renderSourceOption(order.source)}
                                        </div>
                                    </Card>
                                )}

                                {/* Khách hàng */}
                                {order.customer && (
                                    <Card className="mb-2!">
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
                                                            onClick={() => order.customer?.last_order_id && router.push(`/admin/order/${order.customer.last_order_id}`)}
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
                                <Card className="mb-2!">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
                                        <Button type="text" size="small" icon={<Pencil size={14} />} onClick={() => setOrderNoteModalOpen(true)} />
                                    </div>

                                    <p className="text-sm text-gray-700">
                                        {order.note || 'Chưa có ghi chú'}
                                    </p>
                                </Card>

                                {/* Thông tin bổ sung */}
                                <Card className="mb-2!">
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
            <InvoiceViewer
                open={invoiceViewerOpen}
                orderId={orderId || 0}
                onCancel={() => setInvoiceViewerOpen(false)}
            />
            <CancelOrderModal
                open={cancelOrderModalOpen}
                onCancel={() => setCancelOrderModalOpen(false)}
                onConfirm={handleCancelOrder}
                loading={cancellingOrder}
            />
            {orderId && (
                <OrderQRPaymentModal
                    open={qrPaymentModalOpen}
                    onCancel={() => setQrPaymentModalOpen(false)}
                    orderId={orderId}
                    amount={financialStatusValue === EFinancialStatus.PARTIALLY_PAID ? remainingAmount : finalAmount}
                />
            )}

        </>
    )
}

export default OrderDetailView
