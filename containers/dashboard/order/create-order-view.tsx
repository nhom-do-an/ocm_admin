'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Input,
    Button,
    Card,
    Form,
    Select,
    InputNumber,
    Space,
    Table,
    Row,
    Col,
    Radio,
} from 'antd'
import { ArrowLeft, Search, Trash2, X } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { useCreateOrder } from './hooks/use-create-order'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import EmptyState from '@/components/common/EmptyState'
import NotFoundOrder from '@/resources/icons/not-found-order.svg'
import VariantCard from './components/VariantCard'
import { Variant } from '@/services/variant'
import Image from 'next/image'
import CustomerCard from './components/CustomerCard'
import { AddressDetail, Customer } from '@/types/response/customer'
import LineItemNoteModal from './components/LineItemNoteModal'
import EditShippingAddressModal from './components/EditShippingAddressModal'
import AddDeliveryProviderModal from './components/AddDeliveryProviderModal'
import { CreateLineItemRequest, CreateTransactionRequest, CreateFulfillmentRequest, CreateShippingInfoRequest, CreateTrackingInfoRequest, CreateOrderRequest, ShippingLine } from '@/types/request/order'
import { Source } from '@/types/response/source'
import { ETransactionStatus, EDeliveryMethod, EFulfillmentShipmentStatus, DeliveryProviderType, DeliveryProviderStatus, EFreightPayerType, EShippingRequirement, ShippingLineType } from '@/types/enums/enum'
import deliveryProviderService from '@/services/delivery-provider'
import { DeliveryProvider } from '@/types/request/order'
import { CreateDeliveryProviderRequest } from '@/types/request/delivery-provider'
import orderService from '@/services/order'
import { useGlobalNotification } from '@/hooks/useNotification'

const { TextArea } = Input

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

type LineItem = CreateLineItemRequest & {
    sku?: string
    total: number
    inventory_quantity?: number
    tracked?: boolean
}

interface FormValues {
    customer_id?: number
    location_id: number
    assignee_id?: number
    delivery_date?: string
    source_id?: number
    note?: string
    shipping_address?: AddressDetail | null
    billing_address?: AddressDetail | null
    payment_method_id?: number
}

