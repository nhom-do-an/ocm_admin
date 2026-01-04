'use client'

import React, { useEffect } from 'react'
import { Modal, Form, InputNumber, Input, Button } from 'antd'
import { ShippingLineType } from '@/types/enums/enum'

interface EditShippingFeeModalProps {
    open: boolean
    onCancel: () => void
    onSave: (data: { title: string; price: number; type: ShippingLineType } | null) => void
    initialData?: {
        id?: number
        title?: string
        price?: number
        type?: ShippingLineType
    }
    allowDelete?: boolean
}

const EditShippingFeeModal: React.FC<EditShippingFeeModalProps> = ({
    open,
    onCancel,
    onSave,
    initialData,
    allowDelete = false,
}) => {
    const [form] = Form.useForm()

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.setFieldsValue({
                    title: initialData.title || '',
                    price: initialData.price || 0,
                })
            } else {
                form.resetFields()
            }
        }
    }, [open, initialData, form])

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onSave({
                title: values.title,
                price: values.price,
                type: ShippingLineType.Custom,
            })
            form.resetFields()
        })
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    const handleDelete = () => {
        onSave(null)
    }

    return (
        <Modal
            title={initialData ? "Chỉnh sửa phí giao hàng" : "Thêm phí giao hàng"}
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="Xác nhận"
            cancelText="Hủy"
            footer={[
                allowDelete && (
                    <Button key="delete" danger onClick={handleDelete}>
                        Xóa
                    </Button>
                ),
                <Button key="cancel" onClick={handleCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit}>
                    Xác nhận
                </Button>,
            ].filter(Boolean)}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    title: '',
                    price: 0,
                }}
            >
                <Form.Item
                    label="Hình thức giao hàng"
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập hình thức giao hàng' }]}
                >
                    <Input placeholder="Nhập hình thức" />
                </Form.Item>

                <Form.Item
                    label="Phí giao hàng"
                    name="price"
                    rules={[{ required: true, message: 'Vui lòng nhập phí giao hàng' }]}
                >
                    <InputNumber
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}

                        className="w-full"
                        addonAfter="₫"
                        placeholder="Nhập phí giao hàng"
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default EditShippingFeeModal

