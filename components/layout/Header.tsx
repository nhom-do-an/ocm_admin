'use client'
import { Avatar, Input, Dropdown, Tabs, Empty, Spin } from 'antd'
import type { MenuProps } from 'antd'
import React, { useState, useEffect, useCallback } from 'react'
import { Search, Menu, User, LogOut, Package, ShoppingCart, Users } from "lucide-react"
import { useGlobalContext } from '@/hooks/useGlobalContext'
import storage from '@/storages/storage'
import { useRouter, usePathname } from 'next/navigation'
import { STORAGE_KEYS } from '@/storages/storage-key'
import { SCREEN } from '@/constants/constant'
import NotificationDropdown from './NotificationDropdown'
import notificationUserService from '@/services/notification-user'
import { useDebounce } from '@/hooks/useDebounce'
import variantService, { Variant } from '@/services/variant'
import customerService from '@/services/customer'
import orderService from '@/services/order'
import { Customer } from '@/types/response/customer'
import { OrderDetail } from '@/types/response/order'
import Image from 'next/image'

interface SearchResults {
    products: Variant[];
    orders: OrderDetail[];
    customers: Customer[];
}

function Header() {
    const { setOpenSidebar } = useGlobalContext()
    const [searchValue, setSearchValue] = useState('')
    const [openSearch, setOpenSearch] = useState(false)
    const [activeTab, setActiveTab] = useState('products')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter();
    const pathname = usePathname();
    const { setUser, user } = useGlobalContext();
    const [unreadCount, setUnreadCount] = useState(0)

    // Get current locale from pathname
    const segments = pathname.split('/').filter(Boolean)
    const currentLocale = segments[0] || 'vi'

    // Debounce search value
    const debouncedSearchValue = useDebounce(searchValue, 500)

    // Search results state
    const [searchResults, setSearchResults] = useState<SearchResults>({
        products: [],
        orders: [],
        customers: []
    })

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

    // Search function - call all 3 APIs in parallel
    const performSearch = useCallback(async (keyword: string) => {
        if (!keyword.trim()) {
            setSearchResults({ products: [], orders: [], customers: [] })
            return
        }

        setIsLoading(true)
        try {
            const [variantsRes, customersRes, ordersRes] = await Promise.all([
                variantService.getListVariants({ key: keyword, page: 1, limit: 10 }),
                customerService.getListCustomers({ key: keyword, page: 1, limit: 10 }),
                orderService.getListOrders({ key: keyword, page: 1, limit: 10 })
            ])

            setSearchResults({
                products: variantsRes.variants || [],
                orders: ordersRes.orders || [],
                customers: customersRes.customers || []
            })
        } catch (error) {
            console.error('Search failed:', error)
            setSearchResults({ products: [], orders: [], customers: [] })
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Trigger search when debounced value changes
    useEffect(() => {
        performSearch(debouncedSearchValue)
    }, [debouncedSearchValue, performSearch])

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

    const handleProductClick = (product: Variant) => {
        setOpenSearch(false)
        setSearchValue('')
        // Navigate to product detail page (using product_id)
        if (product.product_id) {
            window.location.href = `/${currentLocale}/admin/product/${product.product_id}`
        }
    }

    const handleOrderClick = (order: OrderDetail) => {
        setOpenSearch(false)
        setSearchValue('')
        // Navigate to order detail page
        window.location.href = `/${currentLocale}/admin/order/${order.id}`
    }

    const handleCustomerClick = (customer: Customer) => {
        setOpenSearch(false)
        setSearchValue('')
        // Navigate to customer detail page
        window.location.href = `/${currentLocale}/admin/customer/${customer.id}`
    }

    const formatPrice = (price?: number) => {
        if (!price) return '0đ'
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    const renderProductList = () => {
        if (isLoading) {
            return <div className="flex justify-center py-4"><Spin /></div>
        }
        if (searchResults.products.length === 0) {
            return <Empty description="Không tìm thấy sản phẩm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
        return (
            <div className="max-h-[300px] overflow-y-auto">
                {searchResults.products.map(product => (
                    <div
                        key={product.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                        onClick={() => handleProductClick(product)}
                    >
                        {product.image?.url ? (
                            <Image
                                src={product.image.url}
                                alt={product.product_name || ''}
                                className="w-10 h-10 object-cover rounded"
                                width={40}
                                height={40}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <Package size={20} className="text-gray-400" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{product.product_name}</div>
                            <div className="text-sm text-gray-500 flex gap-2">
                                {product.sku && <span>SKU: {product.sku}</span>}
                                {product.title && product.title !== 'Default Title' && (
                                    <span className="text-blue-500">{product.title}</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-medium text-blue-600">{formatPrice(product.price)}</div>
                            {product.compare_at_price && product.compare_at_price > (product.price || 0) && (
                                <div className="text-xs text-gray-400 line-through">
                                    {formatPrice(product.compare_at_price)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderOrderList = () => {
        if (isLoading) {
            return <div className="flex justify-center py-4"><Spin /></div>
        }
        if (searchResults.orders.length === 0) {
            return <Empty description="Không tìm thấy đơn hàng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
        return (
            <div className="max-h-[300px] overflow-y-auto">
                {searchResults.orders.map(order => (
                    <div
                        key={order.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOrderClick(order)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="font-medium text-blue-600">{order.name}</div>
                            <div className="text-sm font-medium">{formatPrice(order.total_price)}</div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span>{order.customer?.first_name} {order.customer?.last_name}</span>
                            {order.customer?.phone && (
                                <>
                                    <span>•</span>
                                    <span>{order.customer.phone}</span>
                                </>
                            )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {order.created_at && new Date(order.created_at).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderCustomerList = () => {
        if (isLoading) {
            return <div className="flex justify-center py-4"><Spin /></div>
        }
        if (searchResults.customers.length === 0) {
            return <Empty description="Không tìm thấy khách hàng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
        return (
            <div className="max-h-[300px] overflow-y-auto">
                {searchResults.customers.map(customer => (
                    <div
                        key={customer.id}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                        onClick={() => handleCustomerClick(customer)}
                    >
                        <Avatar size={40} className="bg-blue-100 text-blue-600 shrink-0">
                            {(customer.first_name?.[0] || customer.last_name?.[0] || 'K').toUpperCase()}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                                {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-2">
                                {customer.phone && <span>{customer.phone}</span>}
                                {customer.email && <span className="truncate">{customer.email}</span>}
                            </div>
                        </div>
                        <div className="text-right text-sm">
                            <div className="text-gray-500">{customer.orders_count || 0} đơn</div>
                            <div className="font-medium text-green-600">
                                {formatPrice(customer.total_spent || 0)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const tabItems = [
        {
            key: 'products',
            label: (
                <span className="flex items-center gap-2">
                    <Package size={16} />
                    Sản phẩm ({searchResults.products.length})
                </span>
            ),
            children: renderProductList(),
        },
        {
            key: 'orders',
            label: (
                <span className="flex items-center gap-2">
                    <ShoppingCart size={16} />
                    Đơn hàng ({searchResults.orders.length})
                </span>
            ),
            children: renderOrderList(),
        },
        {
            key: 'customers',
            label: (
                <span className="flex items-center gap-2">
                    <Users size={16} />
                    Khách hàng ({searchResults.customers.length})
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
                <div className="md:hidden cursor-pointer" onClick={() => setOpenSidebar(true)}>
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
                        placeholder="Tìm kiếm sản phẩm, đơn hàng, khách hàng..."
                        prefix={<Search className="text-(--input-placeholder)" size={18} />}
                        suffix={isLoading ? <Spin size="small" /> : null}
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
