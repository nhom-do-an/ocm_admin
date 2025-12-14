'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
    Input,
    Button,
    Card,
    Table,
    Row,
    Col,
    Checkbox,
    InputNumber,
} from 'antd'
import { ArrowLeft, Search, Trash2 } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { useEditOrder } from './hooks/use-edit-order'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import VariantCard from './components/VariantCard'
import { Variant } from '@/services/variant'
import Image from 'next/image'
import LineItemNoteModal from './components/LineItemNoteModal'
import EditShippingFeeModal from './components/EditShippingFeeModal'
import { UpdateOrderItemsRequest, UpdateOrderLineItemRequestV2, UpdateShippingLineRequestV2 } from '@/types/request/order'
import { ShippingLineType } from '@/types/enums/enum'
import orderService from '@/services/order'
import { useGlobalNotification } from '@/hooks/useNotification'

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

type LineItem = {
    id?: number
    variant_id: number
    product_name: string
    sku?: string
    quantity: number
    price: number
    total: number
    note?: string
    image_url?: string
    inventory_quantity?: number
    tracked?: boolean
}

const EditOrderView: React.FC = () => {
    const { collapsed } = useGlobalContext()
    const {
        order,
        variants,
        loading,
        getVariants,
        orderId,
    } = useEditOrder()
    const router = useRouter()
    const notification = useGlobalNotification()
    const [submitting, setSubmitting] = useState(false)

    const [products, setProducts] = useState<LineItem[]>([])
    const [totalAmount, setTotalAmount] = useState(0)
    const [shippingLines, setShippingLines] = useState<Array<{ id?: number; title: string; price: number; type: ShippingLineType }>>([])
    const [variantDropdownOpen, setVariantDropdownOpen] = useState(false)
    const [variantSearchKey, setVariantSearchKey] = useState('')
    const [variantLoading, setVariantLoading] = useState(false)
    const [locationId, setLocationId] = useState<number | undefined>(undefined)
    const [noteModal, setNoteModal] = useState<{ open: boolean; index: number | null; defaultValue: string }>({
        open: false,
        index: null,
        defaultValue: '',
    })
    const [shippingFeeModalOpen, setShippingFeeModalOpen] = useState(false)
    const [sendEmail, setSendEmail] = useState(false)
    const [initialProducts, setInitialProducts] = useState<LineItem[]>([])
    const [initialShippingLines, setInitialShippingLines] = useState<Array<{ id?: number; title: string; price: number; type: ShippingLineType }>>([])
    const debouncedVariantSearchKey = useDebounce(variantSearchKey, 300)

    // Initialize products and shipping lines from order
    useEffect(() => {
        if (order) {
            // Set location ID
            if (order.location?.id) {
                setLocationId(order.location.id)
            }

            // Initialize products from line items
            const initialProductsData: LineItem[] = (order.line_items || []).map(item => ({
                id: item.id,
                variant_id: item.variant_id || 0,
                product_name: item.product_name || '',
                quantity: item.quantity || 0,
                price: item.price || 0,
                total: (item.quantity || 0) * (item.price || 0),
                note: item.note,
                image_url: item.image_url,
            }))
            setProducts(initialProductsData)
            setInitialProducts(JSON.parse(JSON.stringify(initialProductsData))) // Deep copy

            // Initialize shipping lines
            const initialShippingLinesData = (order.shipping_lines || []).map(line => ({
                id: line.id,
                title: line.name || '',
                price: line.price || 0,
                type: ShippingLineType.Custom,
            }))
            setShippingLines(initialShippingLinesData)
            setInitialShippingLines(JSON.parse(JSON.stringify(initialShippingLinesData))) // Deep copy
        }
    }, [order])

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

    // Close dropdown when location changes
    useEffect(() => {
        setVariantDropdownOpen(false)
        setVariantSearchKey('')
    }, [locationId])

    const productColumns: ColumnsType<LineItem> = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product_name',
            key: 'name',
            width: 250,
            render: (_, record, index) => (
                <div className="flex items-center gap-3">
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

    const shippingFeeTotal = shippingLines.reduce((sum, line) => sum + line.price, 0)
    const finalAmount = totalAmount + shippingFeeTotal

    // Check if there are changes
    const hasChanges = useCallback(() => {
        // Compare products
        if (products.length !== initialProducts.length) return true

        const productsMap = new Map(products.map(p => [p.id || `new-${p.variant_id}`, p]))
        const initialProductsMap = new Map(initialProducts.map(p => [p.id || `new-${p.variant_id}`, p]))

        // Check if any product was added or removed
        if (productsMap.size !== initialProductsMap.size) return true

        // Check if any product was modified
        for (const [key, product] of productsMap.entries()) {
            const initial = initialProductsMap.get(key)
            if (!initial) return true
            if (
                product.quantity !== initial.quantity ||
                product.price !== initial.price ||
                (product.note || '') !== (initial.note || '')
            ) {
                return true
            }
        }

        // Compare shipping lines
        if (shippingLines.length !== initialShippingLines.length) return true

        const shippingLinesMap = new Map(shippingLines.map((l, idx) => [l.id || `new-${idx}`, l]))
        const initialShippingLinesMap = new Map(initialShippingLines.map((l, idx) => [l.id || `new-${idx}`, l]))

        if (shippingLinesMap.size !== initialShippingLinesMap.size) return true

        for (const [key, line] of shippingLinesMap.entries()) {
            const initial = initialShippingLinesMap.get(key)
            if (!initial) return true
            if (
                line.title !== initial.title ||
                line.price !== initial.price
            ) {
                return true
            }
        }

        return false
    }, [products, initialProducts, shippingLines, initialShippingLines])

    const hasChangesValue = hasChanges()

    // Keyboard shortcut F7 to open shipping fee modal
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'F7' || (event.key === 'f' && event.shiftKey && event.ctrlKey)) {
                event.preventDefault()
                handleOpenShippingFeeModal()
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [])

    const handleVariantInputFocus = () => {
        if (!locationId) {
            return
        }
        setVariantDropdownOpen(true)
    }

    const handleVariantInputClick = () => {
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
                    return {
                        ...p,
                        quantity: newQuantity,
                        total: subtotal,
                    }
                }
                return p
            })
            setProducts(newProducts)
        } else {
            // Add new product
            const basePrice = variant.price || 0
            const newProduct: LineItem = {
                variant_id: variant.id,
                quantity: 1,
                note: '',
                product_name: variant.product_name || 'Sản phẩm',
                sku: variant.sku || '',
                price: basePrice,
                total: basePrice,
                image_url: variant.image?.url,
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

    const handleOpenShippingFeeModal = () => {
        setShippingFeeModalOpen(true)
    }

    const handleCloseShippingFeeModal = () => {
        setShippingFeeModalOpen(false)
    }

    const handleSaveShippingFee = (data: { title: string; price: number; type: ShippingLineType } | null) => {
        if (data === null) {
            // Delete all shipping lines
            setShippingLines([])
        } else if (shippingLines.length > 0) {
            // Replace the first one (edit)
            setShippingLines([{
                ...shippingLines[0],
                title: data.title,
                price: data.price,
                type: data.type,
            }])
        } else {
            // Add new
            setShippingLines([{
                title: data.title,
                price: data.price,
                type: data.type,
            }])
        }
        handleCloseShippingFeeModal()
    }

    const handleSubmit = async () => {
        if (!orderId) return

        if (products.length === 0) {
            notification.error({ message: 'Vui lòng thêm ít nhất một sản phẩm' })
            return
        }

        if (!order) return

        // Prepare line items
        // We need to track which items were removed (items that existed in order but not in products)
        const existingProductIds = new Set(products.filter(p => p.id).map(p => p.id!))
        const removedItems: UpdateOrderLineItemRequestV2[] = (order.line_items || [])
            .filter(item => item.id && !existingProductIds.has(item.id))
            .map(item => ({
                id: item.id || null,
                variant_id: null,
                quantity: null, // null to delete
                note: null,
            }))

        const updatedItems: UpdateOrderLineItemRequestV2[] = products.map(product => ({
            id: product.id || null,
            variant_id: product.id ? null : product.variant_id, // Only set variant_id for new items
            quantity: product.quantity,
            note: product.note || null,
        }))

        const lineItems = [...removedItems, ...updatedItems]

        // Prepare shipping lines
        // Track removed shipping lines
        const existingShippingLineIds = new Set(shippingLines.filter(l => l.id).map(l => l.id!))
        const removedShippingLines: UpdateShippingLineRequestV2[] = (order?.shipping_lines || [])
            .filter(line => line.id && !existingShippingLineIds.has(line.id))
            .map(line => ({
                id: line.id || null,
                title: null,
                price: null, // null to delete
                type: null,
            }))

        const updatedShippingLines: UpdateShippingLineRequestV2[] = shippingLines.map(line => ({
            id: line.id || null,
            title: line.title,
            price: line.price,
            type: line.type,
        }))

        const shippingLinesData = [...removedShippingLines, ...updatedShippingLines]

        const updateData: UpdateOrderItemsRequest = {
            line_items: lineItems,
            shipping_lines: shippingLinesData,
            send_email: sendEmail,
        }

        setSubmitting(true)
        try {
            await orderService.updateOrderItems(orderId, updateData)
            notification.success({ message: 'Cập nhật đơn hàng thành công' })
            router.push(`/admin/order/${orderId}`)
        } catch (error) {
            console.error('Error updating order:', error)
            notification.error({ message: 'Cập nhật đơn hàng thất bại. Vui lòng thử lại.' })
        } finally {
            setSubmitting(false)
        }
    }

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '0₫'
        return `${value.toLocaleString('vi-VN')}₫`
    }

    if (loading) {
        return <div>Đang tải...</div>
    }

    if (!order) {
        return <div>Không tìm thấy đơn hàng</div>
    }

    return (
        <>
            <div className="min-h-screen">
                {/* Header */}
                <div className={`bg-white h-[65px] z-100 fixed top-0 left-0 w-full flex flex-col justify-center ${collapsed ? 'w-[calc(100%-80px)]! left-20' : 'w-[calc(100%-256px)]! left-64'} transition-all max-sm:!w-full max-sm:left-0`}>
                    <div className="bg-white h-full flex items-center justify-between shadow-lg w-full px-5">
                        <div className="flex gap-1 items-center">
                            <Button
                                className='!border !border-gray-200'
                                type="text"
                                icon={<ArrowLeft size={20} />}
                                onClick={() => router.back()}
                            />
                            <h2 className="text-xl font-semibold ml-3 text-center">Sửa đơn {order.name || order.order_number}</h2>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSubmit}
                            disabled={products.length === 0 || submitting || !hasChangesValue}
                            loading={submitting}
                        >
                            Cập nhật đơn hàng
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-[1400px] mx-auto p-6">
                    <Row gutter={24}>
                        {/* Left Column */}
                        <Col xs={24} lg={16}>
                            {/* Sản phẩm */}
                            <Card className="!mb-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Sản phẩm</h2>
                                </div>

                                <div className="relative mb-4 variant-dropdown-container overfow-y-scroll ">
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
                                        className='overflow-y-scroll'
                                        dataSource={products}
                                        columns={productColumns}
                                        pagination={false}
                                        rowKey={(record, index) => record.id?.toString() || `new-${index}`}
                                    />
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        Chưa có sản phẩm nào
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
                                            <span className="font-medium">{formatCurrency(totalAmount)}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-base">
                                            <span>Phí giao hàng</span>
                                            <div className="flex items-center gap-2">
                                                {shippingLines.length > 0 && (
                                                    <span className="text-sm mr-2">
                                                        {shippingLines.map((line, index) => (
                                                            <span key={index}>
                                                                {line.title}: {formatCurrency(line.price)}
                                                                {index < shippingLines.length - 1 && ', '}
                                                            </span>
                                                        ))}
                                                    </span>
                                                )}
                                                <Button
                                                    type="link"
                                                    onClick={() => handleOpenShippingFeeModal()}
                                                >
                                                    {shippingLines.length === 0 ? 'Thêm phí giao hàng (F7)' : 'Chỉnh sửa phí giao hàng (F7)'}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-lg font-semibold pt-3 border-t border-gray-300">
                                            <span>Thành tiền</span>
                                            <span className="w-24 text-right">{formatCurrency(finalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>

                        {/* Right Column */}
                        <Col xs={24} lg={8}>
                            {/* Tóm tắt */}
                            <Card className="!mb-4">
                                <h2 className="text-lg font-semibold mb-4">Tóm tắt</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Tổng tiền sau cập nhật</span>
                                        <span className="font-medium">{formatCurrency(finalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Khách đã thanh toán</span>
                                        <span className="font-medium">{formatCurrency(0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cần thu thêm</span>
                                        <span className="font-medium">{formatCurrency(finalAmount)}</span>
                                    </div>
                                    <div className="pt-3 border-t">
                                        <Checkbox
                                            checked={sendEmail}
                                            onChange={(e) => setSendEmail(e.target.checked)}
                                        >
                                            Gửi email cho khách hàng
                                        </Checkbox>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            <LineItemNoteModal
                open={noteModal.open}
                defaultValue={noteModal.defaultValue}
                onCancel={closeNoteModal}
                onSave={handleSaveLineItemNote}
            />
            <EditShippingFeeModal
                open={shippingFeeModalOpen}
                onCancel={handleCloseShippingFeeModal}
                onSave={handleSaveShippingFee}
                initialData={shippingLines.length > 0 ? shippingLines[0] : undefined}
                allowDelete={shippingLines.length > 0}
            />
        </>
    )
}

export default EditOrderView

