'use client'

import React, { useEffect, useState } from 'react'
import { Form, Input, Modal, Select, Collapse, Button, Checkbox } from 'antd'
import { CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '@/types/request/payment-method'
import { PaymentMethodDetail, PaymentProvider, BeneficiaryAccount } from '@/types/response/payment-method'
import paymentMethodService from '@/services/payment-method'
import beneficiaryAccountService from '@/services/beneficiary-account'
import BeneficiaryAccountModal from './BeneficiaryAccountModal'
import { Plus, ChevronDown } from 'lucide-react'
import Image from 'next/image'

type Props = {
    open: boolean
    loading: boolean
    paymentMethod?: PaymentMethodDetail | null
    onCancel: () => void
    onSubmit: (values: CreatePaymentMethodRequest | UpdatePaymentMethodRequest) => Promise<void> | void
}

const providerLabels: Record<string, string> = {
    bank: 'Chuyển khoản',
    cash: 'Tiền mặt',
    cod: 'Thanh toán khi nhận hàng',
}

const PaymentMethodModal: React.FC<Props> = ({ open, loading, paymentMethod, onCancel, onSubmit }) => {
    const isEditMode = !!paymentMethod
    const [form] = Form.useForm<CreatePaymentMethodRequest | UpdatePaymentMethodRequest>()
    const [providers, setProviders] = useState<PaymentProvider[]>([])
    const [beneficiaryAccounts, setBeneficiaryAccounts] = useState<BeneficiaryAccount[]>([])
    const [loadingProviders, setLoadingProviders] = useState(false)
    const [loadingAccounts, setLoadingAccounts] = useState(false)
    const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false)
    const [selectedProviderName, setSelectedProviderName] = useState<string>()

    const selectedProvider = providers.find(p => p.name === selectedProviderName)
    const isBankProvider = selectedProvider?.name === 'bank'

    useEffect(() => {
        if (open) {
            const loadData = async () => {
                await fetchProviders()
                if (paymentMethod) {
                    form.setFieldsValue({
                        name: paymentMethod.name,
                        description: paymentMethod.description,
                        status: paymentMethod.status || 'active',
                        auto_posting_receipt: paymentMethod.auto_posting_receipt || false,
                        provider_id: paymentMethod.provider_id,
                        beneficiary_account_id: paymentMethod.beneficiary_account_id,
                    })
                    const providerName = paymentMethod.provider?.name
                    setSelectedProviderName(providerName)
                    // If provider is bank, fetch beneficiary accounts
                    if (providerName === 'bank') {
                        await fetchBeneficiaryAccounts()
                    }
                } else {
                    form.resetFields()
                    form.setFieldsValue({
                        status: 'active',
                        auto_posting_receipt: false,
                    })
                    setSelectedProviderName(undefined)
                }
            }
            loadData()
        }
    }, [open, paymentMethod, form])

    useEffect(() => {
        if (open && isBankProvider && beneficiaryAccounts.length === 0) {
            fetchBeneficiaryAccounts()
        }
    }, [open, isBankProvider])

    const fetchProviders = async () => {
        setLoadingProviders(true)
        try {
            const data = await paymentMethodService.getListProviders()
            setProviders(data || [])
        } catch (error) {
            console.error('Failed to fetch providers', error)
        } finally {
            setLoadingProviders(false)
        }
    }

    const fetchBeneficiaryAccounts = async () => {
        setLoadingAccounts(true)
        try {
            const data = await beneficiaryAccountService.getListBeneficiaryAccounts()
            setBeneficiaryAccounts(data || [])
        } catch (error) {
            console.error('Failed to fetch beneficiary accounts', error)
        } finally {
            setLoadingAccounts(false)
        }
    }

    const handleProviderChange = async (providerId: number) => {
        const provider = providers.find(p => p.id === providerId)
        setSelectedProviderName(provider?.name)
        if (provider?.name === 'bank') {
            // Fetch beneficiary accounts when bank is selected
            await fetchBeneficiaryAccounts()
        } else {
            form.setFieldsValue({ beneficiary_account_id: undefined })
        }
    }

    const handleBeneficiaryAccountSuccess = async (account: { id: number; account_name: string; account_number: string }) => {
        // Refresh the list of beneficiary accounts
        const updatedAccounts = await beneficiaryAccountService.getListBeneficiaryAccounts()
        setBeneficiaryAccounts(updatedAccounts || [])

        // Find the newly created account and set it
        const newAccount = updatedAccounts.find(acc =>
            acc.account_name === account.account_name &&
            acc.account_number === account.account_number
        )
        if (newAccount) {
            form.setFieldsValue({ beneficiary_account_id: newAccount.id })
        }
        setIsBeneficiaryModalOpen(false)
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (isEditMode && paymentMethod?.id) {
                await onSubmit({ ...values, id: paymentMethod.id } as UpdatePaymentMethodRequest)
            } else {
                await onSubmit(values as CreatePaymentMethodRequest)
            }
            form.resetFields()
        } catch {
            // validation handled by form
        }
    }

    const beneficiaryAccountId = Form.useWatch('beneficiary_account_id', form)

    return (
        <>
            <Modal
                title={isEditMode ? 'Chi tiết phương thức thanh toán' : 'Thêm phương thức thanh toán'}
                open={open}
                onCancel={onCancel}
                onOk={handleOk}
                okButtonProps={{ loading }}
                destroyOnHidden
                width={600}
                style={{ top: 20 }}
                styles={{ body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' } }}
            >
                <Form form={form} layout="vertical" className="[&_.ant-form-item]:mb-4!">
                    <Form.Item
                        label="Tên phương thức thanh toán"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phương thức thanh toán' }]}
                    >
                        <Input placeholder="Nhập tên phương thức thanh toán" />
                    </Form.Item>

                    <Form.Item
                        label="Loại phương thức thanh toán"
                        name="provider_id"
                        rules={[{ required: true, message: 'Vui lòng chọn loại phương thức thanh toán' }]}
                    >
                        <Select
                            placeholder="Chọn loại phương thức thanh toán"
                            loading={loadingProviders}
                            onChange={handleProviderChange}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={providers.map(provider => ({
                                label: providerLabels[provider.name || ''] || provider.name,
                                value: provider.id,
                            }))}
                        />
                    </Form.Item>

                    {selectedProvider && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Loại phương thức:</span>{' '}
                                {providerLabels[selectedProvider.name || ''] || selectedProvider.name}
                            </p>
                        </div>
                    )}

                    {isBankProvider && (
                        <Form.Item
                            label="Tài khoản thụ hưởng"
                            name="beneficiary_account_id"
                        >
                            <Select
                                className={`${beneficiaryAccountId && "h-15!"}`}
                                placeholder="Chọn tài khoản thụ hưởng"
                                loading={loadingAccounts}
                                showSearch
                                filterOption={(input, option) => {
                                    const label = typeof option?.label === 'string' ? option.label : ''
                                    return label.toLowerCase().includes(input.toLowerCase())
                                }}
                                popupRender={(menu) => (
                                    <>
                                        {menu}
                                        <div className="p-2 border-t">
                                            <Button
                                                type="link"
                                                icon={<Plus size={16} />}
                                                onClick={() => setIsBeneficiaryModalOpen(true)}
                                                className="w-full"
                                            >
                                                Thêm tài khoản thụ hưởng
                                            </Button>
                                        </div>
                                    </>
                                )}
                                options={beneficiaryAccounts.map(account => ({
                                    label: (
                                        <div className="flex items-center gap-2">
                                            {account.bank_logo && (
                                                <Image
                                                    src={account.bank_logo}
                                                    alt={account.bank_short_name || ""}
                                                    className="w-6 h-6 object-contain"
                                                    width={100}
                                                    height={50}
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium">{account.bank_short_name}</div>
                                                <div className="text-xs text-gray-500">{account.account_name} - {account.account_number}</div>
                                            </div>
                                        </div>
                                    ),
                                    value: account.id,
                                }))}
                            />
                        </Form.Item>
                    )}

                    <Collapse
                        items={[
                            {
                                key: 'description',
                                label: (
                                    <div className="flex items-center gap-2">
                                        <span>Hướng dẫn thanh toán</span>
                                        <ChevronDown size={16} />
                                    </div>
                                ),
                                children: (
                                    <Form.Item name="description" noStyle>
                                        <Input.TextArea
                                            placeholder="Nhập hướng dẫn thanh toán"
                                            rows={4}
                                        />
                                    </Form.Item>
                                ),
                            },
                        ]}
                        className="mb-4"
                    />

                    <Form.Item label="Trạng thái" name="status">
                        <Select>
                            <Select.Option value="active">Đang hoạt động</Select.Option>
                            <Select.Option value="inactive">Tạm tắt</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <BeneficiaryAccountModal
                open={isBeneficiaryModalOpen}
                loading={false}
                onCancel={() => setIsBeneficiaryModalOpen(false)}
                onSubmit={async (values) => {
                    if ('id' in values) {
                        await beneficiaryAccountService.updateBeneficiaryAccount(values)
                        await fetchBeneficiaryAccounts()
                        setIsBeneficiaryModalOpen(false)
                    } else {
                        const newAccount = await beneficiaryAccountService.createBeneficiaryAccount(values)
                        await handleBeneficiaryAccountSuccess({
                            id: newAccount.id,
                            account_name: newAccount.account_name || '',
                            account_number: newAccount.account_number || '',
                        })
                    }
                }}
                onSuccess={handleBeneficiaryAccountSuccess}
            />
        </>
    )
}

export default PaymentMethodModal