const CreateOrder: React.FC = () => {
    const { collapsed } = useGlobalContext()
    const {
        sources,
        loading,
        locations,
        variants,
        getVariants,
        getCustomers,
        assignees,
        customers = [],
        paymentMethods = [],
    } = useCreateOrder()
    const [form] = Form.useForm<FormValues>()
    const locationId = Form.useWatch('location_id', form)
    const paymentMethodId = Form.useWatch('payment_method_id', form)
    const router = useRouter()
    const notification = useGlobalNotification()
    const [submitting, setSubmitting] = useState(false)

    const [products, setProducts] = useState<LineItem[]>([])
    const [totalAmount, setTotalAmount] = useState(0)
    const [shippingFee, setShippingFee] = useState(0)
    const [variantDropdownOpen, setVariantDropdownOpen] = useState(false)
    const [variantSearchKey, setVariantSearchKey] = useState('')
    const [variantLoading, setVariantLoading] = useState(false)
    const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
    const [customerSearchKey, setCustomerSearchKey] = useState('')
    const [customerLoading, setCustomerLoading] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [shippingAddress, setShippingAddress] = useState<AddressDetail | null>(null)
    const [billingAddress, setBillingAddress] = useState<AddressDetail | null>(null)
    const [showBillingAddress, setShowBillingAddress] = useState(false)
    const [shippingModalOpen, setShippingModalOpen] = useState(false)
    const [noteModal, setNoteModal] = useState<{ open: boolean; index: number | null; defaultValue: string }>({
        open: false,
        index: null,
        defaultValue: '',
    })
    const [paymentTiming, setPaymentTiming] = useState<'immediate' | 'later'>('immediate')
    const [transactionAmount, setTransactionAmount] = useState(0)
    const [deliveryType, setDeliveryType] = useState<'self' | 'delivered' | 'later'>('later')
    const [deliveryProviders, setDeliveryProviders] = useState<DeliveryProvider[]>([])
    const [deliveryProviderSearchKey, setDeliveryProviderSearchKey] = useState('')
    const [pickupLocationId, setPickupLocationId] = useState<number | undefined>(undefined)
    const [selectedDeliveryProviderId, setSelectedDeliveryProviderId] = useState<number | undefined>(undefined)
    const [addDeliveryProviderModalOpen, setAddDeliveryProviderModalOpen] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [codAmount, setCodAmount] = useState(0)
    const [shippingWeight, setShippingWeight] = useState(0)
    const [shippingLength, setShippingLength] = useState(10)
    const [shippingWidth, setShippingWidth] = useState(10)
    const [shippingHeight, setShippingHeight] = useState(10)
    const [shippingRequirement, setShippingRequirement] = useState<EShippingRequirement>(EShippingRequirement.ViewOnly)
    const [freightPayer, setFreightPayer] = useState<EFreightPayerType>(EFreightPayerType.Seller)
    const [deliveryNote, setDeliveryNote] = useState('')
    const debouncedVariantSearchKey = useDebounce(variantSearchKey, 300)
    const debouncedCustomerSearchKey = useDebounce(customerSearchKey, 300)
    const isLineItemOutOfStock = useCallback((item: LineItem) => {
        const inventoryQuantity = item.inventory_quantity ?? 0
        if (inventoryQuantity === 0 && item.tracked === false) {
            return true
        }
        return item.quantity > inventoryQuantity
    }, [])

    const hasOutOfStockItem = useMemo(
        () => products.some(product => isLineItemOutOfStock(product)),
        [products, isLineItemOutOfStock]
    )

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

    const sourceOptions = useMemo(
        () =>
            sources.map(source => ({
                value: source.id,
                label: renderSourceOption(source),
            })),
        [sources]
    )

    const paymentMethodOptions = useMemo(
        () => paymentMethods.map(method => ({ label: method.name || `Phương thức #${method.id}`, value: method.id })),
        [paymentMethods]
    )

    useEffect(() => {
        const total = products.reduce((sum, product) => sum + product.total, 0)
        setTotalAmount(total)
    }, [products])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (variantDropdownOpen && !target.closest('.variant-dropdown-container')) {
                setVariantDropdownOpen(false)
            }
        }

        if (variantDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [variantDropdownOpen])

    // Close customer dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (customerDropdownOpen && !target.closest('.customer-dropdown-container')) {
                setCustomerDropdownOpen(false)
            }
        }

        if (customerDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [customerDropdownOpen])

    // Set default location when locations are loaded
    useEffect(() => {
        if (locations.length > 0) {
            const defaultLocation = locations.find(location => location.default_location)
            if (defaultLocation && !form.getFieldValue('location_id')) {
                form.setFieldsValue({ location_id: defaultLocation.id })
            }
        }
    }, [locations, form])

    // Close dropdown when location changes
    useEffect(() => {
        setVariantDropdownOpen(false)
        setVariantSearchKey('')
    }, [locationId])

    useEffect(() => {
        form.setFieldsValue({
            shipping_address: shippingAddress || null,
            billing_address: billingAddress || null,
        })
    }, [shippingAddress, billingAddress, form])

    useEffect(() => {
        if (!paymentMethodId && paymentMethodOptions.length > 0) {
            form.setFieldsValue({ payment_method_id: paymentMethodOptions[0].value })
        }
    }, [paymentMethodId, paymentMethodOptions, form])

    // Set default assignee when assignees are loaded
    useEffect(() => {
        if (assignees.length > 0) {
            // Set to first assignee (current user) as default
            if (!form.getFieldValue('assignee_id')) {
                form.setFieldsValue({ assignee_id: assignees[0].id })
            }
        }
    }, [assignees, form])

    // Set default pickup location
    useEffect(() => {
        if (locations.length > 0 && !pickupLocationId) {
            const defaultLocation = locations.find(location => location.default_location)
            if (defaultLocation) {
                setPickupLocationId(defaultLocation.id)
            }
        }
    }, [locations, pickupLocationId])

    // Fetch delivery providers when delivery type is self or delivered
    const fetchDeliveryProviders = useCallback(async (searchKey?: string) => {
        if (deliveryType === 'self' || deliveryType === 'delivered') {
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
        }
    }, [deliveryType])

    const debouncedDeliveryProviderSearchKey = useDebounce(deliveryProviderSearchKey, 300)

    useEffect(() => {
        fetchDeliveryProviders(debouncedDeliveryProviderSearchKey)
    }, [deliveryType, debouncedDeliveryProviderSearchKey, fetchDeliveryProviders])

    const handleCreateDeliveryProvider = async (data: CreateDeliveryProviderRequest) => {
        try {
            const newProvider = await deliveryProviderService.createDeliveryProvider(data)
            // Refresh the list
            await fetchDeliveryProviders(deliveryProviderSearchKey)
            // Set the newly created provider as selected
            setSelectedDeliveryProviderId(newProvider.id)
            setAddDeliveryProviderModalOpen(false)
        } catch (error) {
            console.error('Error creating delivery provider:', error)
            throw error
        }
    }

    const productColumns: ColumnsType<LineItem> = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product_name',
            key: 'name',
            width: 250,
            render: (_, record, index) => (
                <div className="flex items-center gap-3">
                    {/* Image */}
                    <div className="w-12 h-12 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        {record.image_url ? (
                            <Image
                                src={record.image_url}
                                alt={record.product_name || 'Sản phẩm'}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium">{record.product_name}</div>
                        <div className="text-xs text-gray-500">{record.sku}</div>
                        {record.note && (
                            <div className="text-xs text-gray-600 mt-1">{record.note}</div>
                        )}
                        <button
                            type="button"
                            className="text-xs text-blue-600 mt-1"
                            onClick={() => openNoteModal(index)}
                        >
                            {record.note ? 'Sửa ghi chú' : 'Thêm ghi chú'}
                        </button>
                        {isLineItemOutOfStock(record) && (
                            <div className="text-xs text-red-600 font-medium mt-1">Hết hàng</div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (price, record, index) => (
                <InputNumber
                    min={0}
                    value={price}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                    onChange={(value) => {
                        const newProducts = [...products]
                        newProducts[index].price = value || 0
                        const unitPrice = newProducts[index].price || 0
                        const subtotal = newProducts[index].quantity * unitPrice
                        newProducts[index].total = subtotal
                        setProducts(newProducts)
                    }}
                    className="w-full"
                />
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            render: (quantity, record, index) => (
                <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(value) => {
                        const newProducts = [...products]
                        newProducts[index].quantity = value || 1
                        const unitPrice = newProducts[index].price || 0
                        const subtotal = (value || 1) * unitPrice
                        newProducts[index].total = subtotal
                        setProducts(newProducts)
                    }}
                />
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'total',
            key: 'total',
            width: 150,
            render: (total) => (
                <span className="font-medium">{total.toLocaleString('vi-VN')}₫</span>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record, index) => (
                <Button
                    type="text"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={() => {
                        const newProducts = products.filter((_, i) => i !== index)
                        setProducts(newProducts)
                    }}
                />
            ),
        },
    ]

    const finalAmount = totalAmount + shippingFee
    const paymentInputsDisabled = products.length === 0 || paymentMethodOptions.length === 0

    useEffect(() => {
        if (paymentTiming === 'later') {
            setTransactionAmount(finalAmount)
        }
    }, [paymentTiming, finalAmount])

    useEffect(() => {
        if (paymentTiming === 'immediate' && transactionAmount === 0 && finalAmount > 0) {
            setTransactionAmount(finalAmount)
        }
    }, [finalAmount, paymentTiming, transactionAmount])

    // Set default COD amount when delivery type changes
    useEffect(() => {
        if ((deliveryType === 'self' || deliveryType === 'delivered') && codAmount === 0 && finalAmount > 0) {
            setCodAmount(finalAmount)
        }
    }, [deliveryType, finalAmount, codAmount])

    const handleSubmit = async (values: FormValues) => {
        console.log('=== SUBMIT CREATE ORDER ===')
        // Validate required fields
        if (!values.location_id) {
            console.error('Vui lòng chọn chi nhánh')
            return
        }

        if (!values.assignee_id) {
            console.error('Vui lòng chọn nhân viên phụ trách')
            return
        }

        if (!selectedCustomer?.id && !values.customer_id) {
            console.error('Vui lòng chọn khách hàng')
            return
        }

        if (!values.source_id) {
            console.error('Vui lòng chọn nguồn đơn')
            return
        }

        if (!shippingAddress) {
            console.error('Vui lòng nhập địa chỉ giao hàng')
            return
        }

        if (products.length === 0) {
            console.error('Vui lòng thêm ít nhất một sản phẩm')
            return
        }

        // Prepare transactions
        const transactions: CreateTransactionRequest[] = []
        if (products.length > 0 && paymentMethodId) {
            transactions.push({
                amount: transactionAmount,
                payment_method_id: paymentMethodId,
                status: paymentTiming === 'immediate' ? ETransactionStatus.Success : ETransactionStatus.Pending,
            })
        }

        // Prepare fulfillment - chỉ tạo khi không phải "Giao hàng sau"
        let fulfillment: CreateFulfillmentRequest | undefined = undefined

        if (deliveryType === 'self' || deliveryType === 'delivered') {
            console.log('=== TẠO FULFILLMENT CHO ĐƠN HÀNG ===')
            const shippingInfo: CreateShippingInfoRequest = {
                cod_amount: codAmount,
                freight_payer: freightPayer,
                height: shippingHeight,
                length: shippingLength,
                requirement: shippingRequirement,
                service_fee: shippingFee,
                weight: shippingWeight,
                weight_type: 'product',
                width: shippingWidth,
            }

            const trackingInfo: CreateTrackingInfoRequest | undefined = selectedDeliveryProviderId
                ? {
                    delivery_provider_id: selectedDeliveryProviderId,
                    tracking_number: trackingNumber,
                }
                : undefined

            fulfillment = {
                delivery_method: EDeliveryMethod.EXTERNAL_SHIPPER,
                delivery_status: deliveryType === 'self' ? EFulfillmentShipmentStatus.PENDING : EFulfillmentShipmentStatus.DELIVERED,
                shipping_info: shippingInfo,
                tracking_info: trackingInfo,
                note: deliveryNote || '',
            }
        }
        // Nếu deliveryType === 'later' thì không tạo fulfillment

        // Prepare shipping lines
        const shipping_lines: ShippingLine[] = []
        if (shippingFee > 0) {
            shipping_lines.push({
                name: 'Phí vận chuyển',
                price: shippingFee,
                shipping_rate_id: 0, // Custom shipping, no rate ID
                type: ShippingLineType.Custom,
            })
        }

        // Prepare line items from products
        const line_items: CreateLineItemRequest[] = products.map(product => ({
            variant_id: product.variant_id!,
            quantity: product.quantity,
            note: product.note,
            price: product.price,
            original_price: product.original_price,
            product_name: product.product_name,
            image_url: product.image_url,
            requires_shipping: true,
        }))

        // Build CreateOrderRequest
        const customerId = values.customer_id || selectedCustomer?.id
        if (!customerId) {
            console.error('Không tìm thấy ID khách hàng')
            return
        }

        console.log("Shipping Address:", shippingAddress)
        const orderData: CreateOrderRequest = {
            assignee_id: values.assignee_id!,
            customer_id: customerId,
            fulfillment: fulfillment,
            line_items: line_items,
            location_id: values.location_id,
            note: values.note || '',
            shipping_lines: shipping_lines,
            source_id: values.source_id,
            transactions: transactions,
            shipping_address: shippingAddress,
        }

        console.log('=== THÔNG TIN ĐƠN HÀNG** ===')
        console.log('CreateOrderRequest:', JSON.stringify(orderData, null, 2))
        console.log('==========================')

        // Gọi API tạo đơn hàng
        setSubmitting(true)
        try {
            const createdOrder = await orderService.createOrder(orderData)
            notification.success({ message: 'Tạo đơn hàng thành công' })
            // Điều hướng đến màn chi tiết đơn hàng
            router.push(`/admin/order/${createdOrder.id}`)
        } catch (error) {
            console.error('Error creating order:', error)
            notification.error({ message: 'Tạo đơn hàng thất bại. Vui lòng thử lại.' })
        } finally {
            setSubmitting(false)
        }
    }

    const onBack = () => {
        router.back()
    }

    const handleVariantInputFocus = () => {
        if (!locationId) {
            return
        }
        setVariantDropdownOpen(true)
    }

    const handleVariantInputClick = () => {
        handleVariantInputFocus()
    }

    const handleAddProductClick = () => {
        handleVariantInputFocus()
    }

    const fetchVariants = useCallback(async (key: string, selectedLocationId: number) => {
        setVariantLoading(true)
        try {
            await getVariants(key, selectedLocationId)
        } catch (error) {
            console.error('Error fetching variants:', error)
        } finally {
            setVariantLoading(false)
        }
    }, [getVariants])

    const handleVariantSearch = (value: string) => {
        setVariantSearchKey(value)
    }

    useEffect(() => {
        if (!variantDropdownOpen || !locationId) return
        fetchVariants(debouncedVariantSearchKey, locationId)
    }, [debouncedVariantSearchKey, variantDropdownOpen, locationId, fetchVariants])

    const fetchCustomers = useCallback(async (key: string) => {
        setCustomerLoading(true)
        try {
            await getCustomers(key)
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setCustomerLoading(false)
        }
    }, [getCustomers])

    useEffect(() => {
        if (!customerDropdownOpen) return
        fetchCustomers(debouncedCustomerSearchKey)
    }, [customerDropdownOpen, debouncedCustomerSearchKey, fetchCustomers])

    const handleCustomerInputFocus = () => {
        setCustomerDropdownOpen(true)
    }

    const handleCustomerInputClick = () => {
        setCustomerDropdownOpen(true)
    }

    const handleCustomerSearch = (value: string) => {
        setCustomerSearchKey(value)
    }

    const buildCustomerDisplayName = (customer?: Customer | null) => {
        if (!customer) return ''
        const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim()
        return name || customer.email || 'Khách hàng'
    }

    const sanitizeAddress = (address?: AddressDetail | null): AddressDetail | null => {
        if (!address) return null
        const rest = { ...address }
        delete rest.id
        delete rest.customer_id
        delete rest.created_at
        delete rest.updated_at
        return rest
    }

    const formatFullAddress = (address?: AddressDetail | null, emptyText = 'Chưa có địa chỉ') => {
        if (!address) return emptyText
        return [address.address, address.province_name, address.district_name, address.ward_name]
            .filter(Boolean)
            .join(', ')
    }

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '0₫'
        return `${value.toLocaleString('vi-VN')}₫`
    }

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer)
        form.setFieldsValue({ customer_id: customer.id })

        const defaultAddress = sanitizeAddress(customer.default_address)
        setShippingAddress(defaultAddress)
        setBillingAddress(defaultAddress ? { ...defaultAddress } : null)
        setShowBillingAddress(false)

        setCustomerSearchKey('')
        setCustomerDropdownOpen(false)
    }

    const openShippingModal = () => {
        if (!selectedCustomer) return
        setShippingModalOpen(true)
    }

    const closeShippingModal = () => {
        setShippingModalOpen(false)
    }

    const handleSaveShippingAddress = (address: AddressDetail | null) => {
        const sanitized = sanitizeAddress(address)
        console.log('Sanitized shipping address:', sanitized)
        setShippingAddress(sanitized)
        if (!billingAddress) {
            setBillingAddress(sanitized ? { ...sanitized } : null)
        }
        setShippingModalOpen(false)
    }

    const handleVariantSelect = (variant: Variant) => {
        if (!locationId) {
            return
        }

        // Check if variant already exists in products
        const existingProduct = products.find(p => p.variant_id === variant.id)
        if (existingProduct) {
            // Increase quantity if already exists
            const newProducts = products.map(p => {
                if (p.variant_id === variant.id) {
                    const newQuantity = p.quantity + 1
                    const unitPrice = p.price || 0
                    const subtotal = newQuantity * unitPrice
                    const inventoryQuantity = variant.inventory_quantity ?? p.inventory_quantity ?? 0
                    return {
                        ...p,
                        quantity: newQuantity,
                        total: subtotal,
                        inventory_quantity: inventoryQuantity,
                        tracked: variant.tracked,
                    }
                }
                return p
            })
            setProducts(newProducts)
        } else {
            // Add new product
            const basePrice = variant.price || 0
            const inventoryQuantity = variant.inventory_quantity ?? 0
            const newProduct: LineItem = {
                variant_id: variant.id,
                quantity: 1,
                note: '',
                product_name: variant.product_name || 'Sản phẩm',
                sku: variant.sku || '',
                price: basePrice,
                original_price: basePrice,
                image_url: variant.image?.url,
                total: basePrice,
                inventory_quantity: inventoryQuantity,
                tracked: variant.tracked,
            }
            setProducts([...products, newProduct])
        }
        setVariantDropdownOpen(false)
        setVariantSearchKey('')
    }

    const openNoteModal = (index: number) => {
        setNoteModal({
            open: true,
            index,
            defaultValue: products[index]?.note || '',
        })
    }

    const closeNoteModal = () => {
        setNoteModal({
            open: false,
            index: null,
            defaultValue: '',
        })
    }

    const handleSaveLineItemNote = (note: string) => {
        if (noteModal.index === null) return
        const newProducts = [...products]
        newProducts[noteModal.index] = {
            ...newProducts[noteModal.index],
            note,
        }
        setProducts(newProducts)
        closeNoteModal()
    }

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null)
        setShippingAddress(null)
        setBillingAddress(null)
        setShowBillingAddress(false)
        form.setFieldsValue({
            customer_id: undefined,
            shipping_address: null,
            billing_address: null,
        })
    }

    const handleViewLastOrder = () => {
        if (selectedCustomer?.last_order_id) {
            router.push(`/admin/order/${selectedCustomer.last_order_id}`)
        }
    }

    return (
        <>
            {loading ? <></> : (
                <div className="min-h-screen">
                    {/* Header */}
                    <div className={`bg-white h-[65px] z-100 fixed top-0 left-0 w-full flex flex-col justify-center ${collapsed ? 'w-[calc(100%-80px)]! left-20' : 'w-[calc(100%-256px)]! left-64'} transition-all max-sm:!w-full max-sm:left-0`}>
                        <div className="bg-white h-full flex items-center justify-between shadow-lg w-full px-5">
                            <div className="flex gap-1 items-center">
                                <Button
                                    className='!border !border-gray-200'
                                    type="text"
                                    icon={<ArrowLeft size={20} />}
                                    onClick={onBack}
                                />
                                <h2 className="text-xl font-semibold ml-3 text-center">Tạo đơn hàng</h2>
                            </div>
                            <Space>

                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={form.submit}
                                    disabled={hasOutOfStockItem || products.length === 0 || submitting}
                                    loading={submitting}
                                >
                                    Tạo đơn và xác nhận
                                </Button>
                            </Space>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-[1400px] mx-auto p-6">
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            <Form.Item name="customer_id" hidden>
                                <Input type="hidden" />
                            </Form.Item>
                            <Form.Item name="shipping_address" hidden>
                                <Input type="hidden" />
                            </Form.Item>
                            <Form.Item name="billing_address" hidden>
                                <Input type="hidden" />
                            </Form.Item>
                            <Row gutter={24}>
                                {/* Left Column */}
                                <Col xs={24} lg={16}>
                                    {/* Sản phẩm */}
                                    <Card className="!mb-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">Sản phẩm</h2>
                                        </div>

                                        <div className="relative mb-4 variant-dropdown-container">
                                            <Input
                                                placeholder="Tìm theo tên, mã SKU... (F3)"
                                                prefix={<Search size={16} />}
                                                value={variantSearchKey}
                                                onFocus={handleVariantInputFocus}
                                                onClick={handleVariantInputClick}
                                                onChange={(e) => handleVariantSearch(e.target.value)}
                                            />
                                            {variantDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                                                    {variantLoading ? (
                                                        <div className="p-4 text-center text-gray-500">Đang tải...</div>
                                                    ) : variants.length > 0 ? (
                                                        variants.map((variant) => (
                                                            <VariantCard
                                                                key={variant.id}
                                                                variant={variant}
                                                                onClick={() => handleVariantSelect(variant)}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {products.length > 0 ? (
                                            <Table
                                                dataSource={products}
                                                columns={productColumns}
                                                pagination={false}
                                                rowKey="variant_id"
                                            />
                                        ) : (
                                            <div className="text-center py-12 text-gray-400">
                                                <EmptyState
                                                    imageSrc={NotFoundOrder}
                                                    title="Bạn chưa thêm sản phẩm nào"
                                                    actionLabel="Thêm sản phẩm"
                                                    onActionClick={handleAddProductClick}
                                                />
                                            </div>
                                        )}
                                    </Card>

                                    {/* Thanh toán */}
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Thanh toán</h2>

                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-base">
                                                    <span>Tổng tiền hàng</span>
                                                    <span className="font-medium">{totalAmount.toLocaleString('vi-VN')}₫</span>
                                                </div>

                                                <div className="flex justify-between items-center text-base">
                                                    <span>Phí giao hàng</span>
                                                    <InputNumber
                                                        min={0}
                                                        value={shippingFee}
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        parser={(value) => {
                                                            const numeric = value?.replace(/\$\s?|(,*)/g, '')
                                                            return numeric ? Number(numeric) : 0
                                                        }}
                                                        onChange={(value) => setShippingFee(value || 0)}
                                                        className="w-32"
                                                    />
                                                </div>

                                                <div className="flex justify-between items-center text-lg font-semibold pt-3 border-t border-gray-300">
                                                    <span>Thành tiền</span>
                                                    <span className="w-24 text-right">{finalAmount.toLocaleString('vi-VN')}₫</span>
                                                </div>
                                            </div>

                                            <div className="border-t pt-4 space-y-3 border-gray-300  ">
                                                <div>
                                                    <span className="text-sm font-semibold text-gray-800 mr-4">Trạng thái thanh toán</span>
                                                    <Radio.Group
                                                        className="mt-2 flex flex-col sm:flex-row gap-2 ml-5"
                                                        value={paymentTiming}
                                                        onChange={(e) => setPaymentTiming(e.target.value)}
                                                    >
                                                        <Radio value="immediate">Đã thanh toán</Radio>
                                                        <Radio value="later">Thanh toán sau</Radio>
                                                    </Radio.Group>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 mb-1 block">Số tiền thanh toán</label>
                                                        <InputNumber
                                                            min={0}
                                                            value={transactionAmount}
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            parser={(value) => {
                                                                const numeric = value?.replace(/\$\s?|(,*)/g, '')
                                                                return numeric ? Number(numeric) : 0
                                                            }}
                                                            onChange={(value) => setTransactionAmount(value || 0)}
                                                            className="w-full"
                                                            disabled={paymentInputsDisabled || paymentTiming === 'later'}
                                                        />
                                                        {paymentTiming === 'later' && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Thanh toán sau sẽ tự động sử dụng toàn bộ thành tiền.
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Form.Item
                                                        label="Phương thức thanh toán"
                                                        name="payment_method_id"
                                                        className="mb-0"
                                                        rules={[
                                                            {
                                                                required: !paymentInputsDisabled,
                                                                message: 'Vui lòng chọn phương thức thanh toán',
                                                            },
                                                        ]}
                                                    >
                                                        <Select
                                                            placeholder="Chọn phương thức"
                                                            options={paymentMethodOptions}
                                                            disabled={paymentInputsDisabled}
                                                            showSearch
                                                            optionFilterProp="label"
                                                        />
                                                    </Form.Item>
                                                </div>
                                                {paymentInputsDisabled && (
                                                    <p className="text-xs text-gray-500">
                                                        Vui lòng thêm sản phẩm và phương thức thanh toán để tạo giao dịch.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Giao hàng */}
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Giao hàng</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-sm font-semibold text-gray-800 mb-2 block">Hình thức giao hàng</span>
                                                <Radio.Group
                                                    className="flex flex-col sm:flex-row gap-2"
                                                    value={deliveryType}
                                                    onChange={(e) => setDeliveryType(e.target.value)}
                                                >
                                                    <Radio value="self">Tự giao hàng</Radio>
                                                    <Radio value="delivered">Đã giao hàng</Radio>
                                                    <Radio value="later">Giao hàng sau</Radio>
                                                </Radio.Group>
                                            </div>

                                            {(deliveryType === 'self' || deliveryType === 'delivered') && (
                                                <div className="space-y-4 border-t pt-4 border-gray-300">
                                                    <Form.Item label="Địa chỉ lấy hàng">
                                                        <Select
                                                            placeholder="Chọn địa chỉ lấy hàng"
                                                            value={pickupLocationId}
                                                            onChange={setPickupLocationId}
                                                            options={locations.map(loc => ({ label: loc.name, value: loc.id }))}
                                                        />
                                                    </Form.Item>

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

                                                    <Form.Item label="Mã vận đơn">
                                                        <Input
                                                            placeholder="Nhập mã vận đơn"
                                                            value={trackingNumber}
                                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                                        />
                                                    </Form.Item>

                                                    <div className="grid grid-cols-2 gap-4">
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
                                                    </div>

                                                    <Form.Item label="Khối lượng">
                                                        <InputNumber
                                                            min={0}
                                                            value={shippingWeight}
                                                            onChange={(value) => setShippingWeight(value || 0)}
                                                            className="w-full"
                                                            addonAfter="g"
                                                        />
                                                    </Form.Item>

                                                    <div className="grid grid-cols-3 gap-4">
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

                                                    <Form.Item label="Người trả phí">
                                                        <Radio.Group
                                                            value={freightPayer}
                                                            onChange={(e) => setFreightPayer(e.target.value)}
                                                        >
                                                            <Radio value={EFreightPayerType.Seller}>Shop trả</Radio>
                                                            <Radio value={EFreightPayerType.Buyer}>Khách trả</Radio>
                                                        </Radio.Group>
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
                                            )}
                                        </div>
                                    </Card>
                                </Col>

                                {/* Right Column */}
                                <Col xs={24} lg={8}>
                                    {/* Nguồn đơn */}
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Nguồn đơn</h2>
                                        <Form.Item name="source_id">
                                            <Select
                                                placeholder="Chọn nguồn đơn"
                                                suffixIcon={<span className="text-xs">▼</span>}
                                                options={sourceOptions}
                                                optionLabelProp="label"
                                                className="source-select"
                                            />
                                        </Form.Item>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Nguồn đơn sẽ giúp xác định nguồn bán hàng và giúp phân loại đơn hàng hiệu quả
                                        </p>
                                    </Card>

                                    {/* Khách hàng */}
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Khách hàng</h2>
                                        <div className="relative mb-4 customer-dropdown-container">
                                            <Input
                                                placeholder="Tìm theo tên, SĐT...(F4)"
                                                prefix={<Search size={16} />}
                                                value={customerSearchKey}
                                                onFocus={handleCustomerInputFocus}
                                                onClick={handleCustomerInputClick}
                                                onChange={(e) => handleCustomerSearch(e.target.value)}
                                            />
                                            {customerDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                                                    <div className="relative">
                                                        {customers.length > 0 ? (
                                                            customers.map((customer, idx) => (
                                                                <CustomerCard
                                                                    key={customer.id ?? idx}
                                                                    customer={customer}
                                                                    onClick={() => handleCustomerSelect(customer)}
                                                                />
                                                            ))
                                                        ) : !customerLoading ? (
                                                            <div className="p-4 text-center text-gray-500">Không tìm thấy khách hàng</div>
                                                        ) : (
                                                            <div className="p-4 text-center text-gray-500">Đang tải...</div>
                                                        )}
                                                        {customerLoading && customers.length > 0 && (
                                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-gray-500 text-sm">
                                                                Đang tải...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {selectedCustomer ? (
                                            <div className="space-y-4">
                                                {/* Customer summary */}
                                                <div className="border border-gray-200 rounded-md p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-2">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {buildCustomerDisplayName(selectedCustomer)}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                Tổng chi tiêu ({selectedCustomer.orders_count ?? 0} đơn):
                                                                <span className="font-semibold text-gray-900 ml-1">{formatCurrency(selectedCustomer.total_spent)}</span>
                                                            </p>
                                                            <Button
                                                                type="link"
                                                                size="small"
                                                                onClick={handleViewLastOrder}
                                                                disabled={!selectedCustomer.last_order_id}
                                                                className="!px-0"
                                                            >
                                                                Đơn gần nhất: {selectedCustomer.last_order_name || '---'}
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            type="text"
                                                            icon={<X size={16} />}
                                                            onClick={handleRemoveCustomer}
                                                            className="!text-gray-500"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Contact info */}
                                                <div className="border border-gray-200 rounded-md p-4 space-y-1">
                                                    <h3 className="font-semibold text-sm text-gray-900 mb-1">Thông tin liên hệ</h3>
                                                    <p className="text-sm text-gray-700">Email: {selectedCustomer.email || 'Chưa có email'}</p>
                                                    <p className="text-sm text-gray-700">Số điện thoại: {selectedCustomer.phone || 'Chưa có số điện thoại'}</p>
                                                </div>

                                                {/* Shipping address */}
                                                <div className="border border-gray-200 rounded-md p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-semibold text-sm text-gray-900">Địa chỉ giao hàng</h3>
                                                        <Button type="link" size="small" disabled={!selectedCustomer} onClick={openShippingModal}>
                                                            Chỉnh sửa
                                                        </Button>
                                                    </div>
                                                    <div className="text-sm text-gray-700 space-y-1">
                                                        <p>{[shippingAddress?.first_name, shippingAddress?.last_name].filter(Boolean).join(' ') || buildCustomerDisplayName(selectedCustomer)}</p>
                                                        <p>{shippingAddress?.email || selectedCustomer.email || 'Chưa có email'}</p>
                                                        <p>{shippingAddress?.phone || selectedCustomer.default_address?.phone || selectedCustomer.phone || 'Chưa có số điện thoại'}</p>
                                                        <p>{formatFullAddress(shippingAddress, 'Chưa có địa chỉ giao hàng')}</p>
                                                    </div>
                                                </div>

                                                {/* Billing address - toggle */}
                                                {showBillingAddress && (
                                                    <div className="border border-gray-200 rounded-md p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-semibold text-sm text-gray-900">Địa chỉ thanh toán</h3>
                                                        </div>
                                                        <div className="text-sm text-gray-700 space-y-1">
                                                            <p>{[billingAddress?.first_name, billingAddress?.last_name].filter(Boolean).join(' ') || buildCustomerDisplayName(selectedCustomer)}</p>
                                                            <p>{billingAddress?.email || selectedCustomer.email || 'Chưa có email'}</p>
                                                            <p>{billingAddress?.phone || selectedCustomer.phone || 'Chưa có số điện thoại'}</p>
                                                            <p>{formatFullAddress(billingAddress || shippingAddress, 'Chưa có địa chỉ thanh toán')}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    type="link"
                                                    size="small"
                                                    className="!px-0"
                                                    onClick={() => setShowBillingAddress(prev => !prev)}
                                                >
                                                    {showBillingAddress ? 'Ẩn địa chỉ thanh toán' : 'Xem địa chỉ thanh toán'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">Chưa có khách hàng nào được chọn</p>
                                        )}
                                    </Card>

                                    {/* Ghi chú */}
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
                                        <Form.Item name="note">
                                            <TextArea
                                                rows={4}
                                                placeholder="VD: Nhận hàng ghi công nợ"
                                            />
                                        </Form.Item>
                                    </Card>

                                    {/* Thông tin bổ sung */}
                                    <Card className="!mb-4">
                                        <h2 className="text-lg font-semibold mb-4">Thông tin bổ sung</h2>

                                        <Form.Item
                                            label="Bán tại chi nhánh"
                                            name="location_id"
                                        >
                                            <Select
                                                placeholder="Chọn chi nhánh"
                                                options={locations.map(l => ({ label: l.name, value: l.id }))}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="Nhân viên phụ trách"
                                            name="assignee_id"
                                        >
                                            <Select
                                                placeholder="Chọn nhân viên phụ trách"
                                                options={assignees.map(a => ({ label: a.name, value: a.id }))}
                                            />
                                        </Form.Item>
                                    </Card>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>
            )}
            <LineItemNoteModal
                open={noteModal.open}
                defaultValue={noteModal.defaultValue}
                onCancel={closeNoteModal}
                onSave={handleSaveLineItemNote}
            />
            <EditShippingAddressModal
                open={shippingModalOpen}
                customerId={selectedCustomer?.id}
                initialAddress={shippingAddress}
                onCancel={closeShippingModal}
                onSave={handleSaveShippingAddress}
            />
            <AddDeliveryProviderModal
                open={addDeliveryProviderModalOpen}
                onCancel={() => setAddDeliveryProviderModalOpen(false)}
                onSave={handleCreateDeliveryProvider}
            />
            <style jsx global>{`
                .source-select .ant-select-selector {
                    padding: 8px 12px !important;
                }
            `}</style>
        </>
    )
}

export default CreateOrder