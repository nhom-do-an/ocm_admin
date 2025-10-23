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
} from 'antd'
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react'
import TinyEditor from '@/components/TinyEditor'
import { Attachment, Collection } from '@/types/response/collection'
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
    const { collection, loading, editMode, createCollection } = useCreateCollection()
    const { collapsed } = useGlobalContext()
    const [form] = Form.useForm<FormValues>()
    const [content, setContent] = useState('')
    const [images, setImages] = useState<Attachment[]>([])
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [openSeo, setOpenSeo] = useState<boolean>(false)
    const [isChanged, setIsChanged] = useState<boolean>(false)

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
        console.log("data::", collectionData)
        await createCollection(collectionData)
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
                    <div className="max-w-[1400px] mx-auto p-6 mt-[80px]">
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
                                            disabled={fileList.length >= 1}
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
                        </Form>
                    </div>
                </div>
            )}
        </>
    )
}

export default CreateCollectionView
