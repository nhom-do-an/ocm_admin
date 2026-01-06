'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Select, Button, Spin } from 'antd'
import { Download } from 'lucide-react'
import beneficiaryAccountService from '@/services/beneficiary-account'
import orderService from '@/services/order'
import { BeneficiaryAccount } from '@/types/response/payment-method'
import { OrderQrResponse } from '@/types/response/order'
import { useGlobalNotification } from '@/hooks/useNotification'
import Image from 'next/image'

interface OrderQRPaymentModalProps {
    open: boolean
    onCancel: () => void
    orderId: number
    amount: number
}

const OrderQRPaymentModal: React.FC<OrderQRPaymentModalProps> = ({
    open,
    onCancel,
    orderId,
    amount,
}) => {
    const notification = useGlobalNotification()
    const [beneficiaryAccounts, setBeneficiaryAccounts] = useState<BeneficiaryAccount[]>([])
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
    const [qrData, setQrData] = useState<OrderQrResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingQR, setLoadingQR] = useState(false)

    useEffect(() => {
        if (open) {
            fetchBeneficiaryAccounts()
        } else {
            // Reset state khi đóng modal
            setSelectedAccountId(null)
            setQrData(null)
        }
    }, [open])

    useEffect(() => {
        if (selectedAccountId && open) {
            fetchQRCode(selectedAccountId)
        }
    }, [selectedAccountId, open])

    const fetchBeneficiaryAccounts = async () => {
        setLoading(true)
        try {
            const data = await beneficiaryAccountService.getListBeneficiaryAccounts()
            setBeneficiaryAccounts(data || [])
            // Tự động chọn tài khoản đầu tiên nếu có
            if (data && data.length > 0) {
                setSelectedAccountId(data[0].id)
            }
        } catch (error) {
            console.error('Error fetching beneficiary accounts:', error)
            notification.error({ message: 'Không thể tải danh sách tài khoản thụ hưởng' })
        } finally {
            setLoading(false)
        }
    }

    const fetchQRCode = async (beneficiaryAccountId: number) => {
        setLoadingQR(true)
        try {
            const data = await orderService.getOrderQRPayment({
                order_id: orderId,
                beneficiary_account_id: beneficiaryAccountId,
            })
            setQrData(data)
        } catch (error) {
            console.error('Error fetching QR code:', error)
            notification.error({ message: 'Không thể tải mã QR' })
            setQrData(null)
        } finally {
            setLoadingQR(false)
        }
    }

    const handleDownloadQR = () => {
        if (!qrData?.qr_url) return

        const link = document.createElement('a')
        link.href = qrData.qr_url
        link.download = `QR_Order_${orderId}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const formatCurrency = (amount?: number) => {
        if (!amount) return '0₫'
        return `${amount.toLocaleString('vi-VN')}₫`
    }

    return (
        <Modal
            title="Lấy mã QR thanh toán"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <div className="grid grid-cols-2 gap-6 mt-4">
                {/* Phần bên trái - Select tài khoản */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn tài khoản thụ hưởng
                        </label>
                        <Select
                            className="w-full h-[50px]!"
                            placeholder="Chọn tài khoản thụ hưởng"
                            loading={loading}
                            value={selectedAccountId}
                            onChange={setSelectedAccountId}
                            options={beneficiaryAccounts.map(account => ({
                                label: (
                                    <div className="flex items-center gap-2 ">
                                        {account.bank_logo && (
                                            <div className="w-8 rounded overflow-hidden flex items-center justify-center object-cover">
                                                <Image
                                                    src={account.bank_logo}
                                                    alt={account.bank_name || ''}
                                                    width={24}
                                                    height={24}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{account.account_name}</span>
                                            <span className="text-xs text-gray-500">
                                                {account.bank_short_name} - {account.account_number}
                                            </span>
                                        </div>
                                    </div>
                                ),
                                value: account.id,
                            }))}
                        />
                    </div>

                    {qrData && (
                        <div className="space-y-3 mt-6">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Tên tài khoản</span>
                                    <span className="text-sm font-medium text-gray-900">{qrData.account_name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Số tài khoản</span>
                                    <span className="text-sm font-medium text-gray-900">{qrData.account_number}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Số tiền</span>
                                    <span className="text-sm font-semibold text-blue-600">{formatCurrency(qrData.amount)}</span>
                                </div>
                                <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Nội dung chuyển khoản</span>
                                    <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">{qrData.description}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Phần bên phải - Mã QR */}
                <div className="flex flex-col items-center justify-center">
                    {loadingQR ? (
                        <div className="flex items-center justify-center h-64">
                            <Spin size="large" />
                        </div>
                    ) : qrData?.qr_url ? (
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-center">
                                <Image
                                    src={qrData.qr_url}
                                    alt="QR Code"
                                    width={280}
                                    height={280}
                                    className="w-[280px] h-[280px] object-contain"
                                />
                            </div>
                            <Button
                                type="primary"
                                icon={<Download size={16} />}
                                onClick={handleDownloadQR}
                                className="w-full"
                            >
                                Tải xuống mã QR
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            {selectedAccountId ? 'Không thể tải mã QR' : 'Vui lòng chọn tài khoản thụ hưởng'}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    )
}

export default OrderQRPaymentModal
