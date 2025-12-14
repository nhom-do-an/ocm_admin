'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Drawer, Button, Form, Select, InputNumber, Input, Radio, message } from 'antd'
import { OrderDetail, LineItemDetail } from '@/types/response/order'
import { Location } from '@/types/response/locations'
import { EDeliveryMethod, EFulfillmentShipmentStatus, EShippingRequirement, EFreightPayerType, DeliveryProviderType, DeliveryProviderStatus, ELocationStatus } from '@/types/enums/enum'
import deliveryProviderService from '@/services/delivery-provider'
import { DeliveryProvider } from '@/types/request/order'
import { CreateFulfillmentRequest } from '@/types/request/order'
import fulfillmentService from '@/services/fulfillment'
import AddDeliveryProviderModal from './AddDeliveryProviderModal'
import { CreateDeliveryProviderRequest } from '@/types/request/delivery-provider'
import locationService from '@/services/location'

const { TextArea } = Input

interface PushShippingDrawerProps {
    open: boolean
    onClose: () => void
    order: OrderDetail
    lineItems: LineItemDetail[]
    onSuccess?: () => void
}

function useDebounce<T>(value: T, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

const PushShippingDrawer: React.FC<PushShippingDrawerProps> = ({
    open,
    onClose,
    order,
    lineItems,
    onSuccess,
}) => {
    const [form] = Form.useForm()
    const [pickupLocationId, setPickupLocationId] = useState<number | undefined>(undefined)
    const [deliveryProviders, setDeliveryProviders] = useState<DeliveryProvider[]>([])
    const [deliveryProviderSearchKey, setDeliveryProviderSearchKey] = useState('')
    const [selectedDeliveryProviderId, setSelectedDeliveryProviderId] = useState<number | undefined>(undefined)
    const [addDeliveryProviderModalOpen, setAddDeliveryProviderModalOpen] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [codAmount, setCodAmount] = useState(0)
    const [shippingFee, setShippingFee] = useState(0)
    const [shippingWeight, setShippingWeight] = useState(0)
    const [shippingLength, setShippingLength] = useState(10)
    const [shippingWidth, setShippingWidth] = useState(10)
    const [shippingHeight, setShippingHeight] = useState(10)
    const [shippingRequirement, setShippingRequirement] = useState<EShippingRequirement>(EShippingRequirement.ViewOnly)
    const [freightPayer, setFreightPayer] = useState<EFreightPayerType>(EFreightPayerType.Buyer)
    const [deliveryNote, setDeliveryNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [locations, setLocations] = useState<Location[]>([])

    const debouncedDeliveryProviderSearchKey = useDebounce(deliveryProviderSearchKey, 300)

    useEffect(() => {
        const fetchLocations = async () => {
            const response = await locationService.getListLocations({
                inventory_management: true,
                status: ELocationStatus.ACTIVE,
            })
            setLocations(response.locations || [])
        }
        fetchLocations()
    }, [])

    // Set default pickup location
    useEffect(() => {
        if (locations.length > 0 && !pickupLocationId) {
            const defaultLocation = locations.find(location => location.default_location)
            if (defaultLocation) {
                setPickupLocationId(defaultLocation.id)
            }
        }
    }, [locations, pickupLocationId])

    // Set default COD amount
    useEffect(() => {
        if (open && codAmount === 0 && order.total_price) {
            setCodAmount(order.total_price)
        }
    }, [open, order.total_price, codAmount])

    // Fetch delivery providers
    const fetchDeliveryProviders = useCallback(async (searchKey?: string) => {
        try {
            const response = await deliveryProviderService.getListDeliveryProviders({
                type: DeliveryProviderType.ExternalShipper,
                status: DeliveryProviderStatus.Active,
                key: searchKey,
            })
            setDeliveryProviders(response.delivery_providers || [])
        } catch (error) {
            console.error('Error fetching delivery providers:', error)
        }
    }, [])

    useEffect(() => {
        if (open) {
            fetchDeliveryProviders(debouncedDeliveryProviderSearchKey)
        }
    }, [open, debouncedDeliveryProviderSearchKey, fetchDeliveryProviders])

    const handleCreateDeliveryProvider = async (data: CreateDeliveryProviderRequest) => {
        try {
            const newProvider = await deliveryProviderService.createDeliveryProvider(data)
            await fetchDeliveryProviders(deliveryProviderSearchKey)
            setSelectedDeliveryProviderId(newProvider.id)
            setAddDeliveryProviderModalOpen(false)
        } catch (error) {
            console.error('Error creating delivery provider:', error)
            throw error
        }
    }

    const handleSubmit = async () => {
        if (!order.id) {
            message.error('Không tìm thấy ID đơn hàng')
            return
        }

        const fulfillmentLineItems = lineItems.map(item => ({
            id: item.id!,
            quantity: item.quantity || 0,
        }))

        const shippingInfo = {
            cod_amount: codAmount,
            freight_payer: freightPayer,
            height: shippingHeight,
            length: shippingLength,
            requirement: shippingRequirement,
            service_fee: shippingFee,
            weight: shippingWeight,
            weight_type: 'product' as const,
            width: shippingWidth,
            note: deliveryNote || '',
        }
        const trackingInfo = {
            delivery_provider_id: selectedDeliveryProviderId || 0,
            tracking_number: trackingNumber,
        }

        console.log("trackingInfo", trackingInfo)
        const fulfillmentData: CreateFulfillmentRequest = {
            order_id: order.id,
            delivery_method: EDeliveryMethod.EXTERNAL_SHIPPER,
            delivery_status: EFulfillmentShipmentStatus.PENDING,
            fulfillment_line_items: fulfillmentLineItems,
            shipping_info: shippingInfo,
            tracking_info: trackingInfo,
            send_notification: false,
            note: deliveryNote || '',
        }

        setSubmitting(true)
        try {
            await fulfillmentService.createFulfillment(fulfillmentData)
            message.success('Đẩy vận chuyển thành công')
            onSuccess?.()
            handleClose()
        } catch (error) {
            console.error('Error creating fulfillment:', error)
            message.error('Đẩy vận chuyển thất bại. Vui lòng thử lại.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        // Reset form
        setPickupLocationId(undefined)
        setSelectedDeliveryProviderId(undefined)
        setTrackingNumber('')
        setCodAmount(0)
        setShippingFee(0)
        setShippingWeight(0)
        setShippingLength(10)
        setShippingWidth(10)
        setShippingHeight(10)
        setShippingRequirement(EShippingRequirement.ViewOnly)
        setFreightPayer(EFreightPayerType.Buyer)
        setDeliveryNote('')
        setDeliveryProviderSearchKey('')
        form.resetFields()
        onClose()
    }

    const formatFullAddress = (address?: { address?: string; province_name?: string; district_name?: string; ward_name?: string }) => {
        if (!address) return 'Chưa có địa chỉ'
        return [address.address, address.province_name, address.district_name, address.ward_name]
            .filter(Boolean)
            .join(', ')
    }

    return (
        <>
            <Drawer
                title="Đẩy qua đối tác vận chuyển"
                placement="right"
                width={920}
                onClose={handleClose}
                open={open}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button type="primary" onClick={handleSubmit} loading={submitting}>
                            Gửi yêu cầu vận chuyển
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Địa chỉ giao hàng */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Địa chỉ giao hàng</label>
                                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                    <p className="text-sm text-gray-900">
                                        {order.shipping_address
                                            ? formatFullAddress(order.shipping_address)
                                            : 'Chưa có địa chỉ giao hàng'}
                                    </p>
                                </div>
                            </div>

                            {/* Địa chỉ lấy hàng */}
                            <Form.Item label="Địa chỉ lấy hàng">
                                <Select
                                    placeholder="Chọn địa chỉ lấy hàng"
                                    value={pickupLocationId}
                                    onChange={setPickupLocationId}
                                    options={locations.map(loc => ({ label: loc.name, value: loc.id }))}
                                />
                            </Form.Item>

                            {/* Thông tin giao hàng */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">Thông tin giao hàng</label>
                                    <Button type="link" size="small" className="!px-0">
                                        Cấu hình gói hàng
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <Form.Item label="Tiền thu hộ COD">
                                        <InputNumber
                                            min={0}
                                            value={codAmount}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => {
                                                const numeric = value?.replace(/\$\s?|(,*)/g, '')
                                                return numeric ? Number(numeric) : 0
                                            }}
                                            onChange={(value) => setCodAmount(value || 0)}
                                            className="w-full"
                                            addonAfter="₫"
                                        />
                                    </Form.Item>

                                    <Form.Item label="Khối lượng">
                                        <InputNumber
                                            min={0}
                                            value={shippingWeight}
                                            onChange={(value) => setShippingWeight(value || 0)}
                                            className="w-full"
                                            addonAfter="g"
                                        />
                                    </Form.Item>

                                    <div className="grid grid-cols-3 gap-3">
                                        <Form.Item label="Dài">
                                            <InputNumber
                                                min={0}
                                                value={shippingLength}
                                                onChange={(value) => setShippingLength(value || 10)}
                                                className="w-full"
                                                addonAfter="cm"
                                            />
                                        </Form.Item>
                                        <Form.Item label="Rộng">
                                            <InputNumber
                                                min={0}
                                                value={shippingWidth}
                                                onChange={(value) => setShippingWidth(value || 10)}
                                                className="w-full"
                                                addonAfter="cm"
                                            />
                                        </Form.Item>
                                        <Form.Item label="Cao">
                                            <InputNumber
                                                min={0}
                                                value={shippingHeight}
                                                onChange={(value) => setShippingHeight(value || 10)}
                                                className="w-full"
                                                addonAfter="cm"
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item label="Yêu cầu giao hàng">
                                        <Select
                                            value={shippingRequirement}
                                            onChange={setShippingRequirement}
                                            options={[
                                                { label: 'Cho xem hàng, cho thử', value: EShippingRequirement.ViewAndTry },
                                                { label: 'Cho xem hàng, không cho thử', value: EShippingRequirement.ViewOnly },
                                                { label: 'Không cho xem hàng', value: EShippingRequirement.NoViewNoTry },
                                            ]}
                                        />
                                    </Form.Item>

                                    <Form.Item label="Ghi chú">
                                        <TextArea
                                            rows={3}
                                            placeholder="Nhập ghi chú"
                                            value={deliveryNote}
                                            onChange={(e) => setDeliveryNote(e.target.value)}
                                            maxLength={255}
                                            showCount
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Người trả phí */}
                            <Form.Item label="Người trả phí">
                                <Radio.Group
                                    value={freightPayer}
                                    onChange={(e) => setFreightPayer(e.target.value)}
                                >
                                    <Radio value={EFreightPayerType.Seller}>Shop trả</Radio>
                                    <Radio value={EFreightPayerType.Buyer}>Khách trả</Radio>
                                </Radio.Group>
                            </Form.Item>

                            {/* Phí vận chuyển */}
                            <Form.Item label="Phí vận chuyển">
                                <InputNumber
                                    min={0}
                                    value={shippingFee}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => {
                                        const numeric = value?.replace(/\$\s?|(,*)/g, '')
                                        return numeric ? Number(numeric) : 0
                                    }}
                                    onChange={(value) => setShippingFee(value || 0)}
                                    className="w-full"
                                    addonAfter="₫"
                                />
                            </Form.Item>

                            {/* Chọn đối tác */}
                            <Form.Item label="Chọn đối tác">
                                <div className="space-y-2">
                                    <Select
                                        placeholder="Chọn đối tác vận chuyển"
                                        value={selectedDeliveryProviderId}
                                        onChange={setSelectedDeliveryProviderId}
                                        options={deliveryProviders.map(provider => ({ label: provider.name, value: provider.id }))}
                                        showSearch
                                        filterOption={false}
                                        onSearch={setDeliveryProviderSearchKey}
                                        searchValue={deliveryProviderSearchKey}
                                        allowClear
                                        notFoundContent={
                                            <div className="p-2 text-center">
                                                <p className="text-sm text-gray-500 mb-2">Không tìm thấy đối tác</p>
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    onClick={() => setAddDeliveryProviderModalOpen(true)}
                                                    className="!px-0"
                                                >
                                                    Thêm mới
                                                </Button>
                                            </div>
                                        }
                                    />
                                </div>
                            </Form.Item>

                            {/* Mã vận đơn */}
                            <Form.Item label="Mã vận đơn">
                                <Input
                                    placeholder="Nhập mã vận đơn"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                            </Form.Item>

                            {/* Summary */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tiền thu hộ COD</span>
                                    <span className="font-medium">{codAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="font-medium">{shippingFee.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>

            <AddDeliveryProviderModal
                open={addDeliveryProviderModalOpen}
                onCancel={() => setAddDeliveryProviderModalOpen(false)}
                onSave={handleCreateDeliveryProvider}
            />
        </>
    )
}

export default PushShippingDrawer

