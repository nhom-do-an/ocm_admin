'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Switch, Upload, Image as AntImage, UploadFile } from 'antd'
import type { UploadRequestOption } from 'rc-upload/lib/interface'
import { Upload as UploadIcon, X } from 'lucide-react'
import { Banner } from '@/types/response/banner'
import { CreateBannerRequest, UpdateBannerRequest } from '@/types/request/banner'
import attachmentService from '@/services/attachment'
import { useGlobalNotification } from '@/hooks/useNotification'
import { Attachment } from '@/types/response/collection'

interface BannerModalProps {
    open: boolean
    loading: boolean
    banner: Banner | null
    onCancel: () => void
    onSubmit: (values: CreateBannerRequest | UpdateBannerRequest) => Promise<void>
}

const BannerModal: React.FC<BannerModalProps> = ({ open, loading, banner, onCancel, onSubmit }) => {
    const [form] = Form.useForm()
    const notification = useGlobalNotification()
    const [imageUrl, setImageUrl] = useState<string>('')
    const [fileList, setFileList] = useState<UploadFile[]>([])

    useEffect(() => {
        if (open) {
            if (banner) {
                form.setFieldsValue({
                    image_url: banner.image_url,
                    redirect_url: banner.redirect_url,
                    description: banner.description,
                    position: banner.position,
                    is_active: banner.is_active,
                })
                setImageUrl(banner.image_url)
                if (banner.image_url) {
                    setFileList([{
                        uid: '-1',
                        name: 'banner-image',
                        status: 'done',
                        url: banner.image_url,
                    }])
                }
            } else {
                form.resetFields()
                form.setFieldsValue({ is_active: true, position: 0 })
                setImageUrl('')
                setFileList([])
            }
        }
    }, [open, banner, form])

    const handleUpload = async (options: UploadRequestOption) => {
        const { file, onSuccess, onError } = options
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', 'banner')

            const uploaded = await attachmentService.uploadAttachment(formData)
            const uploadedFile: Attachment = Array.isArray(uploaded) ? uploaded[0] : uploaded

            setImageUrl(uploadedFile.url)
            form.setFieldsValue({ image_url: uploadedFile.url })
            setFileList([{
                uid: String(Date.now()),
                name: uploadedFile.filename,
                status: 'done',
                url: uploadedFile.url,
            }])
            onSuccess?.(uploadedFile)
        } catch (err) {
            notification.error({ message: 'Upload file thất bại' })
            onError?.(err as Error)
        }
    }

    const handleRemove = () => {
        setFileList([])
        setImageUrl('')
        form.setFieldsValue({ image_url: '' })
    }

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            if (banner) {
                await onSubmit({ ...values, id: banner.id } as UpdateBannerRequest)
            } else {
                await onSubmit(values as CreateBannerRequest)
            }
        } catch (error) {
            console.error('Validation failed', error)
        }
    }

    return (
        <Modal
            title={banner ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={banner ? 'Cập nhật' : 'Thêm mới'}
            okButtonProps={{ disabled: !imageUrl }}
            cancelText="Hủy"
            width={600}
            destroyOnClose
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    label="Hình ảnh banner"
                    name="image_url"
                    rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh banner' }]}
                >
                    <div>
                        {imageUrl ? (
                            <div className="relative w-full mb-3">
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                    <AntImage
                                        src={imageUrl}
                                        alt="Banner preview"
                                        width="100%"
                                        height={192}
                                        style={{ objectFit: 'cover' }}
                                        preview={{
                                            mask: 'Xem ảnh'
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <X size={16} className="text-gray-600" />
                                </button>
                            </div>
                        ) : (
                            <Upload.Dragger
                                multiple={false}
                                maxCount={1}
                                fileList={fileList}
                                customRequest={handleUpload}
                                onRemove={handleRemove}
                                accept="image/*"
                                showUploadList={false}
                                className="py-3"
                            >
                                <div className="text-center py-4">
                                    <UploadIcon size={40} className="mx-auto text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-600 mb-1">Kéo thả hoặc click để chọn file</p>
                                    <p className="text-xs text-gray-400">Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)</p>
                                </div>
                            </Upload.Dragger>
                        )}
                    </div>
                </Form.Item>

                <Form.Item
                    label="Đường dẫn khi click"
                    name="redirect_url"
                >
                    <Input placeholder="https://example.com/product" />
                </Form.Item>

                <Form.Item
                    label="Mô tả"
                    name="description"
                >
                    <Input.TextArea rows={3} placeholder="Mô tả về banner" />
                </Form.Item>

                <Form.Item
                    label="Vị trí hiển thị"
                    name="position"
                >
                    <InputNumber min={0} max={10} className="w-full" />
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="is_active"
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default BannerModal
