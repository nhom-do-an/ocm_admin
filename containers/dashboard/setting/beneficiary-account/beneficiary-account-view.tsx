'use client'

import React, { useState } from 'react'
import { Button, Card, Empty, Skeleton, Tag } from 'antd'
import { ArrowLeft, Plus, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import BeneficiaryAccountModal from '../payment-method/components/BeneficiaryAccountModal'
import { CreateBeneficiaryAccountRequest, UpdateBeneficiaryAccountRequest } from '@/types/request/payment-method'
import { BeneficiaryAccountDetail } from '@/types/response/payment-method'
import beneficiaryAccountService from '@/services/beneficiary-account'
import useBeneficiaryAccountManagement from '../payment-method/hooks/use-beneficiary-account-management'

const BeneficiaryAccountView: React.FC = () => {
    const router = useRouter()
    const { createLoading, updateLoading, createBeneficiaryAccount, updateBeneficiaryAccount } = useBeneficiaryAccountManagement()
    const [beneficiaryAccounts, setBeneficiaryAccounts] = useState<BeneficiaryAccountDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setModalOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<BeneficiaryAccountDetail | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    React.useEffect(() => {
        fetchBeneficiaryAccounts()
    }, [])

    const fetchBeneficiaryAccounts = async () => {
        setLoading(true)
        try {
            const data = await beneficiaryAccountService.getListBeneficiaryAccounts()
            setBeneficiaryAccounts(data || [])
        } catch (error) {
            console.error('Failed to fetch beneficiary accounts', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAccountClick = async (accountId: number) => {
        setLoadingDetail(true)
        try {
            const detail = await beneficiaryAccountService.getBeneficiaryAccountDetail(accountId)
            setSelectedAccount(detail)
            setModalOpen(true)
        } catch (error) {
            console.error('Failed to fetch beneficiary account detail', error)
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleSubmit = async (values: CreateBeneficiaryAccountRequest | UpdateBeneficiaryAccountRequest) => {
        if ('id' in values) {
            // Update mode
            await updateBeneficiaryAccount(values)
            setModalOpen(false)
            setSelectedAccount(null)
        } else {
            // Create mode
            await createBeneficiaryAccount(values)
            setModalOpen(false)
        }
        await fetchBeneficiaryAccounts()
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
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        type="text"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => router.back()}
                        className="p-0"
                    >
                        Quay lại
                    </Button>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý tài khoản thụ hưởng</h1>
                <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý các tài khoản thụ hưởng</p>
            </div>

            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                    <div>
                        <p className="text-base font-semibold text-gray-900">Danh sách tài khoản thụ hưởng</p>
                        <p className="text-sm text-gray-500">Quản lý các tài khoản thụ hưởng trong cửa hàng của bạn</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        onClick={() => {
                            setSelectedAccount(null)
                            setModalOpen(true)
                        }}
                    >
                        Thêm tài khoản thụ hưởng
                    </Button>
                </div>

                <div>
                    {loading ? (
                        <div className="py-10">
                            <Skeleton active />
                        </div>
                    ) : beneficiaryAccounts.length > 0 ? (
                        <div className="space-y-3">
                            {beneficiaryAccounts.map(account => (
                                <div
                                    key={account.id}
                                    className="flex flex-col gap-2 rounded border border-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleAccountClick(account.id)}
                                >
                                    <div className="flex items-start gap-3 flex-1">
                                        <Building2 className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {account.bank_logo && (
                                                    <img
                                                        src={account.bank_logo}
                                                        alt={account.bank_short_name}
                                                        className="w-6 h-6 object-contain"
                                                    />
                                                )}
                                                <p className="font-semibold text-gray-900">{account.bank_short_name || account.bank_name}</p>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Tên người thụ hưởng:</span> {account.account_name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Số tài khoản:</span> {account.account_number}
                                            </p>
                                            {account.note && (
                                                <p className="text-sm text-gray-500 mt-1">{account.note}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Cửa hàng của bạn chưa có tài khoản thụ hưởng nào" className="py-10" />
                    )}
                </div>
            </Card>

            <BeneficiaryAccountModal
                open={isModalOpen}
                loading={createLoading || updateLoading || loadingDetail}
                beneficiaryAccount={selectedAccount}
                onCancel={() => {
                    setModalOpen(false)
                    setSelectedAccount(null)
                }}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default BeneficiaryAccountView

