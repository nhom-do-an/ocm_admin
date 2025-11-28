'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, Radio, Button } from 'antd'
import { CreateDeliveryProviderRequest } from '@/types/request/delivery-provider'
import { DeliveryProviderType, DeliveryProviderStatus } from '@/types/enums/enum'

interface AddDeliveryProviderModalProps {
    open: boolean
    onCancel: () => void
    onSave: (data: CreateDeliveryProviderRequest) => Promise<void>
    initialValues?: Partial<CreateDeliveryProviderRequest>
}

const AddDeliveryProviderModal: React.FC<AddDeliveryProviderModalProps> = ({
    open,
    onCancel,
    onSave,
    initialValues,
}) => {
    const [form] = Form.useForm<CreateDeliveryProviderRequest>()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                name: initialValues?.name || '',
                phone: initialValues?.phone || '',
                email: initialValues?.email || '',
                address: initialValues?.address || '',
                note: initialValues?.note || '',
                status: initialValues?.status || DeliveryProviderStatus.Active,
            })
        } else {
            form.resetFields()
        }
    }, [open, form, initialValues])

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            setLoading(true)
            await onSave({
                name: values.name,
                phone: values.phone || '',
                email: values.email || '',
                address: values.address || '',
                note: values.note || '',
                type: values.type || DeliveryProviderType.ExternalShipper,
                status: values.status || DeliveryProviderStatus.Active,
            })
            form.resetFields()
        } catch (error) {
            console.error('Error saving delivery provider:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    return (
        <Modal
            title={initialValues ? 'Cập nhật đối tác tự liên hệ' : 'Thêm mới đối tác tự liên hệ'}
            open={open}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Hủy
                </Button>,
                <Button key="save" type="primary" loading={loading} onClick={handleSubmit}>
                    Lưu
                </Button>,
            ]}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
                initialValues={{
                    status: DeliveryProviderStatus.Active,
                    type: DeliveryProviderType.ExternalShipper,
                }}
            >
                <Form.Item
                    label="Tên đối tác"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đối tác' }]}
                >
                    <Input placeholder="Nhập tên đối tác" />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item
                    label="Địa chỉ"
                    name="address"
                >
                    <Input placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Form.Item
                    label="Ghi chú"
                    name="note"
                >
                    <Input placeholder="Nhập ghi chú" />
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="status"
                >
                    <Radio.Group>
                        <Radio value={DeliveryProviderStatus.Active}>Đang hoạt động</Radio>
                        <Radio value={DeliveryProviderStatus.Inactive}>Ngưng hoạt động</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AddDeliveryProviderModal
