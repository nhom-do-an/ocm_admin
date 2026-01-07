'use client'

import React, { useEffect, useState } from 'react'
import { Button, Card, Input, Form, Collapse } from 'antd'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Eye, ChevronDown } from 'lucide-react'
import useNotificationDetail from './hooks/use-notification-detail'
import Loader from '@/components/Loader'

const { TextArea } = Input
const { Panel } = Collapse

const NotificationEditView: React.FC = () => {
    const router = useRouter()
    const params = useParams()
    const templateId = params?.id ? Number(params.id) : 0

    const { template, loading, saving, updateTemplate } = useNotificationDetail(templateId)
    const [form] = Form.useForm()

    useEffect(() => {
        if (template) {
            form.setFieldsValue({
                subject: template.subject,
                content: template.content,
            })
        }
    }, [template, form])

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            await updateTemplate({
                subject: values.subject,
                content: values.content,
            })
            router.push(`/admin/settings/notification/${templateId}`)
        } catch (error) {
            // Error handled in hook or form validation
        }
    }

    const handleCancel = () => {
        router.push(`/admin/settings/notification/${templateId}`)
    }

    const handlePreview = () => {
        router.push(`/admin/settings/notification/${templateId}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 h-full">
                <Loader />
            </div>
        )
    }

    if (!template) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <p className="text-gray-500">Không tìm thấy mẫu thông báo</p>
                    <Button onClick={() => router.push('/admin/settings/notification')} className="mt-4">
                        Quay lại
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen ">
            {/* Header */}
            <div className=" px-6 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={<ArrowLeft size={20} />}
                            onClick={handleCancel}
                            className="flex items-center bg-white! rounded! border! border-gray-100!"
                        />
                        <div className="flex flex-col">
                            <span className="text-xl font-semibold text-gray-900">Sửa {template.name}</span>
                            {template.description && (
                                <span className="text-sm text-gray-500">{template.description}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            icon={<Eye size={16} />}
                            onClick={handlePreview}
                        >
                            Xem
                        </Button>
                        <Button onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button type="primary" onClick={handleSave} loading={saving}>
                            Lưu
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[900px] mx-auto p-6">
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Tuy chỉnh nội dung email</h2>

                    {/* Collapsible Info */}
                    <Collapse
                        className="mb-6"
                        bordered={false}
                        expandIcon={({ isActive }) => <ChevronDown size={16} className={`transition-transform ${isActive ? 'rotate-180' : ''}`} />}
                    >
                        <Panel
                            header={<span className="text-blue-600">Biến Liquid để đổi mẫu chủ đạo và hình ảnh logo trong mẫu email</span>}
                            key="1"
                            className="bg-blue-50"
                        >
                            <div className="space-y-2 text-sm text-gray-700">
                                <p>Bạn có thể sử dụng các biến Liquid sau trong nội dung email:</p>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div>
                                        <code className="bg-white px-2 py-1 rounded text-xs">{'{{.Store.Name}}'}</code> - Tên cửa hàng
                                    </div>
                                    <div>
                                        <code className="bg-white px-2 py-1 rounded text-xs">{'{{.Store.Email}}'}</code> - Email cửa hàng
                                    </div>
                                    <div>
                                        <code className="bg-white px-2 py-1 rounded text-xs">{'{{.OrderName}}'}</code> - Tên đơn hàng
                                    </div>
                                    <div>
                                        <code className="bg-white px-2 py-1 rounded text-xs">{'{{.Customer.Name}}'}</code> - Tên khách hàng
                                    </div>
                                    <div>
                                        <code className="bg-white px-2 py-1 rounded text-xs">{'{{.TotalPrice}}'}</code> - Tổng tiền
                                    </div>
                                    <div>
                                        <code className="bg-white px-2 py-1 rounded text-xs">{'{{.ShippingAddress}}'}</code> - Địa chỉ giao hàng
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </Collapse>

                    <Form form={form} layout="vertical">
                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </span>
                            }
                            name="subject"
                            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề email' }]}
                        >
                            <Input
                                placeholder="Nhập tiêu đề email"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="text-sm font-medium text-gray-700">
                                    Nội dung <span className="text-red-500">*</span>
                                </span>
                            }
                            name="content"
                            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                        >
                            <TextArea
                                rows={20}
                                placeholder="Nhập nội dung email"
                                className="font-mono text-sm"
                            />
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    )
}

export default NotificationEditView
