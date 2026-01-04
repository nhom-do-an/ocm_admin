'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, InputNumber } from 'antd'

interface UpdateShipmentPaymentModalProps {
    open: boolean
    defaultCodAmount?: number
    defaultServiceFee?: number
    onCancel: () => void
    onSave: (data: { cod_amount: number; service_fee: number }) => Promise<void> | void
}

const UpdateShipmentPaymentModal: React.FC<UpdateShipmentPaymentModalProps> = ({
    open,
    defaultCodAmount = 0,
    defaultServiceFee = 0,
    onCancel,
    onSave,
}) => {
    const [form] = Form.useForm()
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                cod_amount: defaultCodAmount,
                service_fee: defaultServiceFee,
            })
        }
    }, [open, defaultCodAmount, defaultServiceFee, form])

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            setSaving(true)
            await onSave({
                cod_amount: values.cod_amount || 0,
                service_fee: values.service_fee || 0,
            })
        } catch (error) {
            console.error('Validation failed:', error)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal
            open={open}
            title="Sửa thông tin thanh toán"
            onCancel={onCancel}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            okButtonProps={{ loading: saving }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    cod_amount: defaultCodAmount,
                    service_fee: defaultServiceFee,
                }}
            >
                <Form.Item
                    label="Tiền thu hộ COD"
                    name="cod_amount"
                    rules={[{ required: true, message: 'Vui lòng nhập tiền thu hộ COD' }]}
                >
                    <InputNumber
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        // parser={(value) => {
                        //     const numeric = value?.replace(/\$\s?|(,*)/g, '')
                        //     return numeric ? Number(numeric) : 0
                        // }}
                        className="w-full"
                        addonAfter="₫"
                        placeholder="Nhập tiền thu hộ COD"
                    />
                </Form.Item>

                <Form.Item
                    label="Phí trả ĐTGH"
                    name="service_fee"
                    rules={[{ required: true, message: 'Vui lòng nhập phí trả ĐTGH' }]}
                >
                    <InputNumber
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        // parser={(value) => {
                        //     const numeric = value?.replace(/\$\s?|(,*)/g, '')
                        //     return numeric ? Number(numeric) : 0
                        // }}
                        className="w-full"
                        addonAfter="₫"
                        placeholder="Nhập phí trả ĐTGH"
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UpdateShipmentPaymentModal

