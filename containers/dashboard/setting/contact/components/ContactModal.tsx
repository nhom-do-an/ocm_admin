'use client'

import React, { useEffect } from 'react'
import { Modal, Form, Input, Switch, Select } from 'antd'
import { Contact, ContactType } from '@/types/response/contact'
import { CreateContactRequest, UpdateContactRequest } from '@/types/request/contact'

interface ContactModalProps {
    open: boolean
    loading: boolean
    contact: Contact | null
    existingTypes: ContactType[]
    onCancel: () => void
    onSubmit: (values: CreateContactRequest | UpdateContactRequest) => Promise<void>
}

const contactTypeOptions = [
    { value: 'phone', label: 'Số điện thoại' },
    { value: 'zalo', label: 'Zalo' },
    { value: 'facebook', label: 'Facebook' },
]

const ContactModal: React.FC<ContactModalProps> = ({ open, loading, contact, existingTypes, onCancel, onSubmit }) => {
    const [form] = Form.useForm()

    const availableTypes = contactTypeOptions.filter(
        opt => !existingTypes.includes(opt.value as ContactType) || (contact && contact.type === opt.value)
    )

    useEffect(() => {
        if (open) {
            if (contact) {
                form.setFieldsValue({
                    type: contact.type,
                    value: contact.value,
                    link: contact.link,
                    is_active: contact.is_active,
                })
            } else {
                form.resetFields()
                form.setFieldsValue({ is_active: true })
            }
        }
    }, [open, contact, form])

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            if (contact) {
                await onSubmit({ ...values, id: contact.id } as UpdateContactRequest)
            } else {
                await onSubmit(values as CreateContactRequest)
            }
        } catch (error) {
            console.error('Validation failed', error)
        }
    }

    const getPlaceholder = (type: ContactType | undefined) => {
        switch (type) {
            case 'phone':
                return '0912345678'
            case 'zalo':
                return '0912345678'
            case 'facebook':
                return 'facebook.com/yourpage'
            default:
                return 'Nhập giá trị'
        }
    }

    const getLinkPlaceholder = (type: ContactType | undefined) => {
        switch (type) {
            case 'phone':
                return 'tel:0912345678'
            case 'zalo':
                return 'https://zalo.me/0912345678'
            case 'facebook':
                return 'https://facebook.com/yourpage'
            default:
                return 'Nhập đường dẫn'
        }
    }

    const selectedType = Form.useWatch('type', form)

    return (
        <Modal
            title={contact ? 'Chỉnh sửa thông tin liên hệ' : 'Thêm thông tin liên hệ'}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={contact ? 'Cập nhật' : 'Thêm mới'}
            cancelText="Hủy"
            width={500}
        >
            <Form form={form} layout="vertical" className="mt-4">
                <Form.Item
                    label="Loại liên hệ"
                    name="type"
                    rules={[{ required: true, message: 'Vui lòng chọn loại liên hệ' }]}
                >
                    <Select
                        placeholder="Chọn loại liên hệ"
                        options={availableTypes}
                        disabled={!!contact}
                    />
                </Form.Item>

                <Form.Item
                    label="Giá trị"
                    name="value"
                    rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                >
                    <Input placeholder={getPlaceholder(selectedType)} />
                </Form.Item>

                <Form.Item
                    label="Đường dẫn"
                    name="link"
                >
                    <Input placeholder={getLinkPlaceholder(selectedType)} />
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

export default ContactModal
