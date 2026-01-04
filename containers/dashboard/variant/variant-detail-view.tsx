'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Table,
    Tooltip,
    Form,
    Input,
    InputNumber,
    Checkbox,
    Modal,
    Upload,
    Select,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react'
import dayjs from 'dayjs'
import Image from 'next/image'
import Link from 'next/link'
import { useVariantDetail } from './hooks/use-variant-detail'
import { ProductVariant } from '@/types/response/product'
import { InventoryLevel } from '@/types/response/inventory-level'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import attachmentService from '@/services/attachment'
import { Attachment } from '@/types/response/collection'
import inventoryLevelService, { ChangeInventoryReason } from '@/services/inventory-level'

const VariantDetailView: React.FC = () => {
    const {
        variant,
        product,
        variants,
        attributes,
        inventoryLevels,
        loading,
        goBackToProduct,
        openAnotherVariant,
        handleUpdateVariant,
        handleDeleteVariant,
        refetch,
    } = useVariantDetail()
    const { collapsed } = useGlobalContext()

    const [form] = Form.useForm()
    const [saving, setSaving] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState<Attachment | null>(null)
    const [imageModalVisible, setImageModalVisible] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [adjustModalVisible, setAdjustModalVisible] = useState(false)
    const [selectedLevel, setSelectedLevel] = useState<InventoryLevel | null>(null)
    const [adjustValue, setAdjustValue] = useState<number>(0)
    const [newQuantity, setNewQuantity] = useState<number>(0)
    const [reason, setReason] = useState<ChangeInventoryReason>('fact_inventory')

    const variantColumns: ColumnsType<ProductVariant> = [
        {
            title: 'Phiên bản',
            key: 'title',
            render: (_, record) => {
                const isActive = record.id === variant?.id
                return (
                    <button
                        type="button"
                        className={`text-left w-full ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-800'
                            }`}
                        onClick={() => record.id && openAnotherVariant(record.id)}
                    >
                        {record.title}
                    </button>
                )
            },
        },
        {
            title: 'Có thể bán',
            key: 'inventory',
            width: 120,
            align: 'right',
            render: (_, record) =>
                (record.inventory_quantity ?? 0).toLocaleString('vi-VN'),
        },
    ]

    const openAdjustModal = (level: InventoryLevel) => {
        setSelectedLevel(level)
        setAdjustValue(0)
        setNewQuantity(level.available)
        setReason('fact_inventory')
        setAdjustModalVisible(true)
    }

    const handleChangeNewQuantity = (value: number | null) => {
        if (value === null || !selectedLevel) return
        setNewQuantity(value)
        setAdjustValue(value - (selectedLevel.available || 0))
    }

    const handleChangeAdjustValue = (value: number | null) => {
        if (value === null || !selectedLevel) return
        setAdjustValue(value)
        setNewQuantity((selectedLevel.available || 0) + value)
    }

    const handleSaveAdjust = async () => {
        if (!selectedLevel || !variant) return
        if (!adjustValue) {
            setAdjustModalVisible(false)
            return
        }
        try {
            await inventoryLevelService.updateInventoryLevel({
                location_id: selectedLevel.location_id,
                variant_id: variant.id,
                reason,
                change_value: adjustValue,
                reference_document_id: 0,
            })
            setAdjustModalVisible(false)
            await refetch()
        } catch {
            // Axios interceptor sẽ xử lý thông báo lỗi
        }
    }

    const inventoryColumns: ColumnsType<InventoryLevel> = [
        {
            title: 'Kho lưu trữ',
            dataIndex: 'location_name',
            key: 'location_name',
        },
        {
            title: 'Tồn kho',
            dataIndex: 'available',
            key: 'available',
            align: 'right',
            render: (val: number, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => openAdjustModal(record)}
                >
                    {val?.toLocaleString('vi-VN') ?? 0}
                </Button>
            ),
        },
        {
            title: 'Hàng đang về',
            dataIndex: 'committed',
            key: 'committed',
            align: 'right',
            render: (val: number) => val?.toLocaleString('vi-VN') ?? 0,
        },
        {
            title: 'Đang giao dịch',
            dataIndex: 'incoming',
            key: 'incoming',
            align: 'right',
            render: (val: number) => val?.toLocaleString('vi-VN') ?? 0,
        },
        {
            title: 'Có thể bán',
            dataIndex: 'on_hand',
            key: 'on_hand',
            align: 'right',
            render: (val: number) => val?.toLocaleString('vi-VN') ?? 0,
        },
    ]

    const attributeList = useMemo(
        () =>
            attributes
                ?.slice()
                .sort((a, b) => a.position - b.position) ?? [],
        [attributes],
    )

    const createdAt = variant?.created_at
        ? dayjs(variant.created_at)
        : null

    useEffect(() => {
        if (!variant) return
        form.setFieldsValue({
            sku: variant.sku,
            barcode: variant.barcode,
            unit: variant.unit,
            price: variant.price,
            compare_at_price: variant.compare_at_price,
            cost_price: variant.cost_price,
            weight: variant.weight,
            weight_unit: variant.weight_unit || 'g',
            tracked: variant.tracked,
            lot_management: variant.lot_management,
            requires_shipping: variant.requires_shipping,
            option1: variant.option1,
            option2: variant.option2,
            option3: variant.option3,
        })
        setSelectedImage(variant.image || null)
    }, [variant, form])

    const handleUpload = async (options: Parameters<NonNullable<UploadProps['customRequest']>>[0]) => {
        const { file, onSuccess, onError } = options
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', 'product')
            const uploaded = await attachmentService.uploadAttachment(formData)
            const image = uploaded[0]
            setSelectedImage(image)
            onSuccess?.(uploaded)
        } catch (err) {
            onError?.(err as Error)
        } finally {
            setUploading(false)
        }
    }

    const onSubmit = async (values: Record<string, unknown>) => {
        if (!variant) return
        setSaving(true)
        try {
            await handleUpdateVariant({
                id: variant.id,
                sku: values.sku as string | undefined,
                barcode: values.barcode as string | undefined,
                unit: values.unit as string | undefined,
                price: values.price as number | undefined,
                compare_at_price: values.compare_at_price as number | undefined,
                cost_price: values.cost_price as number | undefined,
                weight: values.weight as number | undefined,
                weight_unit: values.weight_unit as string | undefined,
                tracked: values.tracked as boolean | undefined,
                lot_management: values.lot_management as boolean | undefined,
                requires_shipping: values.requires_shipping as boolean | undefined,
                image_id: selectedImage?.id || variant.image_id,
                option1: (values.option1 as string | undefined) ?? variant.option1,
                option2: (values.option2 as string | undefined) ?? variant.option2,
                option3: (values.option3 as string | undefined) ?? variant.option3,
                type: variant.type,
            })
        } finally {
            setSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!variant) return
        setOpenDeleteModal(false)
        await handleDeleteVariant()
    }

    return (
        <div className="min-h-screen">
            <div className={` z-100 w-full flex flex-col justify-center transition-all pt-6`}>
                <div className=" h-full flex items-center justify-between w-full px-2">
                    <div className="flex items-center gap-2">
                        <Button
                            className="border! border-gray-200! bg-white!"
                            type="text"
                            icon={<ArrowLeft size={20} />}
                            onClick={goBackToProduct}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500">
                                {product?.name}
                            </span>
                            <span className="text-lg font-semibold">
                                {variant?.title || 'Chi tiết phiên bản'}
                            </span>
                        </div>
                    </div>
                    <Space>
                        {variant && (
                            <Button danger onClick={() => setOpenDeleteModal(true)}>
                                Xoá
                            </Button>
                        )}
                        <Button
                            type="primary"
                            onClick={() => form.submit()}
                            loading={saving}
                            disabled={!variant}
                        >
                            Lưu
                        </Button>
                    </Space>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-2 pt-6">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onSubmit}
                >
                    <Row gutter={24} className='space-y-2!'>
                        <Col xs={24} lg={7}>
                            <Space direction="vertical" className="w-full">
                                <Card>
                                    <Space align="start">
                                        <button
                                            type="button"
                                            className="w-16 h-16 border rounded overflow-hidden flex items-center justify-center cursor-pointer"
                                            onClick={() => setImageModalVisible(true)}
                                        >
                                            {(selectedImage || variant?.image)?.url ? (
                                                <Image
                                                    src={(selectedImage || variant?.image)!.url}
                                                    alt={(selectedImage || variant?.image)!.filename || ''}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <UploadIcon size={24} className="text-gray-400" />
                                            )}
                                        </button>
                                        <div>
                                            <div className="font-semibold">
                                                {product?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {variant?.sku && (
                                                    <>SKU: {variant.sku}</>
                                                )}
                                            </div>
                                            {createdAt && (
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Tạo ngày{' '}
                                                    <Tooltip title={createdAt.format(
                                                        'DD/MM/YYYY HH:mm:ss',
                                                    )}>
                                                        <span className="cursor-help">
                                                            {createdAt.format(
                                                                'DD/MM/YYYY',
                                                            )}
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </Space>
                                </Card>

                                <Card title="Phiên bản">
                                    <Table<ProductVariant>
                                        size="small"
                                        dataSource={variants}
                                        columns={variantColumns}
                                        rowKey={(record) =>
                                            String(record.id || record.title)
                                        }
                                        pagination={false}
                                        loading={loading}
                                    />
                                </Card>
                            </Space>
                        </Col>

                        <Col xs={24} lg={17}>
                            <Space direction="vertical" className="w-full">
                                <Card title="Thuộc tính">
                                    <div className="space-y-3">
                                        {attributeList.slice(0, 3).map((attr, index) => {
                                            const fieldName =
                                                index === 0 ? 'option1' :
                                                    index === 1 ? 'option2' : 'option3'
                                            return (
                                                <Form.Item
                                                    key={attr.id || index}
                                                    label={attr.name}
                                                    name={fieldName}
                                                >
                                                    <Input placeholder={`Nhập ${attr.name.toLowerCase()}`} />
                                                </Form.Item>
                                            )
                                        })}
                                    </div>
                                </Card>

                                <Card title="Thông tin phiên bản">
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item
                                                label="Mã SKU"
                                                name="sku"
                                            >
                                                <Input placeholder="Nhập mã SKU" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                label="Mã vạch / Barcode"
                                                name="barcode"
                                            >
                                                <Input placeholder="Nhập mã vạch" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                label="Đơn vị tính"
                                                name="unit"
                                            >
                                                <Input placeholder="Nhập đơn vị tính" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                <Card title="Thông tin giá">
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item
                                                label="Giá bán"
                                                name="price"
                                            >
                                                <InputNumber
                                                    className="w-full"
                                                    formatter={(value) =>
                                                        `${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ',',
                                                        )
                                                    }
                                                    addonAfter="₫"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                label="Giá so sánh"
                                                name="compare_at_price"
                                            >
                                                <InputNumber
                                                    className="w-full"
                                                    formatter={(value) =>
                                                        `${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ',',
                                                        )
                                                    }
                                                    addonAfter="₫"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                label="Giá vốn"
                                                name="cost_price"
                                            >
                                                <InputNumber
                                                    className="w-full"
                                                    formatter={(value) =>
                                                        `${value}`.replace(
                                                            /\B(?=(\d{3})+(?!\d))/g,
                                                            ',',
                                                        )
                                                    }
                                                    addonAfter="₫"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                <Card title="Thông tin kho">
                                    <Space direction="vertical" className="w-full">
                                        <div className="flex flex-col gap-1">
                                            <Form.Item
                                                name="lot_management"
                                                valuePropName="checked"
                                            >
                                                <Checkbox>Quản lý tồn kho</Checkbox>
                                            </Form.Item>
                                            <Form.Item
                                                name="tracked"
                                                valuePropName="checked"
                                            >
                                                <Checkbox>Cho phép bán âm</Checkbox>
                                            </Form.Item>
                                            <Form.Item
                                                name="requires_shipping"
                                                valuePropName="checked"
                                            >
                                                <Checkbox>
                                                    Sản phẩm yêu cầu vận chuyển
                                                </Checkbox>
                                            </Form.Item>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold">
                                                    Bảng phân bổ tồn kho
                                                </h3>
                                                {variant?.id && (
                                                    <Link
                                                        href={`/admin/inventory/history?variant_id=${variant.id}`}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        Xem lịch sử thay đổi kho
                                                    </Link>
                                                )}
                                            </div>
                                            <Table<InventoryLevel>
                                                size="small"
                                                dataSource={inventoryLevels}
                                                columns={inventoryColumns}
                                                rowKey={(record) =>
                                                    String(record.id)
                                                }
                                                pagination={false}
                                                loading={loading}
                                            />
                                        </div>
                                    </Space>
                                </Card>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </div>
            <Modal
                title="Xác nhận xoá phiên bản"
                open={openDeleteModal}
                onOk={confirmDelete}
                onCancel={() => setOpenDeleteModal(false)}
                okText="Xoá"
                okType="danger"
                cancelText="Huỷ"
            >
                <p>
                    Bạn có chắc chắn muốn xoá phiên bản này? Hành động này không thể hoàn tác.
                </p>
            </Modal>
            <Modal
                title="Điều chỉnh tồn kho"
                open={adjustModalVisible}
                onCancel={() => setAdjustModalVisible(false)}
                onOk={handleSaveAdjust}
                okText="Lưu"
                cancelText="Hủy"
            >
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Kho lưu trữ
                        </div>
                        <div className="font-medium">
                            {selectedLevel?.location_name || '-'}
                        </div>
                    </div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="text-sm text-gray-500 mb-1">
                                Điều chỉnh
                            </div>
                            <InputNumber
                                className="w-full"
                                value={adjustValue}
                                onChange={handleChangeAdjustValue}
                            />
                        </Col>
                        <Col span={12}>
                            <div className="text-sm text-gray-500 mb-1">
                                Tồn kho mới
                            </div>
                            <InputNumber
                                className="w-full"
                                value={newQuantity}
                                onChange={handleChangeNewQuantity}
                            />
                        </Col>
                    </Row>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Lý do
                        </div>
                        <Form.Item noStyle>
                            <Select
                                className="w-full"
                                value={reason}
                                onChange={(value: ChangeInventoryReason) => setReason(value)}
                                options={[
                                    {
                                        value: 'fact_inventory',
                                        label: 'Cập nhật tồn kho thực tế',
                                    },
                                    {
                                        value: 'create_product',
                                        label: 'Tạo sản phẩm',
                                    },
                                    {
                                        value: 'create_order',
                                        label: 'Tạo đơn hàng',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </div>
                </div>
            </Modal>
            <Modal
                title="Chọn ảnh cho phiên bản"
                open={imageModalVisible}
                onCancel={() => setImageModalVisible(false)}
                footer={null}
                width={640}
            >
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {product?.images?.map((img) => {
                        const isSelected = (selectedImage || variant?.image)?.id === img.id
                        return (
                            <button
                                type="button"
                                key={img.id}
                                onClick={() => setSelectedImage(img)}
                                className={`relative cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 ${isSelected
                                    ? 'border-2 border-blue-500 ring-2 ring-blue-200'
                                    : 'border border-gray-200 hover:border-blue-400'
                                    }`}
                            >
                                <Image
                                    src={img.url}
                                    alt={img.filename || ''}
                                    width={150}
                                    height={150}
                                />
                            </button>
                        )
                    })}
                </div>
                <div className="border rounded-md">
                    <Upload.Dragger
                        multiple={false}
                        customRequest={handleUpload}
                        accept="image/*"
                        showUploadList={false}
                    >
                        <div className="text-center">
                            <UploadIcon size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm">
                                Kéo thả hoặc bấm để thêm ảnh mới
                            </p>
                        </div>
                    </Upload.Dragger>
                </div>
            </Modal>
        </div>
    )
}

export default VariantDetailView


