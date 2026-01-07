'use client'

import React, { useState } from 'react'
import { Button, Card, Empty, Skeleton, Tag, Popconfirm } from 'antd'
import { Phone, Plus, Trash2, Edit2, MessageCircle } from 'lucide-react'
import useContactManagement from './hooks/use-contact-management'
import Loader from '@/components/Loader'
import ContactModal from './components/ContactModal'
import { CreateContactRequest, UpdateContactRequest } from '@/types/request/contact'
import { Contact, ContactType } from '@/types/response/contact'

const contactTypeLabels: Record<ContactType, string> = {
    phone: 'Số điện thoại',
    zalo: 'Zalo',
    facebook: 'Facebook',
}

const contactTypeColors: Record<ContactType, string> = {
    phone: 'blue',
    zalo: 'cyan',
    facebook: 'geekblue',
}

const ContactIcon: React.FC<{ type: ContactType }> = ({ type }) => {
    switch (type) {
        case 'phone':
            return <Phone className="w-5 h-5" />
        case 'zalo':
            return <MessageCircle className="w-5 h-5" />
        case 'facebook':
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            )
        default:
            return <Phone className="w-5 h-5" />
    }
}

const ContactManagementView: React.FC = () => {
    const { contacts, loading, createLoading, updateLoading, deleteLoading, createContact, updateContact, deleteContact } = useContactManagement()
    const [isModalOpen, setModalOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

    const existingTypes = contacts.map(c => c.type)

    const handleContactClick = (contact: Contact) => {
        setSelectedContact(contact)
        setModalOpen(true)
    }

    const handleSubmit = async (values: CreateContactRequest | UpdateContactRequest) => {
        if ('id' in values && values.id) {
            await updateContact(values.id, values)
        } else {
            await createContact(values as CreateContactRequest)
        }
        setModalOpen(false)
        setSelectedContact(null)
    }

    const handleDelete = async (id: number) => {
        await deleteContact(id)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader />
            </div>
        )
    }

    return (
        <div className="max-w-[1000px] mx-auto px-5 pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý thông tin liên hệ</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý các thông tin liên hệ hiển thị trên trang web</p>
            </div>

            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                    <div>
                        <p className="text-base font-semibold text-gray-900">Danh sách liên hệ</p>
                        <p className="text-sm text-gray-500">Thêm số điện thoại, Zalo, Facebook để khách hàng liên hệ</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        disabled={existingTypes.length >= 3}
                        onClick={() => {
                            setSelectedContact(null)
                            setModalOpen(true)
                        }}
                    >
                        Thêm liên hệ
                    </Button>
                </div>
                <div>
                    {loading ? (
                        <div className="py-10">
                            <Skeleton active />
                        </div>
                    ) : contacts.length > 0 ? (
                        <div className="space-y-3">
                            {contacts.map(contact => (
                                <div
                                    key={contact.id}
                                    className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${contactTypeColors[contact.type]}-50 text-${contactTypeColors[contact.type]}-600`}>
                                            <ContactIcon type={contact.type} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Tag color={contactTypeColors[contact.type]}>
                                                    {contactTypeLabels[contact.type]}
                                                </Tag>
                                                <Tag color={contact.is_active ? 'success' : 'default'}>
                                                    {contact.is_active ? 'Hiển thị' : 'Ẩn'}
                                                </Tag>
                                            </div>
                                            <p className="font-medium text-gray-900">{contact.value}</p>
                                            {contact.link && (
                                                <p className="text-xs text-gray-400 truncate">
                                                    {contact.link}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            size="small"
                                            icon={<Edit2 size={14} />}
                                            onClick={() => handleContactClick(contact)}
                                        >
                                            Sửa
                                        </Button>
                                        <Popconfirm
                                            title="Xóa thông tin liên hệ"
                                            description="Bạn có chắc chắn muốn xóa thông tin liên hệ này?"
                                            onConfirm={() => handleDelete(contact.id)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true, loading: deleteLoading }}
                                        >
                                            <Button
                                                size="small"
                                                danger
                                                icon={<Trash2 size={14} />}
                                            >
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Chưa có thông tin liên hệ nào" className="py-10" />
                    )}
                </div>
            </Card>

            <ContactModal
                open={isModalOpen}
                loading={createLoading || updateLoading}
                contact={selectedContact}
                existingTypes={existingTypes}
                onCancel={() => {
                    setModalOpen(false)
                    setSelectedContact(null)
                }}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default ContactManagementView
