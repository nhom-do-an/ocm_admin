'use client'

import React, { useState, useMemo } from 'react'
import { Button, Card, Empty, Input, Skeleton, Table, Tag } from 'antd'
import { Search, User, Plus } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import useUserManagement from './hooks/use-user-management'
import Loader from '@/components/Loader'
import StaffFormModal from './components/CreateStaffModal'
import { CreateStaffRequest, UpdateStaffRequest } from '@/types/request/user'
import { TUserResponse } from '@/types/response/auth'

const UserManagementView: React.FC = () => {
    const { owner, staffs, loading, staffsLoading, createLoading, upsertStaff } = useUserManagement()
    const [isModalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
    const [selectedStaff, setSelectedStaff] = useState<TUserResponse | null>(null)
    const [searchKey, setSearchKey] = useState('')

    const formatDateTime = (value?: Date | string | null) => {
        if (!value) return null
        return dayjs(value).format('DD/MM/YYYY HH:mm:ss')
    }

    const getLastLoginText = (lastLogin?: Date | string | null) => {
        const formatted = formatDateTime(lastLogin)
        if (!formatted) return 'Chưa bao giờ đăng nhập'
        return `Đăng nhập lần cuối ${formatted}`
    }

    const filteredStaffs = useMemo(() => {
        if (!searchKey.trim()) return staffs
        const key = searchKey.toLowerCase()
        return staffs.filter(staff => {
            const name = [staff.first_name, staff.last_name].filter(Boolean).join(' ').toLowerCase()
            const email = (staff.email || '').toLowerCase()
            return name.includes(key) || email.includes(key)
        })
    }, [staffs, searchKey])

    const handleOpenCreate = () => {
        setModalMode('create')
        setSelectedStaff(null)
        setModalOpen(true)
    }

    const handleOpenEdit = (staff: TUserResponse) => {
        setModalMode('edit')
        setSelectedStaff(staff)
        setModalOpen(true)
    }

    const handleSubmit = async (values: CreateStaffRequest & Partial<UpdateStaffRequest>) => {
        if (modalMode === 'edit' && selectedStaff) {
            await upsertStaff({ ...values, user_id: selectedStaff.id }, true)
        } else {
            await upsertStaff(values, false)
        }
        setModalOpen(false)
        setSelectedStaff(null)
    }

    const ownerName = owner ? (owner.name || [owner.first_name, owner.last_name].filter(Boolean).join(' ') || '---') : '---'

    const columns: ColumnsType<TUserResponse> = [
        {
            title: 'Tài khoản',
            key: 'account',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <button
                            onClick={() => handleOpenEdit(record)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-left"
                        >
                            {record.name || [record.first_name, record.last_name].filter(Boolean).join(' ') || '---'}
                        </button>
                        <p className="text-sm text-gray-500">{getLastLoginText(record.last_login)}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'right',
            width: 150,
            render: (_, record) => (
                <Tag color={record.active ? 'green' : 'default'}>
                    {record.active ? 'Đang kích hoạt' : 'Tạm tắt'}
                </Tag>
            ),
        },
    ]

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
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý nhân viên</h1>
            </div>

            <div className="space-y-2">
                {/* Tài khoản chủ cửa hàng */}
                <Card className="!mb-2">
                    <p className="text-base font-semibold text-gray-900 mb-4">Tài khoản chủ cửa hàng</p>
                    {owner ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <button
                                    className="text-blue-600 hover:text-blue-800 font-medium text-left"
                                >
                                    {ownerName}
                                </button>
                                <p className="text-sm text-gray-500">{getLastLoginText(owner.last_login)}</p>
                            </div>
                            <Tag color="green">Đang kích hoạt</Tag>
                        </div>
                    ) : (
                        <Skeleton active />
                    )}
                </Card>

                {/* Tài khoản nhân viên */}
                <Card>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                        <p className="text-base font-semibold text-gray-900">Tài khoản nhân viên</p>
                        <Button type="primary" icon={<Plus size={16} />} onClick={handleOpenCreate}>
                            Thêm mới nhân viên
                        </Button>
                    </div>

                    <div className="mb-4">
                        <Input
                            placeholder="Tìm kiếm nhân viên"
                            prefix={<Search size={16} className="text-gray-400" />}
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                            allowClear
                        />
                    </div>

                    {staffsLoading ? (
                        <div className="py-10">
                            <Skeleton active />
                        </div>
                    ) : filteredStaffs.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={filteredStaffs}
                            rowKey="id"
                            pagination={false}
                            rowSelection={{
                                type: 'checkbox',
                            }}
                        />
                    ) : (
                        <Empty description="Cửa hàng của bạn chưa có nhân viên nào" className="py-10" />
                    )}
                </Card>
            </div>

            <StaffFormModal
                open={isModalOpen}
                mode={modalMode}
                loading={createLoading}
                initialValues={
                    modalMode === 'edit' && selectedStaff
                        ? {
                            first_name: selectedStaff.first_name,
                            last_name: selectedStaff.last_name,
                            email: selectedStaff.email,
                            phone: selectedStaff.phone,
                            active: selectedStaff.active,
                        }
                        : undefined
                }
                onCancel={() => setModalOpen(false)}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default UserManagementView

