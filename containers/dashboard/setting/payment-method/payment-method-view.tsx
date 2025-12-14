'use client'

import React, { useMemo, useState } from 'react'
import { Button, Card, Empty, Skeleton, Table, Tag } from 'antd'
import { CreditCard, FileText, Plus } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { useRouter } from 'next/navigation'
import usePaymentMethodManagement from './hooks/use-payment-method-management'
import Loader from '@/components/Loader'
import PaymentMethodModal from './components/PaymentMethodModal'
import { CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '@/types/request/payment-method'
import { PaymentMethodDetail, PaymentMethod } from '@/types/response/payment-method'
import paymentMethodService from '@/services/payment-method'

const PaymentMethodView: React.FC = () => {
    const router = useRouter()
    const { paymentMethods, loading, createLoading, updateLoading, createPaymentMethod, updatePaymentMethod } = usePaymentMethodManagement()
    const [isModalOpen, setModalOpen] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodDetail | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const { bankMethods, otherMethods } = useMemo(() => {
        const bank: PaymentMethod[] = []
        const other: PaymentMethod[] = []

        paymentMethods.forEach(method => {
            const providerName = method.provider?.name || ''
            if (providerName === 'bank') {
                bank.push(method)
            } else {
                other.push(method)
            }
        })

        return { bankMethods: bank, otherMethods: other }
    }, [paymentMethods])

    const handlePaymentMethodClick = async (paymentMethodId: number) => {
        setLoadingDetail(true)
        try {
            const detail = await paymentMethodService.getPaymentMethodDetail(paymentMethodId)
            setSelectedPaymentMethod(detail)
            setModalOpen(true)
        } catch (error) {
            console.error('Failed to fetch payment method detail', error)
        } finally {
            setLoadingDetail(false)
        }
    }

    const handleSubmit = async (values: CreatePaymentMethodRequest | UpdatePaymentMethodRequest) => {
        if ('id' in values) {
            // Update mode
            await updatePaymentMethod(values)
            setModalOpen(false)
            setSelectedPaymentMethod(null)
        } else {
            // Create mode
            await createPaymentMethod(values)
            setModalOpen(false)
        }
    }

    const getStatusTag = (status?: string) => {
        return status === 'active' ? (
            <Tag color="green">Đang sử dụng</Tag>
        ) : (
            <Tag>Tạm tắt</Tag>
        )
    }

    const getBeneficiaryAccountDisplay = (method: PaymentMethod) => {
        const providerName = method.provider?.name || ''

        // Nếu là cash hoặc cod thì hiển thị "Không áp dụng"
        if (providerName === 'cash' || providerName === 'cod') {
            return 'Không áp dụng'
        }

        // Nếu có beneficiary_account thì hiển thị thông tin
        if (method.beneficiary_account) {
            const account = method.beneficiary_account
            if (account.account_name && account.account_number) {
                return `${account.account_name} - ${account.account_number}`
            }
            if (account.account_name) {
                return account.account_name
            }
            if (account.account_number) {
                return account.account_number
            }
        }

        // Mặc định hiển thị "---"
        return '---'
    }

    const createColumns = (): ColumnsType<PaymentMethod> => [
        {
            title: 'Tên phương thức',
            key: 'name',
            width: 200,
            render: (_, record) => (
                <button
                    onClick={() => handlePaymentMethodClick(record.id!)}
                    className="text-blue-400 hover:text-blue-800 font-medium cursor-pointer text-left"
                >
                    <span className="text-blue-400 hover:text-blue-800 font-medium cursor-pointer text-left">{record.name || 'N/A'}</span>
                </button>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            render: (_, record) => getStatusTag(record.status),
        },
        {
            title: 'Tài khoản thụ hưởng',
            key: 'beneficiary_account',
            render: (_, record) => (
                <span className="text-gray-600">{getBeneficiaryAccountDisplay(record)}</span>
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
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900">Phương thức thanh toán</h1>

            </div>
            <div className="flex items-center gap-3 justify-end mb-2">
                <button
                    onClick={() => router.push('/admin/settings/beneficiary-account')}
                    className="!text-blue-500 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                >
                    Quản lý tài khoản ngân hàng
                </button>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => {
                        setSelectedPaymentMethod(null)
                        setModalOpen(true)
                    }}
                >
                    Thêm phương thức
                </Button>
            </div>

            <div className="space-y-6">
                {/* Section 1: Chuyển khoản */}
                <Card className="bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <span className="text-lg font-semibold text-gray-900">Chuyển khoản</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Cập nhật thông tin tài khoản để thanh toán bằng mã VietQR động dễ dàng hơn.
                    </p>
                    {loading ? (
                        <Skeleton active />
                    ) : bankMethods.length > 0 ? (
                        <Table
                            columns={createColumns()}
                            dataSource={bankMethods}
                            rowKey="id"
                            pagination={false}
                            className="bg-white"
                        />
                    ) : (
                        <Empty description="Chưa có phương thức chuyển khoản" className="py-6" />
                    )}
                </Card>

                {/* Section 2: Phương thức khác */}
                <Card className="bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-lg font-semibold text-gray-900">Phương thức khác</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Cập nhật phương thức thanh toán để theo dõi sổ quỹ tiền mặt và tài khoản ngân hàng.
                    </p>
                    {loading ? (
                        <Skeleton active />
                    ) : otherMethods.length > 0 ? (
                        <Table
                            columns={createColumns()}
                            dataSource={otherMethods}
                            rowKey="id"
                            pagination={false}
                            className="bg-white"
                        />
                    ) : (
                        <Empty description="Chưa có phương thức thanh toán khác" className="py-6" />
                    )}
                </Card>
            </div>

            <PaymentMethodModal
                open={isModalOpen}
                loading={createLoading || updateLoading || loadingDetail}
                paymentMethod={selectedPaymentMethod}
                onCancel={() => {
                    setModalOpen(false)
                    setSelectedPaymentMethod(null)
                }}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default PaymentMethodView

