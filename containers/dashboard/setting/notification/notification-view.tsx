'use client'

import React from 'react'
import { Card, Switch } from 'antd'
import { useRouter } from 'next/navigation'
import useNotificationTemplates from './hooks/use-notification-templates'
import { NotificationTemplate, NotificationCategory } from '@/types/response/notification'
import Loader from '@/components/Loader'
import Link from 'next/link'

const NotificationView: React.FC = () => {
    const { templates, loading, updating, updateTemplateActive, groupTemplatesByCategory, getCategoryLabel } = useNotificationTemplates()
    const router = useRouter()

    const handleActiveChange = async (template: NotificationTemplate, checked: boolean) => {
        try {
            await updateTemplateActive(template.id, checked)
        } catch (error) {
            // Error already handled in hook
        }
    }

    const handleTemplateClick = (templateId: number) => {
        router.push(`/notification/${templateId}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader />
            </div>
        )
    }

    const groupedTemplates = groupTemplatesByCategory(templates)
    const categoryOrder = [NotificationCategory.ORDER, NotificationCategory.SHIPPING, NotificationCategory.CUSTOMER]

    return (
        <div className="max-w-[1000px] mx-auto px-5 pb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Thông báo</h1>
                <p className="text-sm text-gray-500">Quản lý mẫu thông báo và in</p>
            </div>

            <Card>
                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        Những email này được gửi tự động tới bạn hoặc khách hàng. Click vào tên mẫu email để chỉnh sửa.
                    </p>
                </div>

                {categoryOrder.map(category => {
                    const categoryTemplates = groupedTemplates[category]
                    if (categoryTemplates.length === 0) return null

                    return (
                        <div key={category} className="mb-8 last:mb-0">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">{getCategoryLabel(category)}</h2>
                            <div className="space-y-1!">
                                {categoryTemplates.map(template => (
                                    <Card
                                        key={template.id}
                                        className="hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 flex flex-col">
                                                <Link
                                                    href={`/admin/notification/${template.id}`}
                                                    className="text-blue-400 hover:text-blue-800 font-semibold cursor-pointer"
                                                >
                                                    {template.name}
                                                </Link>

                                                {template.description && (
                                                    <span className="text-sm text-gray-600">{template.description}</span>
                                                )}
                                            </div>
                                            <div className="ml-4 shrink-0">
                                                <Switch
                                                    checked={template.active}
                                                    onChange={(checked) => handleActiveChange(template, checked)}
                                                    disabled={!template.can_edit_active || updating}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </Card>
        </div>
    )
}

export default NotificationView

