'use client'

import { useState, useEffect } from 'react'
import { NotificationTemplate, NotificationCategory } from '@/types/response/notification'
import notificationService from '@/services/notification'
import { message } from 'antd'

const useNotificationTemplates = () => {
    const [templates, setTemplates] = useState<NotificationTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    const fetchTemplates = async () => {
        try {
            setLoading(true)
            const data = await notificationService.getTemplates()
            setTemplates(data)
        } catch (error) {
            console.error('Failed to fetch notification templates:', error)
            message.error('Không thể tải danh sách mẫu thông báo')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const updateTemplateActive = async (templateId: number, active: boolean) => {
        // Tìm template hiện tại để lấy thông tin cần thiết
        const currentTemplate = templates.find(t => t.id === templateId)
        if (!currentTemplate) {
            throw new Error('Template not found')
        }

        // Optimistic update: cập nhật state ngay lập tức
        setTemplates(prevTemplates =>
            prevTemplates.map(template =>
                template.id === templateId ? { ...template, active } : template
            )
        )

        try {
            setUpdating(true)
            // Gọi API update với id và active
            await notificationService.updateTemplate({
                id: templateId,
                active,
                name: currentTemplate.name, // Giữ nguyên name
                content: currentTemplate.content, // Giữ nguyên content
            })
        } catch (error) {
            console.error('Failed to update template:', error)
            // Revert lại state nếu API fail
            setTemplates(prevTemplates =>
                prevTemplates.map(template =>
                    template.id === templateId ? { ...template, active: currentTemplate.active } : template
                )
            )
            throw error
        } finally {
            setUpdating(false)
        }
    }

    const groupTemplatesByCategory = (templatesList: NotificationTemplate[]) => {
        const grouped: Record<string, NotificationTemplate[]> = {
            [NotificationCategory.ORDER]: [],
            [NotificationCategory.SHIPPING]: [],
            [NotificationCategory.CUSTOMER]: [],
        }

        templatesList.forEach(template => {
            if (grouped[template.category]) {
                grouped[template.category].push(template)
            }
        })

        return grouped
    }

    const getCategoryLabel = (category: NotificationCategory): string => {
        switch (category) {
            case NotificationCategory.ORDER:
                return 'Đơn hàng'
            case NotificationCategory.SHIPPING:
                return 'Vận đơn'
            case NotificationCategory.CUSTOMER:
                return 'Khách hàng'
            default:
                return category
        }
    }

    return {
        templates,
        loading,
        updating,
        updateTemplateActive,
        groupTemplatesByCategory,
        getCategoryLabel,
        refreshTemplates: fetchTemplates,
    }
}

export default useNotificationTemplates

