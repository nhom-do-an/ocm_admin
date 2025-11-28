'use client'

import React, { useEffect } from 'react'
import { Form, Input, Modal, Select } from 'antd'
import { CreateBeneficiaryAccountRequest, UpdateBeneficiaryAccountRequest } from '@/types/request/payment-method'
import { BeneficiaryAccountDetail } from '@/types/response/payment-method'
import useBeneficiaryAccountManagement from '../hooks/use-beneficiary-account-management'
import Image from 'next/image'

type Props = {
    open: boolean
    loading: boolean
    beneficiaryAccount?: BeneficiaryAccountDetail | null
    onCancel: () => void
    onSubmit: (values: CreateBeneficiaryAccountRequest | UpdateBeneficiaryAccountRequest) => Promise<void> | void
    onSuccess?: (account: { id: number; account_name: string; account_number: string }) => void
}

const BeneficiaryAccountModal: React.FC<Props> = ({ open, loading, beneficiaryAccount, onCancel, onSubmit, onSuccess }) => {
    const isEditMode = !!beneficiaryAccount
    const [form] = Form.useForm<CreateBeneficiaryAccountRequest | UpdateBeneficiaryAccountRequest>()
    const { banks, loadingBanks, fetchBanks } = useBeneficiaryAccountManagement()

    useEffect(() => {
        if (open) {
            const loadData = async () => {
                const banksData = await fetchBanks()
                if (beneficiaryAccount && banksData.length > 0) {
                    // Try to find bank by bin or name
                    let bankId: number | undefined
                    if (beneficiaryAccount.bank_bin) {
                        const bank = banksData.find(b => b.bin === beneficiaryAccount.bank_bin)
                        bankId = bank?.id
                    } else if (beneficiaryAccount.bank_name) {
                        const bank = banksData.find(b => b.name === beneficiaryAccount.bank_name)
                        bankId = bank?.id
                    }

                    form.setFieldsValue({
                        bank_id: bankId,
                        account_name: beneficiaryAccount.account_name,
                        account_number: beneficiaryAccount.account_number,
                        note: beneficiaryAccount.note,
                    })
                } else if (!beneficiaryAccount) {
                    form.resetFields()
                }
            }
            loadData()
        }
    }, [open, beneficiaryAccount, form, fetchBanks])


    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (isEditMode && beneficiaryAccount?.id) {
                await onSubmit({ ...values, id: beneficiaryAccount.id } as UpdateBeneficiaryAccountRequest)
            } else {
                await onSubmit(values as CreateBeneficiaryAccountRequest)
                if (onSuccess && values.account_name && values.account_number) {
                    onSuccess({
                        id: 0, // Will be updated after creation
                        account_name: values.account_name,
                        account_number: values.account_number,
                    })
                }
            }
            form.resetFields()
        } catch {
            // validation handled by form
        }
    }

    return (
        <Modal
            title={isEditMode ? 'Chỉnh sửa tài khoản thụ hưởng' : 'Thêm tài khoản thụ hưởng'}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okButtonProps={{ loading }}
            destroyOnHidden
            width={600}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" className="[&_.ant-form-item]:mb-4!">
                <Form.Item
                    label="Ngân hàng"
                    name="bank_id"
                    rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}
                >
                    <Select
                        placeholder="Chọn ngân hàng"
                        loading={loadingBanks}
                        showSearch
                        filterOption={(input, option) => {
                            if (option?.short_name?.toLowerCase().includes(input.toLowerCase()) || option?.name?.toLocaleLowerCase().includes(input.toLowerCase())) {
                                return true
                            }
                            return false
                        }}
                        options={banks.map(bank => ({
                            label: (
                                <div className="flex items-center gap-2">
                                    {bank.logo && (
                                        <Image src={bank.logo} alt={bank.name || ""} className="w-6 h-6 object-contain" width={100} height={50} />
                                    )}
                                    <span>{bank.name}</span>
                                </div>
                            ),
                            name: bank.name,
                            short_name: bank.short_name,
                            value: bank.id,
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    label="Tên tài khoản thụ hưởng"
                    name="account_name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản thụ hưởng' }]}
                >
                    <Input placeholder="Nhập tên tài khoản thụ hưởng" />
                </Form.Item>
                <Form.Item
                    label="Số tài khoản thụ hưởng"
                    name="account_number"
                    rules={[{ required: true, message: 'Vui lòng nhập số tài khoản thụ hưởng' }]}
                >
                    <Input placeholder="Nhập số tài khoản thụ hưởng" />
                </Form.Item>
                <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea placeholder="Nhập ghi chú" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default BeneficiaryAccountModal

