'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Select, Spin } from 'antd'
import userService from '@/services/user'
import { TUserResponse } from '@/types/response/auth'

interface UpdateAssigneeModalProps {
    open: boolean
    currentAssigneeId?: number
    onCancel: () => void
    onSave: (assigneeId: number) => void
}

const UpdateAssigneeModal: React.FC<UpdateAssigneeModalProps> = ({
    open,
    currentAssigneeId,
    onCancel,
    onSave,
}) => {
    const [users, setUsers] = useState<TUserResponse[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | undefined>(currentAssigneeId)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!open) return
        setSelectedAssigneeId(currentAssigneeId)
        fetchUsers()
    }, [open, currentAssigneeId])

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const data = await userService.getListUsers({ size: 1000 })
            setUsers(data?.users || [])
        } catch (error) {
            console.error('Failed to load users', error)
            setUsers([])
        } finally {
            setLoadingUsers(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedAssigneeId) {
            return
        }
        setSubmitting(true)
        try {
            await onSave(selectedAssigneeId)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            open={open}
            title="Cập nhật nhân viên phụ trách"
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ disabled: !selectedAssigneeId, loading: submitting }}
        >
            {loadingUsers ? (
                <div className="flex items-center justify-center py-6">
                    <Spin />
                </div>
            ) : (
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Nhân viên phụ trách</label>
                    <Select
                        value={selectedAssigneeId}
                        onChange={(value) => setSelectedAssigneeId(value)}
                        placeholder="Chọn nhân viên phụ trách"
                        showSearch
                        optionFilterProp="label"
                        options={users.map(user => ({
                            label: user.name,
                            value: Number(user.id),
                        }))}
                    />
                </div>
            )}
        </Modal>
    )
}

export default UpdateAssigneeModal









