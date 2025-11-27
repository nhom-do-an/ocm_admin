'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
    Input,
    Button,
    Card,
    Form,
    Space,
    Upload,
    Row,
    Col,
    UploadFile,
    Modal,
    Table,
    Image,
    Tag,
    Tooltip,
} from 'antd'
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react'
import TinyEditor from '@/components/TinyEditor'
import { Attachment, Collection } from '@/types/response/collection'
import { Product } from '@/types/response/product'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import attachmentService from '@/services/attachment'
import { useGlobalNotification } from '@/hooks/useNotification'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import { ECollectionType } from '@/types/enums/enum'
import { useCreateCollection } from './hooks/use-create-collection'

const { TextArea } = Input

interface FormValues {
    name: string
    meta_title: string
    meta_description: string
}

const CreateCollectionView: React.FC = () => {
    const { collection, loading, editMode, collectionProducts, loadingProducts, createCollection, updateCollection, deleteCollection } = useCreateCollection()
    const { collapsed } = useGlobalContext()
    const [form] = Form.useForm<FormValues>()
    const [content, setContent] = useState('')
    const [images, setImages] = useState<Attachment[]>([])
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [openSeo, setOpenSeo] = useState<boolean>(false)
    const [isChanged, setIsChanged] = useState<boolean>(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)

    const notification = useGlobalNotification()
    const router = useRouter()

    // 🔹 Lưu dữ liệu ban đầu để so sánh thay đổi
    const [initialData, setInitialData] = useState<any>(null)

    useEffect(() => {
        if (!loading && editMode && collection) {
            setContent(collection.description)
            setOpenSeo(!!(collection.meta_title || collection.meta_description))
            form.setFieldsValue({
                name: collection.name,
                meta_title: collection.meta_title,
                meta_description: collection.meta_description,
            })
            setImages(collection.image ? [collection.image] : [])
            const fileListFromImages: UploadFile[] = (collection.image ? [collection.image] : []).map((img, index) => ({
                uid: String(index),
                name: img.filename,
                status: 'done',
                url: img.url,
            }))
            setFileList(fileListFromImages)

            setInitialData({
                name: collection.name || '',
                meta_title: collection.meta_title || '',
                meta_description: collection.meta_description || '',
                description: collection.description || '',
                imageUrl: collection.image?.url || '',
            })
        }
    }, [loading, editMode, collection, form])

    // 🔹 Kiểm tra thay đổi
    const checkChanged = useCallback(() => {
        if (!initialData) return false
        const values = form.getFieldsValue()
        const currentImageUrl = images[0]?.url || ''
        return (
            values.name !== initialData.name ||
            values.meta_title !== initialData.meta_title ||
            values.meta_description !== initialData.meta_description ||
            content !== initialData.description ||
            currentImageUrl !== initialData.imageUrl
        )
    }, [form, content, images, initialData])

    useEffect(() => {
        if (editMode) setIsChanged(checkChanged())
    }, [checkChanged, form, content, images])

    const handleSubmit = async (values: FormValues) => {
        const collectionData: Collection = {
            id: collection?.id || 0,
            name: values.name,
            description: content || '',
            meta_title: values.meta_title || '',
            meta_description: values.meta_description || '',
            type: ECollectionType.MANUAL,
            rules: [],
        }
        if (images.length > 0) {
            collectionData.image = images[0]
        }

        if (editMode && collection?.id) {
            await updateCollection(collectionData)
            setIsChanged(false)
        } else {
            await createCollection(collectionData)
        }
    }

    const handleUpload = async (options: any) => {
        const { file, onSuccess, onError } = options
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', 'collection')

            const uploaded = await attachmentService.uploadAttachment(formData)
            const uploadedFile = Array.isArray(uploaded) ? uploaded[0] : uploaded

            // ✅ Chỉ giữ 1 ảnh
            setImages([uploadedFile])
            setFileList([
                {
                    uid: file.uid,
                    name: uploadedFile.filename,
                    status: 'done',
                    url: uploadedFile.url,
                },
            ])
            onSuccess(uploadedFile)
        } catch (err) {
            notification.error({ message: 'Upload file thất bại' })
            onError(err)
        }
    }

    const handleRemove = (file: UploadFile) => {
        setFileList([])
        setImages([])
    }

    const onBack = () => router.back()

    const onDelete = () => {
        if (!collection?.id) return
        setOpenDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!collection?.id) return
        await deleteCollection(collection.id as number)
        setOpenDeleteModal(false)
    }

    const handleViewAllProducts = () => {
        if (!collection?.id) return
        const params = new URLSearchParams({
            page: '1',
            limit: '20',
            collection_ids: String(collection.id),
        })
        router.push(`/product/list?${params.toString()}`)
    }

    const productColumns: ColumnsType<Product> = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            width: 260,
            render: (_, record) => {
                const mainImage = record.images?.[0]?.url
                const variantCount = record.variants?.length || 0

                return (
                    <Space size="middle">
                        {mainImage ? (
                            <Image
                                width={40}
                                height={40}
                                alt={record.name}
                                src={mainImage || '/placeholder.png'}
                                fallback="/placeholder.png"
                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                preview={false}
                            />
                        ) : (
                            <Image
                                width={40}
                                height={40}
                                alt={record.name}
                                src="/icon/default_image.png"
                                className="text-gray-300"
                                preview={false}
                            />
                        )}

                        <div>
                            <button
                                onClick={() => router.push(`/product/${record.id}`)}
                                className="cursor-pointer"
                            >
                                <span className="text-blue-600 hover:text-blue-800 font-medium">
                                    {record.name}
                                </span>
                            </button>
                            {variantCount > 0 && (
                                <div className="text-xs text-gray-500">
                                    {variantCount} phiên bản
                                </div>
                            )}
                        </div>
                    </Space>
                )
            },
        },
        {
            title: 'Có thể bán',
            key: 'available',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const totalStock = record.variants?.reduce(
                    (acc, v) => acc + (v.inventory_quantity || 0),
                    0
                )
                return (
                    <span
                        className={
                            (totalStock ?? 0) <= 0
                                ? 'text-red-500 font-medium'
                                : 'text-gray-900'
                        }
                    >
                        {totalStock?.toLocaleString('vi-VN') || 0}
                    </span>
                )
            },
        },
        {
            title: 'Loại',
            dataIndex: 'product_type',
            key: 'product_type',
            width: 150,
            render: (text) => text || '-',
        },
        {
            title: 'Nhãn hiệu',
            dataIndex: 'vendor',
            key: 'vendor',
            width: 150,
            render: (text) => text || '-',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (status) => {
                const statusConfig = {
                    active: { color: 'green', text: 'Đang bán' },
                    inactive: { color: 'red', text: 'Ngừng bán' },
                } as const
                const config =
                    statusConfig[status as keyof typeof statusConfig] || {
                        color: 'default',
                        text: status,
                    }
                return <Tag color={config.color}>{config.text}</Tag>
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            align: 'center',
            render: (date) => {
                if (!date) return '-'
                const formatted = dayjs(date).format('DD/MM/YYYY')
                const fullDate = dayjs(date).format('DD/MM/YYYY HH:mm:ss')
                return (
                    <Tooltip title={fullDate}>
                        <span className="cursor-help">{formatted}</span>
                    </Tooltip>
                )
            },
        },
    ]

    return (
        <>
            {loading ? null : (
                <div className="min-h-screen bg-gray-50">
                    {/* Header */}
                    <div className={`bg-white h-[65px] z-100 fixed top-0 left-0 w-full flex flex-col justify-center ${collapsed ? '!w-[calc(100%-80px)] left-20' : '!w-[calc(100%-256px)] left-64'} transition-all max-sm:!w-full max-sm:left-0`}>
                        <div className="bg-white h-full flex items-center justify-between shadow-lg w-full px-5">
                            <div className="flex gap-1 items-center">
                                <Button
                                    className='!border !border-gray-200'
                                    type="text"
                                    icon={<ArrowLeft size={20} />}
                                    onClick={onBack}
                                />
                            </div>
                            <Space>
                                {editMode && (
                                    <Button danger onClick={onDelete}>
                                        Xoá
                                    </Button>
                                )}
                                {editMode ? (
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={form.submit}
                                        disabled={!isChanged}
                                    >
                                        Lưu
                                    </Button>
                                ) : (
                                    <Button type="primary" size="large" onClick={form.submit}>
                                        Thêm danh mục
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-[1400px] mx-auto p-6">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            onValuesChange={() => editMode && setIsChanged(checkChanged())}
                        >
                            <Row gutter={24}>
                                {/* Left Column */}
                                <Col xs={24} lg={16}>
                                    <Card className="!mb-2">
                                        <h2 className="text-lg font-semibold mb-4">Thông tin danh mục</h2>
                                        <Form.Item
                                            label="Tên danh mục"
                                            name="name"
                                            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                                        >
                                            <Input placeholder="Nhập tên danh mục (tối đa 320 ký tự)" maxLength={320} />
                                        </Form.Item>

                                        <Form.Item label="Mô tả">
                                            <TinyEditor value={content} onChange={(val) => {
                                                setContent(val)
                                                if (editMode) setIsChanged(checkChanged())
                                            }} />
                                        </Form.Item>
                                    </Card>

                                    {/* SEO */}
                                    <Card className="!mb-2">
                                        <div className="flex items-start justify-between">
                                            <h2 className="text-lg font-semibold mb-4">Tối ưu SEO</h2>
                                            {!openSeo && (
                                                <Button type="link" className="px-0 mt-2" onClick={() => setOpenSeo(true)}>
                                                    Chỉnh sửa SEO
                                                </Button>
                                            )}
                                        </div>

                                        {openSeo && (
                                            <>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    Nhập Tiêu đề và Mô tả để xem trước kết quả tìm kiếm.
                                                </p>
                                                <Form.Item
                                                    label={<span>Tiêu đề trang</span>}
                                                    name="meta_title"
                                                >
                                                    <Input />
                                                </Form.Item>
                                                <Form.Item
                                                    label={<span>Thẻ mô tả</span>}
                                                    name="meta_description"
                                                >
                                                    <TextArea rows={3} />
                                                </Form.Item>
                                            </>
                                        )}
                                    </Card>
                                </Col>

                                {/* Right Column */}
                                <Col xs={24} lg={8}>
                                    <Card className="!mb-2">
                                        <div className="flex items-start justify-between mb-4">
                                            <h2 className="text-lg font-semibold">Ảnh danh mục</h2>
                                        </div>
                                        <Upload.Dragger
                                            multiple={false}
                                            maxCount={1}
                                            listType="picture-card"
                                            fileList={fileList}
                                            customRequest={handleUpload}
                                            onRemove={handleRemove}
                                            accept="image/*"
                                            className="py-3"
                                        >
                                            <div className="text-center !mb-2">
                                                <UploadIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm">Kéo thả hoặc chọn file</p>
                                            </div>
                                        </Upload.Dragger>
                                    </Card>
                                </Col>
                            </Row>
                            {editMode && collection && (
                                <Row gutter={24} className="mt-4">
                                    <Col span={24}>
                                        <Card className="!mb-2">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-semibold">
                                                    Sản phẩm trong danh mục
                                                </h2>
                                                {collection.products_count &&
                                                    collection.products_count > 10 && (
                                                        <Button
                                                            type="link"
                                                            onClick={handleViewAllProducts}
                                                        >
                                                            Xem tất cả (
                                                            {collection.products_count} sản phẩm)
                                                        </Button>
                                                    )}
                                            </div>
                                            <Table<Product>
                                                dataSource={collectionProducts.slice(0, 10)}
                                                loading={loadingProducts}
                                                rowKey="id"
                                                pagination={false}
                                                scroll={{ x: 'max-content' }}
                                                columns={productColumns}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            )}
                        </Form>
                    </div>
                </div>
            )}
            <Modal
                title="Xác nhận xoá danh mục"
                open={openDeleteModal}
                onOk={handleConfirmDelete}
                onCancel={() => setOpenDeleteModal(false)}
                okText="Xoá"
                okType="danger"
                cancelText="Huỷ"
            >
                <p>Bạn có chắc chắn muốn xoá danh mục này? Hành động này không thể hoàn tác.</p>
            </Modal>
        </>
    )
}

export default CreateCollectionView
