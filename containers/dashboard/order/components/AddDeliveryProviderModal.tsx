'use client'

import React, { useState } from 'react'
import { Modal, Form, Input, Radio, Button } from 'antd'
import { CreateDeliveryProviderRequest } from '@/types/request/delivery-provider'
import { DeliveryProviderType, DeliveryProviderStatus, EFreightPayerType } from '@/types/enums/enum'

interface AddDeliveryProviderModalProps {
    open: boolean
    onCancel: () => void
    onSave: (data: CreateDeliveryProviderRequest) => Promise<void>
}

const AddDeliveryProviderModal: React.FC<AddDeliveryProviderModalProps> = ({
    open,
    onCancel,
    onSave,
}) => {
    const [form] = Form.useForm<CreateDeliveryProviderRequest & { freight_payer: EFreightPayerType }>()
    const [loading, setLoading] = useState(false)

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
                type: DeliveryProviderType.ExternalShipper,
                status: DeliveryProviderStatus.Active,
            })
            form.resetFields()
        } catch (error) {
            console.error('Error creating delivery provider:', error)
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
            title="Thêm mới đối tác tự liên hệ"
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
            <Form form={form} layout="vertical" className="mt-4">
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
                    label="Người trả phí"
                    name="freight_payer"
                    initialValue={EFreightPayerType.Seller}
                >
                    <Radio.Group>
                        <Radio value={EFreightPayerType.Seller}>Shop trả</Radio>
                        <Radio value={EFreightPayerType.Buyer}>Khách trả</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default AddDeliveryProviderModal









