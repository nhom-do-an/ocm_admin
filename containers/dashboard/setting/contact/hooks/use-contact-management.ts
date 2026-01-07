'use client'

import { useCallback, useEffect, useState } from 'react'
import contactService from '@/services/contact'
import { Contact } from '@/types/response/contact'
import { CreateContactRequest, UpdateContactRequest } from '@/types/request/contact'
import { useGlobalNotification } from '@/hooks/useNotification'

const useContactManagement = () => {
    const notification = useGlobalNotification()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchContacts = useCallback(async () => {
        setLoading(true)
        try {
            const response = await contactService.getListContacts()
            setContacts(response.contacts || [])
        } catch (error) {
            console.error('Failed to fetch contacts', error)
            notification.error({ message: 'Không thể tải danh sách thông tin liên hệ' })
        } finally {
            setLoading(false)
        }
    }, [notification])

    useEffect(() => {
        let mounted = true
        if (mounted) {
            fetchContacts()
        }
        return () => {
            mounted = false
        }
    }, [])

    const createContact = useCallback(
        async (payload: CreateContactRequest) => {
            setCreateLoading(true)
            try {
                await contactService.createContact(payload)
                notification.success({ message: 'Tạo thông tin liên hệ thành công' })
                await fetchContacts()
            } catch (error) {
                console.error('Failed to create contact', error)
                notification.error({ message: 'Không thể tạo thông tin liên hệ' })
                throw error
            } finally {
                setCreateLoading(false)
            }
        },
        [fetchContacts, notification],
    )

    const updateContact = useCallback(
        async (id: number, payload: UpdateContactRequest) => {
            setUpdateLoading(true)
            try {
                await contactService.updateContact(id, { ...payload, id })
                notification.success({ message: 'Cập nhật thông tin liên hệ thành công' })
                await fetchContacts()
            } catch (error) {
                console.error('Failed to update contact', error)
                notification.error({ message: 'Không thể cập nhật thông tin liên hệ' })
                throw error
            } finally {
                setUpdateLoading(false)
            }
        },
        [fetchContacts, notification],
    )

    const deleteContact = useCallback(
        async (id: number) => {
            setDeleteLoading(true)
            try {
                await contactService.deleteContact(id)
                notification.success({ message: 'Xóa thông tin liên hệ thành công' })
                await fetchContacts()
            } catch (error) {
                console.error('Failed to delete contact', error)
                notification.error({ message: 'Không thể xóa thông tin liên hệ' })
                throw error
            } finally {
                setDeleteLoading(false)
            }
        },
        [fetchContacts, notification],
    )

    return {
        contacts,
        loading,
        createLoading,
        updateLoading,
        deleteLoading,
        fetchContacts,
        createContact,
        updateContact,
        deleteContact,
    }
}

export default useContactManagement
