'use client'

import React, { useState, useEffect } from 'react'
import { Card, Tag, Table, Button, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Printer } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { OrderDetail, LineItemDetail, Fulfillment } from '@/types/response/order'
import { ShipmentDetail } from '@/types/response/shipment'
import { EDeliveryMethod, EFulfillmentShipmentStatus } from '@/types/enums/enum'
import DefaultProductImage from '@/resources/icons/default_img.svg'
import shipmentService from '@/services/shipment'
import fulfillmentService, { FulfillmentLineItem } from '@/services/fulfillment'
import ConfirmDeliveryModal from './ConfirmDeliveryModal'
import PushShippingDrawer from './PushShippingDrawer'

interface OrderLineItemsViewProps {
    order: OrderDetail
    shipments: ShipmentDetail[]
    shipmentsLoading: boolean
    fulfillmentStatus: { color: string; text: string }
    onOpenLineItemNoteModal: (lineItem: LineItemDetail) => void
    formatCurrency: (amount?: number) => string
    formatDate: (dateString?: string) => string
    onRefreshShipments?: () => void
    onRefreshOrder?: () => void
    isOrderCancelled?: boolean
}

interface LineItemGroup {
    type: 'fulfillment' | 'shipping' | 'no-shipping'
    fulfillment?: Fulfillment
    shipment?: ShipmentDetail
    lineItems: LineItemDetail[]
    title: string
}

