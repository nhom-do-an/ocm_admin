'use client'

import { useCallback, useState } from 'react'
import beneficiaryAccountService from '@/services/beneficiary-account'
import { Bank, BeneficiaryAccount } from '@/types/response/payment-method'
import { CreateBeneficiaryAccountRequest, UpdateBeneficiaryAccountRequest } from '@/types/request/payment-method'
import { useGlobalNotification } from '@/hooks/useNotification'

const useBeneficiaryAccountManagement = () => {
    const notification = useGlobalNotification()
    const [banks, setBanks] = useState<Bank[]>([])
    const [loadingBanks, setLoadingBanks] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)

    const fetchBanks = useCallback(async (): Promise<Bank[]> => {
        setLoadingBanks(true)
        try {
            const data = await beneficiaryAccountService.getListBanks()
            setBanks(data || [])
            return data || []
        } catch (error) {
            console.error('Failed to fetch banks', error)
            notification.error({ message: 'Không thể tải danh sách ngân hàng' })
            return []
        } finally {
            setLoadingBanks(false)
        }
    }, [notification])

    const createBeneficiaryAccount = useCallback(
        async (payload: CreateBeneficiaryAccountRequest): Promise<BeneficiaryAccount> => {
            setCreateLoading(true)
            try {
                const data = await beneficiaryAccountService.createBeneficiaryAccount(payload)
                notification.success({ message: 'Tạo tài khoản thụ hưởng thành công' })
                return data
            } catch (error) {
                console.error('Failed to create beneficiary account', error)
                notification.error({ message: 'Không thể tạo tài khoản thụ hưởng' })
                throw error
            } finally {
                setCreateLoading(false)
            }
        },
        [notification],
    )

    const updateBeneficiaryAccount = useCallback(
        async (payload: UpdateBeneficiaryAccountRequest): Promise<BeneficiaryAccount> => {
            setUpdateLoading(true)
            try {
                const data = await beneficiaryAccountService.updateBeneficiaryAccount(payload)
                notification.success({ message: 'Cập nhật tài khoản thụ hưởng thành công' })
                return data
            } catch (error) {
                console.error('Failed to update beneficiary account', error)
                notification.error({ message: 'Không thể cập nhật tài khoản thụ hưởng' })
                throw error
            } finally {
                setUpdateLoading(false)
            }
        },
        [notification],
    )

    return {
        banks,
        loadingBanks,
        createLoading,
        updateLoading,
        fetchBanks,
        createBeneficiaryAccount,
        updateBeneficiaryAccount,
    }
}

export default useBeneficiaryAccountManagement

