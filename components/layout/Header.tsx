'use client'
import { Avatar, Input, Dropdown, Tabs, Empty } from 'antd'
import type { MenuProps } from 'antd'
import React, { useState, useEffect } from 'react'
import { Search, Menu, User, LogOut, Package, ShoppingCart, Users } from "lucide-react"
import { useGlobalContext } from '@/hooks/useGlobalContext'
import storage from '@/storages/storage'
import { useRouter } from 'next/navigation'
import { STORAGE_KEYS } from '@/storages/storage-key'
import { SCREEN } from '@/constants/constant'
import NotificationDropdown from './NotificationDropdown'
import notificationUserService from '@/services/notification-user'

function Header() {
    const { setOpenSidebar } = useGlobalContext()
    const [searchValue, setSearchValue] = useState('')
    const [openSearch, setOpenSearch] = useState(false)
    const [activeTab, setActiveTab] = useState('products')
    const router = useRouter();
    const { setUser, user } = useGlobalContext();
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationUserService.getUnreadCount()
            setUnreadCount(count)
        } catch (error) {
            console.error('Failed to fetch unread count:', error)
        }
    }

    useEffect(() => {
        fetchUnreadCount()
        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    // Dữ liệu mẫu - thay thế bằng dữ liệu thực từ API
    const [searchResults] = useState({
        products: [
            { id: 1, name: 'Sản phẩm A', price: '100.000đ', image: '🛍️' },
            { id: 2, name: 'Sản phẩm B', price: '200.000đ', image: '🛍️' },
        ],
        orders: [
            { id: 1, code: 'DH001', customer: 'Nguyễn Văn A', total: '500.000đ' },
        ],
        customers: []
    })

    const handleLogout = () => {
        console.log('Đăng xuất')
        storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        setUser(null)
        router.push(SCREEN.LOGIN.PATH);

    }

    const avatarMenuItems: MenuProps['items'] = [
        {
            key: 'info',
            label: (
                <div className="px-2 py-1">
                    <div className="font-semibold">Tên tài khoản</div>
                    <div className="text-xs text-gray-500">{user?.name || "test@gmail.com"}</div>
                </div>
            ),
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'account',
            icon: <User size={16} />,
            label: 'Thông tin tài khoản',
            onClick: () => {
                console.log('Xem thông tin tài khoản')
            }
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogOut size={16} />,
            label: 'Đăng xuất',
            onClick: handleLogout,
            danger: true,
        },
    ]

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
        setOpenSearch(e.target.value.length > 0)
    }

    const renderProductList = () => {
        if (searchResults.products.length === 0) {
            return <Empty description="Không tìm thấy sản phẩm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
        return (
            <div className="max-h-[300px] overflow-y-auto">
                {searchResults.products.map(product => (
                    <div
                        key={product.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                        onClick={() => console.log('Chọn sản phẩm:', product.id)}
                    >
                        <span className="text-2xl">{product.image}</span>
                        <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.price}</div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderOrderList = () => {
        if (searchResults.orders.length === 0) {
            return <Empty description="Không tìm thấy đơn hàng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
        return (
            <div className="max-h-[300px] overflow-y-auto">
                {searchResults.orders.map(order => (
                    <div
                        key={order.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => console.log('Chọn đơn hàng:', order.id)}
                    >
                        <div className="font-medium">{order.code}</div>
                        <div className="text-sm text-gray-500">
                            {order.customer} - {order.total}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderCustomerList = () => {
        if (searchResults.customers.length === 0) {
            return <Empty description="Không tìm thấy khách hàng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
        return (
            <div className="max-h-[300px] overflow-y-auto">
                Hello
            </div>
        )
    }

    const tabItems = [
        {
            key: 'products',
            label: (
                <span className="flex items-center gap-2">
                    <Package size={16} />
                    Sản phẩm
                </span>
            ),
            children: renderProductList(),
        },
        {
            key: 'orders',
            label: (
                <span className="flex items-center gap-2">
                    <ShoppingCart size={16} />
                    Đơn hàng
                </span>
            ),
            children: renderOrderList(),
        },
        {
            key: 'customers',
            label: (
                <span className="flex items-center gap-2">
                    <Users size={16} />
                    Khách hàng
                </span>
            ),
            children: renderCustomerList(),
        },
    ]

    const searchDropdownContent = (
        <div className="w-[500px] max-w-[90vw] bg-white rounded-lg shadow-lg border border-gray-200">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="search-tabs px-3"
                type="card"
                tabBarStyle={{
                    marginBottom: 0,
                    borderBottom: '1px solid #f0f0f0'
                }}
                tabBarGutter={0}
            />
        </div>
    )

    return (
        <div className='h-[55px] border-b drop-shadow-sm w-full bg-(--header) border-(--header-border) flex items-center px-5 font-medium text-lg justify-between'
        >
            <div className='flex gap-1 items-center'>
                <div className="sm:hidden" onClick={() => setOpenSidebar(true)}>
                    <Menu />
                </div>
                <Dropdown
                    popupRender={() => searchDropdownContent}
                    open={openSearch}
                    onOpenChange={setOpenSearch}
                    placement="bottomLeft"
                    trigger={['click']}
                >
                    <Input
                        size="large"
                        placeholder="Tìm kiếm"
                        prefix={<Search className="text-(--input-placeholder)" size={18} />}
                        className="w-[400px] max-w-[500px] max-sm:max-w-[180px] custom-input"
                        value={searchValue}
                        onChange={handleSearchChange}
                        onFocus={() => searchValue && setOpenSearch(true)}
                    />
                </Dropdown>
            </div>

            <div className="flex gap-4 items-center">
                <NotificationDropdown unreadCount={unreadCount} onRefreshCount={fetchUnreadCount} />
                <Dropdown
                    menu={{ items: avatarMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <Avatar
                        style={{ color: "MenuText", cursor: "pointer" }}
                        size="large"
                        gap={4}
                        className='bg-blue-300!'
                    >
                        C
                    </Avatar>
                </Dropdown>
            </div>
        </div>
    )
}

export default Header