const OrderLineItemsView: React.FC<OrderLineItemsViewProps> = ({
    order,
    shipments,
    shipmentsLoading,
    fulfillmentStatus,
    onOpenLineItemNoteModal,
    formatCurrency,
    formatDate,
    onRefreshShipments,
    onRefreshOrder,
    isOrderCancelled = false,
}) => {
    const [fulfillmentLineItemsMap, setFulfillmentLineItemsMap] = useState<Record<number, FulfillmentLineItem[]>>({})
    const [loadingFulfillmentLineItems, setLoadingFulfillmentLineItems] = useState(false)
    const [printingShipmentId, setPrintingShipmentId] = useState<number | null>(null)

    // Fetch fulfillment line items cho các fulfillment không có shipment (none, pickup)
    useEffect(() => {
        const fetchFulfillmentLineItems = async () => {
            if (!order?.fulfillments || shipmentsLoading) return

            const fulfillmentsToFetch = order.fulfillments.filter(
                f => f.id &&
                    (f.delivery_method === EDeliveryMethod.NONE || f.delivery_method === EDeliveryMethod.PICKUP) &&
                    !shipments.find(s => s.fulfillment_id === f.id)
            )

            if (fulfillmentsToFetch.length === 0) return

            setLoadingFulfillmentLineItems(true)
            try {
                const promises = fulfillmentsToFetch.map(async (fulfillment) => {
                    if (!fulfillment.id) return null
                    try {
                        const lineItems = await fulfillmentService.getFulfillmentLineItems(fulfillment.id)
                        return { fulfillmentId: fulfillment.id, lineItems }
                    } catch (error) {
                        console.error(`Error fetching line items for fulfillment ${fulfillment.id}:`, error)
                        return null
                    }
                })

                const results = await Promise.all(promises)
                const newMap: Record<number, FulfillmentLineItem[]> = {}
                results.forEach(result => {
                    if (result) {
                        newMap[result.fulfillmentId] = result.lineItems
                    }
                })
                setFulfillmentLineItemsMap(prev => ({ ...prev, ...newMap }))
            } catch (error) {
                console.error('Error fetching fulfillment line items:', error)
            } finally {
                setLoadingFulfillmentLineItems(false)
            }
        }

        fetchFulfillmentLineItems()
    }, [order?.fulfillments, shipments, shipmentsLoading])
    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [confirmingGroup, setConfirmingGroup] = useState<LineItemGroup | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [pushShippingDrawerOpen, setPushShippingDrawerOpen] = useState(false)
    const [pushShippingGroup, setPushShippingGroup] = useState<LineItemGroup | null>(null)

    const handlePrintShipment = async (shipmentId: number) => {
        try {
            setPrintingShipmentId(shipmentId)
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

            // Refresh shipments sau khi in
            if (onRefreshShipments) {
                onRefreshShipments()
            }
        } catch (error) {
            console.error('Error printing shipment:', error)
            message.error('Không thể in phiếu vận đơn')
        } finally {
            setPrintingShipmentId(null)
        }
    }

    const handleConfirmDeliveryClick = (group: LineItemGroup) => {
        setConfirmingGroup(group)
        setConfirmModalOpen(true)
    }

    const handleConfirmDelivery = async () => {
        if (!confirmingGroup || !order.id) return

        try {
            setConfirming(true)

            if (confirmingGroup.type === 'fulfillment' && confirmingGroup.shipment?.id) {
                // Trường hợp có fulfillment: gọi API MarkAsDeliveredShipment
                await shipmentService.markAsDelivered(confirmingGroup.shipment.id)
                message.success('Xác nhận giao hàng thành công')
                if (onRefreshShipments) {
                    onRefreshShipments()
                }
            } else {
                // Trường hợp không có fulfillment: gọi API CreateFulfillment
                const deliveryMethod = confirmingGroup.type === 'no-shipping'
                    ? EDeliveryMethod.NONE
                    : EDeliveryMethod.PICKUP

                const fulfillmentLineItems = confirmingGroup.lineItems.map(item => ({
                    id: item.id!,
                    quantity: item.quantity || 0,
                }))

                await fulfillmentService.createFulfillment({
                    order_id: order.id,
                    delivery_method: deliveryMethod,
                    delivery_status: EFulfillmentShipmentStatus.DELIVERED,
                    fulfillment_line_items: fulfillmentLineItems,
                    send_notification: false,
                    note: '',
                })

                message.success('Xác nhận giao hàng thành công')
                if (onRefreshOrder) {
                    onRefreshOrder()
                }
            }

            setConfirmModalOpen(false)
            setConfirmingGroup(null)
        } catch (error) {
            console.error('Error confirming delivery:', error)
            message.error('Không thể xác nhận giao hàng')
        } finally {
            setConfirming(false)
        }
    }

    const lineItemColumns: ColumnsType<LineItemDetail> = [
        {
            title: 'Sản phẩm',
            key: 'product',
            width: '60%',
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
                            onClick={() => onOpenLineItemNoteModal(record)}
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
            width: '10%',
            align: 'right',
            render: (_, record) => formatCurrency((record.price || 0) * (record.quantity || 0)),
        },
    ]

    const getDeliveryStatusTag = (status?: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
            pending: { color: 'warning', text: 'Chờ lấy hàng' },
            picked_up: { color: 'processing', text: 'Đã lấy hàng' },
            delivering: { color: 'processing', text: 'Đang vận chuyển' },
            delivered: { color: 'success', text: 'Đã giao hàng' },
            deliveried: { color: 'success', text: 'Đã giao hàng' },
            cancelled: { color: 'error', text: 'Đã hủy' },
        }
        return statusMap[status || 'pending'] || { color: 'default', text: status || 'N/A' }
    }

    // Nhóm line items theo fulfillments và các nhóm còn lại
    const groupLineItemsByFulfillment = (): LineItemGroup[] => {
        if (!order?.line_items) return []

        const fulfillmentGroups: LineItemGroup[] = []

        // Tạo map để track line items đã được thêm vào fulfillment
        const fulfilledLineItemIds = new Set<number>()

        // Lặp qua fulfillments và lấy line items tương ứng
        if (order.fulfillments && order.fulfillments.length > 0) {
            order.fulfillments.forEach(fulfillment => {
                if (!fulfillment.id) return

                // Tìm shipment của fulfillment này
                const shipment = shipments.find(s => s.fulfillment_id === fulfillment.id)

                const fulfillmentLineItems: LineItemDetail[] = []

                // Nếu có shipment (external_shipper), lấy line items từ shipment
                if (shipment?.line_items && shipment.line_items.length > 0) {
                    shipment.line_items.forEach(shipmentLineItem => {
                        const orderLineItem = order.line_items?.find(
                            li => li.variant_id === shipmentLineItem.variant_id
                        )
                        if (orderLineItem) {
                            fulfillmentLineItems.push(orderLineItem)
                            fulfilledLineItemIds.add(orderLineItem.id || 0)
                        }
                    })
                }
                // Nếu không có shipment (none, pickup), lấy line items từ fulfillment line items
                else if (
                    (fulfillment.delivery_method === EDeliveryMethod.NONE ||
                        fulfillment.delivery_method === EDeliveryMethod.PICKUP) &&
                    fulfillmentLineItemsMap[fulfillment.id]
                ) {
                    const fulfillmentLineItemsData = fulfillmentLineItemsMap[fulfillment.id]
                    fulfillmentLineItemsData.forEach(fulfillmentLineItem => {
                        const orderLineItem = order.line_items?.find(
                            li => li.id === fulfillmentLineItem.line_item_id
                        )
                        if (orderLineItem) {
                            fulfillmentLineItems.push(orderLineItem)
                            fulfilledLineItemIds.add(orderLineItem.id || 0)
                        }
                    })
                }

                if (fulfillmentLineItems.length > 0) {
                    fulfillmentGroups.push({
                        type: 'fulfillment',
                        fulfillment,
                        shipment,
                        lineItems: fulfillmentLineItems,
                        title: `Fulfillment: ${fulfillment.name || `#${fulfillment.id}`}`,
                    })
                }
            })
        }

        // Lấy các line items còn lại chưa có fulfillment
        const remainingLineItems = order.line_items.filter(
            li => !fulfilledLineItemIds.has(li.id || 0)
        )

        // Chia thành 2 nhóm: requires_shipping = true và false
        const shippingLineItems = remainingLineItems.filter(li => li.requires_shipping !== false)
        const noShippingLineItems = remainingLineItems.filter(li => li.requires_shipping === false)

        if (shippingLineItems.length > 0) {
            fulfillmentGroups.push({
                type: 'shipping',
                lineItems: shippingLineItems,
                title: 'Sản phẩm yêu cầu vận chuyển',
            })
        }

        if (noShippingLineItems.length > 0) {
            fulfillmentGroups.push({
                type: 'no-shipping',
                lineItems: noShippingLineItems,
                title: 'Sản phẩm không yêu cầu vận chuyển',
            })
        }

        return fulfillmentGroups
    }

    if (shipmentsLoading) {
        return (
            <Card className="!mb-4">
                <div className="text-center py-12 text-gray-400">Đang tải...</div>
            </Card>
        )
    }

    const lineItemGroups = groupLineItemsByFulfillment()

    if (lineItemGroups.length === 0) {
        return (
            <Card className="!mb-4">
                <div className="text-center py-12 text-gray-400">
                    Chưa có sản phẩm
                </div>
            </Card>
        )
    }

    return (
        <>
            {lineItemGroups.map((group, groupIndex) => {
                console.log("group", group.fulfillment)
                const isExternalShipper = group.fulfillment?.delivery_method === EDeliveryMethod.EXTERNAL_SHIPPER
                const isPickup = group.fulfillment?.delivery_method === EDeliveryMethod.PICKUP
                const shipment = group.shipment

                // Kiểm tra xem fulfillment đã được giao hàng chưa
                const isFulfillmentDelivered =
                    group.fulfillment?.shipment_status === EFulfillmentShipmentStatus.DELIVERED || group.fulfillment?.shipment_status === EFulfillmentShipmentStatus.DELIVERIED || (shipment && shipment.delivery_status === 'delivered')

                // Lấy trạng thái fulfillment
                const getFulfillmentStatusTag = () => {
                    if (group.fulfillment?.shipment_status) {
                        return getDeliveryStatusTag(group.fulfillment.shipment_status)
                    }
                    if (group.fulfillment?.status === 'success') {
                        return { color: 'success', text: 'Đã xử lý giao hàng' }
                    }
                    return { color: 'default', text: 'Đã xử lý' }
                }

                return (
                    <Card key={groupIndex} className="!mb-4">
                        {/* Header với thông tin shipment nếu có external_shipper */}
                        {isExternalShipper && shipment && (
                            <div className="mb-4 space-y-2 pb-4 border-b border-gray-200">
                                {/* Trạng thái */}
                                <div className="flex items-center gap-2">
                                    <Tag color={getDeliveryStatusTag(shipment.delivery_status).color}>
                                        {getDeliveryStatusTag(shipment.delivery_status).text}
                                    </Tag>
                                </div>

                                {/* Chi nhánh */}
                                {shipment.location && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Chi nhánh:</span>
                                        <span className="text-sm font-medium">{shipment.location.name}</span>
                                    </div>
                                )}

                                {/* Phiếu giao hàng */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-gray-600">Phiếu giao hàng:</span>
                                    {shipment.name && shipment.id && (
                                        <Link
                                            href={`/shipment/${shipment.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {shipment.name}
                                        </Link>
                                    )}
                                    {shipment.printed ? (
                                        <Button
                                            size="small"
                                            icon={<Printer size={14} />}
                                            disabled
                                            className="ml-2"
                                        >
                                            Đã in
                                        </Button>
                                    ) : (
                                        <Button
                                            size="small"
                                            icon={<Printer size={14} />}
                                            className="ml-2"
                                        >
                                            Chưa in
                                        </Button>
                                    )}
                                    {shipment.created_at && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            {formatDate(shipment.created_at)}
                                        </span>
                                    )}
                                </div>

                                {/* Vận chuyển */}
                                {shipment.tracking_info && (
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm text-gray-600">Vận chuyển:</span>
                                        {shipment.tracking_info.delivery_provider?.name && (
                                            <span className="text-sm font-medium">
                                                {shipment.tracking_info.delivery_provider.name}
                                            </span>
                                        )}
                                        {shipment.tracking_info.tracking_number && (
                                            <>
                                                <span className="text-sm text-gray-400">|</span>
                                                <span className="text-sm font-medium">
                                                    #{shipment.tracking_info.tracking_number}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Header với thông tin fulfillment nếu có pickup */}
                        {isPickup && group.fulfillment && (
                            <div className="mb-4 space-y-2 pb-4 border-b border-gray-200">
                                {/* Trạng thái */}
                                <div className="flex items-center gap-2">
                                    <Tag color={getFulfillmentStatusTag().color}>
                                        {getFulfillmentStatusTag().text}
                                    </Tag>
                                </div>

                                {/* Chi nhánh */}
                                {order.location && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Chi nhánh:</span>
                                        <span className="text-sm font-medium">{order.location.name}</span>
                                    </div>
                                )}

                                {/* Vận chuyển */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Vận chuyển:</span>
                                    <span className="text-sm font-medium">Nhận tại cửa hàng</span>
                                </div>
                            </div>
                        )}

                        {/* Table sản phẩm */}
                        <Table
                            dataSource={group.lineItems}
                            scroll={{ x: 'max-content' }}
                            columns={lineItemColumns}
                            pagination={false}
                            rowKey="id"
                        />

                        {/* Action buttons - chỉ hiển thị khi fulfillment chưa được giao hàng và đơn hàng chưa bị hủy */}
                        {!isFulfillmentDelivered && !isOrderCancelled && (
                            <div className="flex gap-3 mt-4 justify-end">
                                {/* Nút in phiếu vận đơn - chỉ hiển thị khi có shipment và chưa in */}
                                {isExternalShipper && shipment && !shipment.printed && shipment.id && (
                                    <Button
                                        type="default"
                                        icon={<Printer size={16} />}
                                        loading={printingShipmentId === shipment.id}
                                        onClick={() => handlePrintShipment(shipment.id!)}
                                    >
                                        In phiếu vận đơn
                                    </Button>
                                )}
                                {group.type === 'shipping' && (
                                    <>
                                        <Button
                                            type="default"
                                            onClick={() => {
                                                setPushShippingGroup(group)
                                                setPushShippingDrawerOpen(true)
                                            }}
                                        >
                                            Đẩy vận chuyển
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={() => handleConfirmDeliveryClick(group)}
                                        >
                                            Xác nhận giao hàng
                                        </Button>
                                    </>
                                )}
                                {(group.type === 'no-shipping' || group.type === 'fulfillment') && (
                                    <Button
                                        type="primary"
                                        onClick={() => handleConfirmDeliveryClick(group)}
                                    >
                                        Xác nhận giao hàng
                                    </Button>
                                )}
                            </div>
                        )}
                    </Card>
                )
            })}

            {/* Modal xác nhận giao hàng */}
            <ConfirmDeliveryModal
                open={confirmModalOpen}
                onCancel={() => {
                    setConfirmModalOpen(false)
                    setConfirmingGroup(null)
                }}
                onConfirm={handleConfirmDelivery}
                loading={confirming}
            />

            {/* Drawer đẩy vận chuyển */}
            {pushShippingGroup && (
                <PushShippingDrawer
                    open={pushShippingDrawerOpen}
                    onClose={() => {
                        setPushShippingDrawerOpen(false)
                        setPushShippingGroup(null)
                    }}
                    order={order}
                    lineItems={pushShippingGroup.lineItems}
                    onSuccess={() => {
                        if (onRefreshOrder) {
                            onRefreshOrder()
                        }
                        if (onRefreshShipments) {
                            onRefreshShipments()
                        }
                    }}
                />
            )}
        </>
    )
}

export default OrderLineItemsView

