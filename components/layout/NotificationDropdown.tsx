'use client'

import React, { useState, useEffect } from 'react'
import { Dropdown, Tabs, Button, Empty, Spin } from 'antd'
import { Settings, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import notificationUserService from '@/services/notification-user'
import { NotificationRead } from '@/types/response/notification-user'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

interface NotificationDropdownProps {
    unreadCount: number
    onRefreshCount: () => void
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ unreadCount, onRefreshCount }) => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [notifications, setNotifications] = useState<NotificationRead[]>([])
    const [activeTab, setActiveTab] = useState('system')
    const [markingAll, setMarkingAll] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [totalCount, setTotalCount] = useState(0)

    const getTypeForTab = (tab: string): string | undefined => {
        if (tab === 'system') return '1'
        if (tab === 'news') return '2'
        return undefined
    }

    const fetchNotifications = async (tab: string, pageNum: number = 1, append: boolean = false) => {
        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }
        try {
            const type = getTypeForTab(tab)
            const response = await notificationUserService.getListNotifications({
                page: pageNum,
                size: 10,
                type: type,
            })

            if (append) {
                setNotifications(prev => [...prev, ...(response.notifications || [])])
            } else {
                setNotifications(response.notifications || [])
            }

            setTotalCount(response.count || 0)
            const currentCount = append ? notifications.length + (response.notifications || []).length : (response.notifications || []).length
            setHasMore(currentCount < (response.count || 0))
            setPage(pageNum)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    useEffect(() => {
        if (open) {
            setPage(1)
            fetchNotifications(activeTab, 1, false)
        }
    }, [open, activeTab])

    const handleTabChange = (key: string) => {
        setActiveTab(key)
        setPage(1)
        setNotifications([])
    }

    const handleLoadMore = () => {
        fetchNotifications(activeTab, page + 1, true)
    }

    const handleNotificationClick = async (notification: NotificationRead) => {
        try {
            await notificationUserService.readNotification(notification.id)

            // Update local state
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            )
            onRefreshCount()

            // Navigate based on metadata
            if (notification.metadata?.order_id) {
                router.push(`/admin/order/${notification.metadata.order_id}`)
                setOpen(false)
            } else if (notification.metadata?.shipment_id) {
                router.push(`/admin/shipment/${notification.metadata.shipment_id}`)
                setOpen(false)
            }
        } catch (error) {
            console.error('Failed to read notification:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true)
        try {
            await notificationUserService.markAsReadAll()
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            onRefreshCount()
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        } finally {
            setMarkingAll(false)
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = dayjs(dateString)
        const now = dayjs()
        const diffInMinutes = now.diff(date, 'minute')

        if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`
        }
        const diffInHours = now.diff(date, 'hour')
        const diffInMinutesRemainder = now.diff(date, 'minute') % 60
        if (diffInHours < 24) {
            if (diffInMinutesRemainder > 0) {
                return `${diffInHours} giờ ${diffInMinutesRemainder} phút trước`
            }
            return `${diffInHours} giờ trước`
        }
        const diffInDays = now.diff(date, 'day')
        return `${diffInDays} ngày trước`
    }

    const unreadCountForTab = notifications.filter(n => !n.read).length

    const tabItems = [
        {
            key: 'system',
            label: (
                <span>
                    Hệ thống {unreadCountForTab > 0 && <span className="text-red-500">({unreadCountForTab})</span>}
                </span>
            ),
        },
        {
            key: 'news',
            label: 'Tin tức',
        },
    ]

    const dropdownContent = (
        <div className="w-[350px] max-w-[90vw] bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex items-center justify-between p-2 border-b border-gray-100">
                <h3 className="text-lg font-semibold">Thông báo ({unreadCount})</h3>
                <Button
                    type="link"
                    size="small"
                    onClick={handleMarkAllAsRead}
                    loading={markingAll}
                    disabled={unreadCount === 0}
                >
                    Đánh dấu tất cả là đã đọc
                </Button>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                className="!px-4"
            />

            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Spin />
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <div className="">
                            {notifications.map((notification, index) => (
                                <div
                                    key={notification.id}
                                    className={`p-2 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                        } ${index !== notifications.length - 1 ? 'border-b border-gray-200' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                                            <Settings className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 mb-1">{notification.content}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatTimeAgo(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {hasMore && (
                            <div className="p-4 text-center border-t border-gray-200">
                                <Button
                                    type="link"
                                    onClick={handleLoadMore}
                                    loading={loadingMore}
                                >
                                    Xem thêm
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <Empty description="Không có thông báo nào" className="py-8" />
                )}
            </div>
        </div>
    )

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            dropdownRender={() => dropdownContent}
            placement="bottomRight"
            trigger={['click']}
        >
            <div className="relative cursor-pointer">
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>
        </Dropdown>
    )
}

export default NotificationDropdown

