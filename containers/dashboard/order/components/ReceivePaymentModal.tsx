'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Form, Select, InputNumber, Button } from 'antd'
import paymentService from '@/services/payment-method'
import orderService from '@/services/order'
import { PaymentMethod } from '@/types/response/payment-method'
import { ETransactionStatus } from '@/types/enums/enum'
import { useGlobalNotification } from '@/hooks/useNotification'

interface ReceivePaymentModalProps {
    open: boolean
    onCancel: () => void
    onSuccess: () => void
    orderId: number
    amount: number
}

const ReceivePaymentModal: React.FC<ReceivePaymentModalProps> = ({
    open,
    onCancel,
    onSuccess,
    orderId,
    amount,
}) => {
    const [form] = Form.useForm()
    const notification = useGlobalNotification()
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (open) {
            fetchPaymentMethods()
            form.setFieldsValue({
                amount: amount,
            })
        }
    }, [open, amount, form])

    const fetchPaymentMethods = async () => {
        setLoading(true)
        try {
            const data = await paymentService.getListPaymentMethods({})
            setPaymentMethods(data || [])
        } catch (error) {
            console.error('Error fetching payment methods:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (values: {
        payment_method_id: number
        amount: number
        reference?: string
    }) => {
        setSubmitting(true)
        try {
            await orderService.createOrderPayments(orderId, {
                transactions: [
                    {
                        amount: values.amount,
                        payment_method_id: values.payment_method_id,
                        status: ETransactionStatus.Success,
                    },
                ],
            })
            form.resetFields()
            notification.success({ message: 'Nhận tiền thành công' })
            onSuccess()
            onCancel()
        } catch (error) {
            console.error('Error creating payment:', error)
            notification.error({ message: 'Nhận tiền thất bại. Vui lòng thử lại.' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            title="Nhận tiền"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="mt-4"
            >
                <Form.Item
                    name="payment_method_id"
                    label="Phương thức thanh toán"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
                >
                    <Select
                        placeholder="Chọn phương thức thanh toán"
                        loading={loading}
                        options={paymentMethods.map(method => ({
                            label: method.name,
                            value: method.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="amount"
                    label="Số tiền nhận"
                    rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                >
                    <InputNumber
                        min={0}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => {
                            const numeric = value?.replace(/\$\s?|(,*)/g, '')
                            return numeric ? Number(numeric) : 0
                        }}
                        className="w-full"
                        addonAfter="₫"
                    />
                </Form.Item>

                <Form.Item className="mb-0 mt-6">
                    <div className="flex justify-end gap-3">
                        <Button onClick={onCancel}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            Nhận tiền
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ReceivePaymentModal

