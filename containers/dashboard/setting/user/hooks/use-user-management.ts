'use client'

import { useCallback, useEffect, useState } from 'react'
import userService from '@/services/user'
import { TUserResponse } from '@/types/response/auth'
import { TUserSummaryResponse } from '@/types/response/user'
import { CreateStaffRequest, UpdateStaffRequest } from '@/types/request/user'
import { useGlobalNotification } from '@/hooks/useNotification'

const PAGE_SIZE = 10

const useUserManagement = () => {
    const notification = useGlobalNotification()
    const [owner, setOwner] = useState<TUserResponse | null>(null)
    const [summary, setSummary] = useState<TUserSummaryResponse | null>(null)
    const [staffs, setStaffs] = useState<TUserResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [staffsLoading, setStaffsLoading] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [pagination, setPagination] = useState({ page: 1, size: PAGE_SIZE, total: 0 })

    const fetchSummary = useCallback(async () => {
        try {
            const data = await userService.getUserSummary()
            setSummary(data)
        } catch (error) {
            console.error('Failed to fetch summary', error)
            notification.error({ message: 'Không thể tải tổng quan tài khoản' })
        }
    }, [notification])

    const fetchOwner = useCallback(async () => {
        try {
            const data = await userService.getOwner()
            setOwner(data)
        } catch (error) {
            console.error('Failed to fetch owner', error)
            notification.error({ message: 'Không thể tải thông tin chủ cửa hàng' })
        }
    }, [notification])

    const fetchStaffs = useCallback(
        async (page = 1) => {
            setStaffsLoading(true)
            try {
                const response = await userService.getStaffs({ page, size: PAGE_SIZE })
                setStaffs(response.staffs || [])
                setPagination(prev => ({
                    ...prev,
                    page,
                    size: PAGE_SIZE,
                    total: response.count || 0,
                }))
            } catch (error) {
                console.error('Failed to fetch staffs', error)
                notification.error({ message: 'Không thể tải danh sách nhân viên' })
            } finally {
                setStaffsLoading(false)
            }
        },
        [notification],
    )

    const initialize = useCallback(async () => {
        setLoading(true)
        await Promise.all([fetchSummary(), fetchOwner()])
        await fetchStaffs(1)
        setLoading(false)
    }, [fetchOwner, fetchStaffs, fetchSummary])

    useEffect(() => {
        initialize()
    }, [initialize])

    const upsertStaff = useCallback(
        async (payload: CreateStaffRequest | UpdateStaffRequest, isEdit = false) => {
            setCreateLoading(true)
            try {
                if (isEdit) {
                    await userService.updateStaff(payload as UpdateStaffRequest)
                } else {
                    await userService.createStaff(payload as CreateStaffRequest)
                }
                notification.success({
                    message: isEdit ? 'Cập nhật nhân viên thành công' : 'Tạo nhân viên thành công',
                })
                await Promise.all([fetchSummary(), fetchStaffs(1)])
            } catch (error) {
                console.error('Failed to submit staff', error)
                notification.error({
                    message: isEdit ? 'Không thể cập nhật nhân viên' : 'Không thể tạo nhân viên',
                })
                throw error
            } finally {
                setCreateLoading(false)
            }
        },
        [fetchStaffs, fetchSummary, notification],
    )

    return {
        owner,
        summary,
        staffs,
        loading,
        staffsLoading,
        createLoading,
        pagination,
        fetchStaffs,
        upsertStaff,
    }
}

export default useUserManagement

