'use client'
import React from 'react'
import { Table, Button, Input, Select, Space, Tag } from 'antd'
import { Search, Plus, X } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { useCustomerList } from './hooks/use-customer-list'
import { Customer, CustomerDetail } from '@/types/response/customer'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CustomerListView: React.FC = () => {
    const router = useRouter()
    const {
        customers,
        loading,
        selectedRowKeys,
        pagination,
        filters,
        onSelectChange,
        handleTableChange,
        handleFilterChange,
        handleClearFilters,
    } = useCustomerList()

    const activeFiltersCount = Object.keys(filters).filter(key =>
        !['page', 'limit'].includes(key) &&
        filters[key as keyof typeof filters] !== undefined &&
        filters[key as keyof typeof filters] !== '' &&
        (Array.isArray(filters[key as keyof typeof filters])
            ? (filters[key as keyof typeof filters] as unknown[]).length > 0
            : true)
    ).length

    // Helper function to get customer initials for avatar
    const getInitials = (customer: Customer) => {
        const firstName = customer.first_name || ''
        const lastName = customer.last_name || ''
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase()
        }
        if (firstName) {
            return firstName.substring(0, 2).toUpperCase()
        }
        if (customer.email) {
            return customer.email.substring(0, 2).toUpperCase()
        }
        return 'KH'
    }

    // Helper function to get customer name
    const getCustomerName = (customer: Customer) => {
        if (customer.first_name || customer.last_name) {
            return `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        }
        return customer.email || customer.phone || 'Khách hàng'
    }

    // Helper function to get avatar color
    const getAvatarColor = (index: number) => {
        const colors = ['#f5222d', '#faad14', '#722ed1', '#fa8c16', '#13c2c2', '#1890ff']
        return colors[index % colors.length]
    }

    const columns: ColumnsType<CustomerDetail> = [
        {
            title: 'Tên khách hàng',
            key: 'name',
            width: 250,
            fixed: 'left',
            render: (_, record, index) => {
                const initials = getInitials(record)
                const name = getCustomerName(record)
                const avatarColor = getAvatarColor(index)

                return (
                    <Space size="small">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{ backgroundColor: avatarColor }}
                        >
                            {initials}
                        </div>
                        <div>
                            <button
                                onClick={() => router.push(`/customer/${record.id}`)}
                                className="!text-blue-500 hover:text-blue-800 font-medium cursor-pointer"
                            >
                                {name}
                            </button>
                        </div>
                    </Space>
                )
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            render: (text) => text || '-',
        },
        {
            title: 'Điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            width: 150,
            render: (text) => text || '-',
        },
        {
            title: 'Đơn hàng',
            key: 'orders_count',
            width: 100,
            align: 'center',
            render: (_, record, index) => {
                return <span>{record.orders_count?.toLocaleString('vi-VN') || 0}đ</span>
            },
        },
        {
            title: 'Đơn hàng gần nhất',
            key: 'last_order_name',
            width: 150,
            align: 'center',
            render: (_, record, index) => {
                return <Link href={`/order/${record.last_order_id}`}>{record.last_order_name}</Link>
            },
        },
        {
            title: 'Tổng chi tiêu',
            key: 'total_spent',
            width: 150,
            align: 'right',
            render: (_, record, index) => {
                return <span>{record.total_spent?.toLocaleString('vi-VN') || 0}</span>
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            align: 'center',
            render: (status) => {
                const statusConfig = {
                    enabled: { color: 'green', text: 'Đang hoạt động' },
                    disabled: { color: 'red', text: 'Chưa có tài khoản' },
                }
                const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status }
                return <Tag color={config.color}>{config.text}</Tag>
            },
        },
    ]

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    const statusOptions = [
        { label: 'Đang hoạt động', value: 'enabled' },
        { label: 'Chưa có tài khoản', value: 'disabled' },
    ]

    return (
        <div className="flex flex-col h-fit overflow-hidden">
            <div className="flex-1 flex items-start justify-center px-2 py-6">
                <div className="w-full max-w-[1400px] flex flex-col h-full">
                    {/* Header - Fixed */}
                    <div className="flex-shrink-0 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl !font-semibold">Khách hàng</h1>
                            </div>
                            <Space>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<Plus size={16} className="inline mr-1" />}
                                    onClick={() => router.push('/customer/create')}
                                >
                                    Thêm khách hàng
                                </Button>
                            </Space>
                        </div>
                    </div>

                    {/* Main Content - Scrollable */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <div className="bg-white shadow-sm rounded-lg flex-1 flex flex-col min-h-0">
                            {/* Filters Bar - Fixed */}
                            <div className="flex-shrink-0 p-4 ">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Input
                                        placeholder="Tìm kiếm khách hàng"
                                        prefix={<Search size={16} className="text-gray-400" />}
                                        className="max-w-[350px]"
                                        value={filters.key}
                                        onChange={(e) => handleFilterChange('key', e.target.value)}
                                        allowClear
                                    />

                                    <Select
                                        placeholder="Trạng thái"
                                        className="min-w-[180px]"
                                        value={filters.status}
                                        onChange={(value) => handleFilterChange('status', value)}
                                        options={statusOptions}
                                        allowClear
                                    />

                                    {activeFiltersCount > 0 && (
                                        <Button
                                            icon={<X size={16} />}
                                            onClick={handleClearFilters}
                                            danger
                                            type="text"
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    )}
                                </div>

                                {/* Active Filters Display */}
                                {activeFiltersCount > 0 && (
                                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                                        <span className="text-sm text-gray-500">Đang lọc:</span>
                                        {filters.status && (
                                            <Tag closable color='blue' onClose={() => handleFilterChange('status', undefined)}>
                                                Trạng thái: {statusOptions.find(opt => opt.value === filters.status)?.label}
                                            </Tag>
                                        )}
                                        {filters.key && (
                                            <Tag closable color='blue' onClose={() => handleFilterChange('key', '')}>
                                                Tìm kiếm: {filters.key}
                                            </Tag>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-h-0">
                                <Table
                                    size="small"
                                    rowSelection={rowSelection}
                                    columns={columns}
                                    dataSource={customers}
                                    loading={loading}
                                    rowKey="id"
                                    pagination={{
                                        ...pagination,
                                        showSizeChanger: true,
                                        showTotal: (total, range) => (
                                            <span className="text-sm text-gray-600">
                                                Từ <strong>{range[0]}</strong> đến <strong>{range[1]}</strong> trên tổng <strong>{total}</strong>
                                            </span>
                                        ),
                                        position: ['bottomCenter'],
                                        pageSizeOptions: ['10', '20', '50', '100'],
                                    }}
                                    onChange={handleTableChange}
                                    scroll={{ x: 'max-content' }}
                                    sticky
                                    locale={{
                                        emptyText: (
                                            <div className="py-8">
                                                <p className="text-gray-400 text-lg mb-2">Không tìm thấy khách hàng nào</p>
                                                <p className="text-gray-400 text-sm">Thử điều chỉnh bộ lọc hoặc thêm khách hàng mới</p>
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerListView

