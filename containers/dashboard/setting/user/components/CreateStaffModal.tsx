'use client'

import React, { useEffect } from 'react'
import { Form, Input, Modal, Switch } from 'antd'
import { CreateStaffRequest, UpdateStaffRequest } from '@/types/request/user'

type FormValues = CreateStaffRequest & Partial<UpdateStaffRequest>

type Props = {
    open: boolean
    loading: boolean
    mode: 'create' | 'edit'
    initialValues?: Partial<FormValues>
    onCancel: () => void
    onSubmit: (values: FormValues) => Promise<void> | void
}

const StaffFormModal: React.FC<Props> = ({ open, loading, mode, initialValues, onCancel, onSubmit }) => {
    const [form] = Form.useForm<FormValues>()

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ active: true, ...initialValues })
        } else {
            form.resetFields()
        }
    }, [open, form, initialValues])

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            await onSubmit(values)
            form.resetFields()
        } catch {
            // validation handled by form
        }
    }

    const title = mode === 'create' ? 'Thêm mới nhân viên' : 'Cập nhật nhân viên'

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okButtonProps={{ loading }}
            destroyOnClose
        >
            <Form form={form} layout="vertical" initialValues={{ active: true }}>
                <Form.Item
                    label="Họ"
                    name="first_name"
                    rules={[{ required: true, message: 'Vui lòng nhập họ nhân viên' }]}
                >
                    <Input placeholder="Nhập họ" />
                </Form.Item>
                <Form.Item label="Tên" name="last_name">
                    <Input placeholder="Nhập tên" />
                </Form.Item>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>
                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={
                        mode === 'create'
                            ? [{ required: true, message: 'Vui lòng nhập mật khẩu' }]
                            : []
                    }
                >
                    <Input.Password placeholder={mode === 'create' ? 'Nhập mật khẩu' : 'Để trống nếu không đổi'} />
                </Form.Item>
                <Form.Item label="Trạng thái" name="active" valuePropName="checked">
                    <Switch checkedChildren="Kích hoạt" unCheckedChildren="Tạm tắt" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default StaffFormModal

