'use client'

import React from 'react'
import { Button, Card, Switch } from 'antd'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Eye } from 'lucide-react'
import useNotificationDetail from './hooks/use-notification-detail'
import Loader from '@/components/Loader'

const NotificationDetailView: React.FC = () => {
    const router = useRouter()
    const params = useParams()
    const templateId = params?.id ? Number(params.id) : 0

    const { template, loading, saving, updateTemplate } = useNotificationDetail(templateId)

    const handleActiveChange = async (checked: boolean) => {
        try {
            await updateTemplate({ active: checked })
        } catch (error) {
            // Error handled in hook
        }
    }

    const handleEditClick = () => {
        router.push(`/admin/settings/notification/${templateId}/edit`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 w-full h-full">
                <Loader />
            </div>
        )
    }

    if (!template) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <p className="text-gray-500">Không tìm thấy mẫu thông báo</p>
                    <Button onClick={() => router.push('/admin/settings/notification')} className="mt-4">
                        Quay lại
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className=" px-6 py-4">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            type="text"
                            icon={<ArrowLeft size={20} />}
                            onClick={() => router.push('/admin/settings/notification')}
                            className="flex items-center border bg-white! rounded!"
                        />
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">{template.name}</h1>
                            {template.description && (
                                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {template.can_edit_active && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Kích hoạt</span>
                                <Switch
                                    checked={template.active}
                                    onChange={handleActiveChange}
                                    disabled={saving}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1400px] mx-auto p-6">
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Eye size={20} className="text-gray-600" />
                            <span className="text-lg font-semibold text-gray-900">Xem trước</span>
                        </div>
                        <Button
                            type="primary"
                            icon={<Edit size={16} />}
                            onClick={handleEditClick}
                        >
                            Sửa thông báo
                        </Button>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                            <p className="text-sm text-gray-600">Tiêu đề:</p>
                            <p className="font-medium text-gray-900">{template.subject}</p>
                        </div>
                        <div
                            className="bg-white p-6"
                            dangerouslySetInnerHTML={{ __html: template.html_content || template.content }}
                        />
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default NotificationDetailView
