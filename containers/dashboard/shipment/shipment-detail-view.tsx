'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Row, Col, Table } from 'antd'
import { ArrowLeft, Printer, X, Pencil } from 'lucide-react'
import { LineItemDetail } from '@/types/response/order'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import { EAuthorType } from '@/types/enums/enum'
import Image from 'next/image'
import useShipmentDetail from './hooks/use-shipment-detail'
import type { Event } from '@/types/response/event'
import StatusChip from '../order/components/StatusChip'
import shipmentService from '@/services/shipment'
import { message } from 'antd'
import DefaultProductImage from '@/resources/icons/default_img.svg'
import UpdateShipmentNoteModal from './components/UpdateShipmentNoteModal'
import UpdateShipmentPaymentModal from './components/UpdateShipmentPaymentModal'
import UpdateShipmentStatusModal from './components/UpdateShipmentStatusModal'
import { EDeliveryStatus } from '@/types/enums/enum'
import { ColumnsType } from 'antd/es/table'
import Link from 'next/link'

const ShipmentDetailView: React.FC = () => {
    const params = useParams()
    const router = useRouter()
    const { collapsed } = useGlobalContext()

    const shipmentId = params?.id ? Number(params.id) : null

    const {
        shipment,
        loading,
        events,
        eventsLoading,
        hasMoreEvents,
        handleLoadMoreEvents,
        refreshShipment,
    } = useShipmentDetail(shipmentId)

    const [printingShipment, setPrintingShipment] = useState(false)
    const [noteModalOpen, setNoteModalOpen] = useState(false)
    const [paymentModalOpen, setPaymentModalOpen] = useState(false)
    const [statusModalOpen, setStatusModalOpen] = useState(false)

    const formatCurrency = (amount?: number) => {
        if (!amount) return '0₫'
        return `${amount.toLocaleString('vi-VN')}₫`
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

    const handlePrintShipment = async () => {
        if (!shipmentId) return

        try {
            setPrintingShipment(true)
            const htmlContent = await shipmentService.printShipment(shipmentId)

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
            console.error('Error printing shipment:', error)
            message.error('Không thể in phiếu vận đơn')
        } finally {
            setPrintingShipment(false)
        }
    }

    if (loading) {
        return <div>Đang tải...</div>
    }

    if (!shipment) {
        return <div>Không tìm thấy vận đơn</div>
    }

    const lineItemColumns: ColumnsType<LineItemDetail> = [
        {
            title: 'Sản phẩm',
            key: 'product',
            width: '50%',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                            src={record.image_url || DefaultProductImage}
                            alt={record.product_name || 'Sản phẩm'}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <div className='flex-flex-col'>
                        <Link href={`/admin/product/${record.product_id}`} className="font-medium block">{record.product_name || 'Sản phẩm'}</Link>
                        {record.variant_title && (
                            <p className="text-xs text-gray-500">{record.variant_title}</p>
                        )}
                        {record.note && (
                            <div className="text-xs text-gray-600 mt-1">{record.note}</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '15%',
            align: 'center',
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: '15%',
            align: 'right',
            render: (price) => formatCurrency(price),
        },
        {
            title: 'Thành tiền',
            key: 'total',
            width: '20%',
            align: 'right',
            render: (_, record) => formatCurrency((record.price || 0) * (record.quantity || 0)),
        },
    ]

    const codAmount = shipment.cod_amount || shipment.shipping_info?.cod_amount || 0
    const serviceFee = shipment.service_fee || shipment.shipping_info?.service_fee || 0
    const freightPayer = shipment.shipping_info?.freight_payer || 'buyer'
    const declaredValue = codAmount
    const weight = shipment.shipping_info?.weight || 0
    const dimensions = shipment.shipping_info
        ? `${shipment.shipping_info.length || 0} x ${shipment.shipping_info.width || 0} x ${shipment.shipping_info.height || 0}cm`
        : '0 x 0 x 0cm'

    const formatLocationAddress = () => {
        if (!shipment.location) return '-'
        const parts = [shipment.location.name]
        if (shipment.location.address) parts.push(shipment.location.address)
        if (shipment.location.ward_name) parts.push(shipment.location.ward_name)
        if (shipment.location.district_name) parts.push(shipment.location.district_name)
        if (shipment.location.province_name) parts.push(shipment.location.province_name)
        // Format: name - address, ward_name, district_name, province_name
        if (parts.length > 1) {
            return `${parts[0]} - ${parts.slice(1).join(', ')}`
        }
        return parts[0]
    }

    const formatRecipientInfo = () => {
        if (!shipment.shipping_address) return '-'
        const parts = []

        // Tên người nhận: first_name + last_name
        const fullName = `${shipment.shipping_address.first_name || ''} ${shipment.shipping_address.last_name || ''}`.trim()
        if (fullName) {
            parts.push(fullName)
        }

        // Số điện thoại
        if (shipment.shipping_address.phone) {
            parts.push(shipment.shipping_address.phone)
        }

        // Địa chỉ: address, ward_name, district_name, province_name
        const addressParts = []
        if (shipment.shipping_address.address) addressParts.push(shipment.shipping_address.address)
        if (shipment.shipping_address.ward_name) addressParts.push(shipment.shipping_address.ward_name)
        if (shipment.shipping_address.district_name) addressParts.push(shipment.shipping_address.district_name)
        if (shipment.shipping_address.province_name) addressParts.push(shipment.shipping_address.province_name)

        if (addressParts.length > 0) {
            parts.push(addressParts.join(', '))
        }

        // Format: first_name + last_name, phone - address, ward_name, district_name, province_name
        if (parts.length > 1) {
            return `${parts[0]}, ${parts[1]} - ${parts.slice(2).join(', ')}`
        }
        return parts.join(', ')
    }

    return (
        <>
            {loading ? <></> : (
                <div className="min-h-screen">
                    {/* Header */}
                    <div className={`pt-4 z-100 w-full flex flex-col justify-center transition-all`}>
                        <div className="h-full flex items-center justify-between w-full px-2">
                            <div className="flex gap-1 items-center">
                                <Button
                                    className='border! border-gray-200! bg-white!'
                                    type="text"
                                    icon={<ArrowLeft size={20} />}
                                    onClick={() => router.push('/admin/shipment/list')}
                                />
                                <span className="text-xl font-medium ml-3 text-center max-md:hidden">Chi tiết vận đơn</span>
                            </div>
                            <div className='flex gap-2 overflow-wrap'>
                                <Button
                                    icon={<Printer size={16} />}
                                    onClick={handlePrintShipment}
                                    loading={printingShipment}
                                >
                                    In phiếu
                                </Button>
                                <Button
                                    onClick={() => setStatusModalOpen(true)}
                                >
                                    Chuyển trạng thái
                                </Button>
                                <Button danger icon={<X size={16} />}>
                                    Hủy phiếu
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-[1400px] mx-auto p-2">
                        <div className="mb-3">
                            <div className="flex items-center gap-2 mb-4 h-[60px]">
                                <span className="text-2xl font-medium">{shipment.name || `#${shipment.id}`}</span>
                                <div className="flex gap-2">
                                    {shipment.delivery_status && (
                                        <StatusChip status={shipment.delivery_status} type="delivery" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <Row gutter={24}>
                            {/* Left Column */}
                            <Col xs={24} lg={16}>
                                {/* Mã vận đơn */}
                                <Card className="mb-2!">
                                    <div className="flex item-center! gap-2 mb-4 font-semibold text-lg">
                                        <label className="">Mã vận đơn: </label>
                                        <span className="">#{shipment.tracking_info?.tracking_number || shipment.name}</span>
                                    </div>


                                    {shipment.order_id &&
                                        <div className="flex item-center! gap-2">
                                            <label className="text-sm text-gray-600">Đơn hàng: </label>
                                            <button
                                                onClick={() => router.push(`/admin/order/${shipment.order_id}`)}
                                                className="text-blue-600! hover:text-blue-800 font-medium cursor-pointer"
                                            >
                                                #{shipment.order_id}
                                            </button>
                                        </div>
                                    }
                                    <div className="space-y-1">
                                        <div className="flex item-center! gap-2">
                                            <label className="text-sm text-gray-600">Kho lấy hàng: </label>
                                            <span className="text-sm">
                                                {formatLocationAddress()}
                                            </span>
                                        </div>
                                        <div className="flex item-center! gap-2">
                                            <label className="text-sm text-gray-600">Người nhận: </label>
                                            <span className="text-sm">{formatRecipientInfo()}</span>
                                        </div>
                                    </div>
                                </Card>

                                {/* Thông tin sản phẩm */}
                                {shipment.line_items && shipment.line_items.length > 0 && (
                                    <Card className="mb-2!">
                                        <h2 className="text-lg font-semibold mb-4">Thông tin sản phẩm</h2>
                                        <div className="overflow-x-auto">
                                            <Table
                                                dataSource={shipment.line_items}
                                                columns={lineItemColumns}
                                                pagination={false}
                                                rowKey="id"
                                                scroll={{ x: 'max-content' }}
                                            />
                                        </div>
                                    </Card>
                                )}

                                {/* Chi tiết trạng thái đơn giao hàng */}
                                <Card className="mb-2!">
                                    <h2 className="text-lg font-semibold mb-4">Chi tiết trạng thái đơn giao hàng</h2>
                                    {events.length > 0 ? (
                                        <div className="space-y-6">
                                            {Object.entries(groupEventsByDate(events)).map(([date, dateEvents]) => (
                                                <div key={date}>
                                                    <div className="text-sm font-semibold text-gray-700 mb-3">{date}</div>
                                                    <div className="relative pl-8">
                                                        <div className="absolute left-[6px] top-0 bottom-0 w-0.5 bg-blue-200"></div>
                                                        {dateEvents.map((event, index) => (
                                                            <div key={event.id || index} className="relative mb-4 last:mb-0">
                                                                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white z-10 -translate-x-1/2"></div>
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
                                {/* Thông tin phiếu giao hàng */}
                                <Card className="mb-2!">
                                    <h2 className="text-lg font-semibold mb-4">Thông tin phiếu giao hàng</h2>

                                    {/* Thông tin chung */}
                                    <div className="mb-2">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Thông tin chung</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Đối tác giao hàng</label>
                                                <span className="text-sm font-medium text-blue-600">
                                                    {shipment.tracking_info?.delivery_provider?.name || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin gói hàng */}
                                    <div className="mb-4 border-t pt-4 border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Thông tin gói hàng</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Khai giá / Bảo hiểm</label>
                                                <span className="text-sm font-medium ">{formatCurrency(declaredValue)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Khối lượng</label>
                                                <span className="text-sm font-medium ">{weight}g</span>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600">Kích thước</label>
                                                <span className="text-sm font-medium">{dimensions}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin thanh toán */}
                                    <div className="border-t pt-4 border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-semibold text-gray-900">Thông tin thanh toán</h3>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<Pencil size={14} />}
                                                onClick={() => setPaymentModalOpen(true)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Tiền thu hộ COD</label>
                                                <span className="text-sm font-medium">{formatCurrency(codAmount)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Phí trả ĐTGH</label>
                                                <span className="text-sm font-medium">{formatCurrency(serviceFee)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Người trả phí: </label>
                                                <span className="text-sm font-medium">
                                                    {freightPayer === 'buyer' ? 'Khách hàng trả' : 'Shop trả'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Ghi chú */}
                                <Card className="mb-2!">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold">Ghi chú</h2>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<Pencil size={14} />}
                                            onClick={() => setNoteModalOpen(true)}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {shipment.note || 'Chưa có ghi chú'}
                                    </p>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            )}

            <UpdateShipmentNoteModal
                open={noteModalOpen}
                defaultValue={shipment?.note || ''}
                onCancel={() => setNoteModalOpen(false)}
                onSave={async (note: string) => {
                    // TODO: Gọi API cập nhật ghi chú
                    console.log('Update note:', note)
                    setNoteModalOpen(false)
                    await refreshShipment()
                }}
            />

            <UpdateShipmentPaymentModal
                open={paymentModalOpen}
                defaultCodAmount={codAmount}
                defaultServiceFee={serviceFee}
                onCancel={() => setPaymentModalOpen(false)}
                onSave={async (data: { cod_amount: number; service_fee: number }) => {
                    // TODO: Gọi API cập nhật thông tin thanh toán
                    console.log('Update payment:', data)
                    setPaymentModalOpen(false)
                    await refreshShipment()
                }}
            />

            <UpdateShipmentStatusModal
                open={statusModalOpen}
                currentStatus={shipment?.delivery_status}
                onCancel={() => setStatusModalOpen(false)}
                onSave={async (status: EDeliveryStatus) => {
                    if (!shipmentId) return
                    try {
                        await shipmentService.updateShipmentStatus(shipmentId, status)
                        message.success('Cập nhật trạng thái thành công')
                        setStatusModalOpen(false)
                        await refreshShipment()
                    } catch (error) {
                        console.error('Error updating shipment status:', error)
                        message.error('Không thể cập nhật trạng thái')
                        throw error
                    }
                }}
            />
        </>
    )
}

export default ShipmentDetailView

