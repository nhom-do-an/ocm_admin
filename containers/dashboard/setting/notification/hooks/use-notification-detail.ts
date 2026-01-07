'use client'

import { useState, useEffect } from 'react'
import { NotificationTemplate } from '@/types/response/notification'
import notificationService from '@/services/notification'
import { message } from 'antd'

const useNotificationDetail = (templateId: number) => {
    const [template, setTemplate] = useState<NotificationTemplate | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchTemplate = async () => {
        try {
            setLoading(true)
            const data = await notificationService.getTemplateById(templateId)
            setTemplate(data)
        } catch (error) {
            console.error('Failed to fetch notification template:', error)
            message.error('Không thể tải thông tin mẫu thông báo')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (templateId) {
            fetchTemplate()
        }
    }, [templateId])

    const updateTemplate = async (updatedData: Partial<NotificationTemplate>) => {
        if (!template) return

        try {
            setSaving(true)
            await notificationService.updateTemplate({
                id: template.id,
                ...updatedData,
            })
            message.success('Cập nhật mẫu thông báo thành công')
            await fetchTemplate() // Refresh data
        } catch (error) {
            console.error('Failed to update template:', error)
            message.error('Không thể cập nhật mẫu thông báo')
            throw error
        } finally {
            setSaving(false)
        }
    }

    return {
        template,
        loading,
        saving,
        updateTemplate,
        refreshTemplate: fetchTemplate,
    }
}

export default useNotificationDetail
