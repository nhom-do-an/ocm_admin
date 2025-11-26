'use client'

import React, { useState } from 'react'
import { Button, Card, Empty, Skeleton, Tag } from 'antd'
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

    const formatDateTime = (value?: Date | string | null) => {
        if (!value) return '---'
        return dayjs(value).format('DD/MM/YYYY HH:mm:ss')
    }

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
                <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý các tài khoản nhân viên trong cửa hàng</p>
            </div>

            <div className="space-y-4">
                <Card>
                    <p className="text-base font-semibold text-gray-900 mb-4">Tài khoản chủ cửa hàng</p>
                    {owner ? (
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {owner.name || [owner.first_name, owner.last_name].filter(Boolean).join(' ') || '---'}
                                </p>
                                <p className="text-sm text-gray-600">Đăng nhập lần cuối: {formatDateTime(owner.last_login)}</p>
                            </div>
                            <Tag color="success">Đang kích hoạt</Tag>
                        </div>
                    ) : (
                        <Skeleton active />
                    )}
                </Card>

                <Card>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-base font-semibold text-gray-900">Tài khoản nhân viên</p>
                            <p className="text-sm text-gray-500">Quản lý các tài khoản nhân viên trong cửa hàng của bạn</p>
                        </div>
                        <Button type="primary" onClick={handleOpenCreate}>
                            Thêm mới nhân viên
                        </Button>
                    </div>
                    <div className="mt-5">
                        {staffsLoading ? (
                            <div className="py-10">
                                <Loader />
                            </div>
                        ) : staffs.length > 0 ? (
                            <div className="space-y-3">
                                {staffs.map(staff => (
                                    <div
                                        key={staff.id}
                                        className="flex cursor-pointer flex-col gap-2 rounded border border-gray-100 px-4 py-3 transition hover:border-primary md:flex-row md:items-center md:justify-between"
                                        onClick={() => handleOpenEdit(staff)}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {staff.name || [staff.first_name, staff.last_name].filter(Boolean).join(' ') || '---'}
                                            </p>
                                            <p className="text-sm text-gray-600">Email: {staff.email || '---'}</p>
                                            <p className="text-sm text-gray-600">SĐT: {staff.phone || '---'}</p>
                                        </div>
                                        <Tag color={staff.active ? 'success' : 'default'}>
                                            {staff.active ? 'Đang kích hoạt' : 'Tạm tắt'}
                                        </Tag>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty description="Cửa hàng của bạn chưa có nhân viên nào" className="py-10" />
                        )}
                    </div>
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

