'use client'

import React, { useMemo, useState } from 'react'
import { Button, Card, Empty, Skeleton, Tag } from 'antd'
import { CreditCard, Plus, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import usePaymentMethodManagement from './hooks/use-payment-method-management'
import Loader from '@/components/Loader'
import PaymentMethodModal from './components/PaymentMethodModal'
import { CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '@/types/request/payment-method'
import { PaymentMethodDetail } from '@/types/response/payment-method'
import paymentMethodService from '@/services/payment-method'

const providerLabels: Record<string, string> = {
    bank: 'Chuyển khoản',
    cash: 'Tiền mặt',
    cod: 'Thanh toán khi nhận hàng',
}

const providerOrder = ['bank', 'cash', 'cod']

const PaymentMethodView: React.FC = () => {
    const router = useRouter()
    const { paymentMethods, loading, createLoading, updateLoading, createPaymentMethod, updatePaymentMethod } = usePaymentMethodManagement()
    const [isModalOpen, setModalOpen] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodDetail | null>(null)
    const [loadingDetail, setLoadingDetail] = useState(false)

    const groupedPaymentMethods = useMemo(() => {
        const grouped: Record<string, typeof paymentMethods> = {}

        paymentMethods.forEach(method => {
            const providerName = method.provider?.name || 'other'
            if (!grouped[providerName]) {
                grouped[providerName] = []
            }
            grouped[providerName].push(method)
        })

        // Sort by provider order
        const sorted: Array<{ providerName: string; methods: typeof paymentMethods; label: string }> = []

        providerOrder.forEach(name => {
            if (grouped[name]) {
                sorted.push({
                    providerName: name,
                    methods: grouped[name],
                    label: providerLabels[name] || name,
                })
            }
        })

        // Add any remaining providers
        Object.keys(grouped).forEach(name => {
            if (!providerOrder.includes(name)) {
                sorted.push({
                    providerName: name,
                    methods: grouped[name],
                    label: providerLabels[name] || name,
                })
            }
        })

        return sorted
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
            <Tag color="success">Đang hoạt động</Tag>
        ) : (
            <Tag>Tạm tắt</Tag>
        )
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
                <h1 className="text-2xl font-semibold text-gray-900">Quản lý phương thức thanh toán</h1>
                <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý các phương thức thanh toán trong cửa hàng</p>
            </div>

            <Card>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
                    <div>
                        <p className="text-base font-semibold text-gray-900">Danh sách phương thức thanh toán</p>
                        <p className="text-sm text-gray-500">Quản lý các phương thức thanh toán trong cửa hàng của bạn</p>
                    </div>
                    <Button
                        type="primary"
                        icon={<Plus size={16} />}
                        onClick={() => {
                            setSelectedPaymentMethod(null)
                            setModalOpen(true)
                        }}
                    >
                        Thêm phương thức thanh toán
                    </Button>
                </div>

                <div>
                    {loading ? (
                        <div className="py-10">
                            <Skeleton active />
                        </div>
                    ) : groupedPaymentMethods.length > 0 ? (
                        <div className="space-y-6">
                            {groupedPaymentMethods.map(({ providerName, methods, label }) => (
                                <div key={providerName}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                                        {providerName === 'bank' && (
                                            <Button
                                                type="default"
                                                icon={<Settings size={16} />}
                                                onClick={() => router.push('/settings/beneficiary-account')}
                                            >
                                                Quản lý danh sách thụ hưởng
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {methods.map(method => (
                                            <div
                                                key={method.id}
                                                className="flex flex-col gap-2 rounded border border-gray-100 px-4 py-3 md:flex-row md:items-center md:justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handlePaymentMethodClick(method.id!)}
                                            >
                                                <div className="flex items-start gap-3 flex-1">
                                                    <CreditCard className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-semibold text-gray-900">{method.name || 'N/A'}</p>
                                                            {getStatusTag(method.status)}
                                                        </div>
                                                        {method.description && (
                                                            <p className="text-sm text-gray-600 line-clamp-2">{method.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Cửa hàng của bạn chưa có phương thức thanh toán nào" className="py-10" />
                    )}
                </div>
            </Card>

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

