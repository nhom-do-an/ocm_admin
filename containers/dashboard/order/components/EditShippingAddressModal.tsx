'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Form, Input, Select, Alert } from 'antd'
import { AddressDetail } from '@/types/response/customer'
import customerService from '@/services/customer'
import regionService from '@/services/region'
import { OldRegion } from '@/types/response/old-region'

const { Option } = Select

interface EditShippingAddressModalProps {
    open: boolean
    customerId?: number
    initialAddress?: AddressDetail | null
    onCancel: () => void
    onSave: (address: AddressDetail | null) => void
}

const EditShippingAddressModal: React.FC<EditShippingAddressModalProps> = ({
    open,
    customerId,
    initialAddress,
    onCancel,
    onSave,
}) => {
    const [form] = Form.useForm<AddressDetail>()
    const [addressList, setAddressList] = useState<AddressDetail[]>([])
    const [loadingAddresses, setLoadingAddresses] = useState(false)
    const [provinces, setProvinces] = useState<OldRegion[]>([])
    const [districts, setDistricts] = useState<OldRegion[]>([])
    const [wards, setWards] = useState<OldRegion[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>()

    useEffect(() => {
        if (!open) return
        form.resetFields()
        if (initialAddress) {
            form.setFieldsValue(initialAddress)
        }
        if (initialAddress?.province_code) {
            fetchDistricts(initialAddress.province_code)
        }
        if (initialAddress?.district_code) {
            fetchWards(initialAddress.district_code)
        }
        setSelectedAddressId(undefined)
    }, [open, initialAddress, form])

    useEffect(() => {
        if (!open) return
        fetchAddresses()
        fetchProvinces()
    }, [open, customerId])

    const fetchAddresses = async () => {
        if (!customerId) {
            setAddressList([])
            return
        }
        setLoadingAddresses(true)
        try {
            const data = await customerService.getCustomerAddressList(customerId)
            setAddressList(data || [])
        } catch (error) {
            console.error('Failed to load customer addresses', error)
            setAddressList([])
        } finally {
            setLoadingAddresses(false)
        }
    }

    const fetchProvinces = async () => {
        try {
            const data = await regionService.getListOldRegions({ type: 2 })
            setProvinces(data)
        } catch (error) {
            console.error('Failed to load provinces', error)
        }
    }

    const fetchDistricts = async (provinceCode: string) => {
        if (!provinceCode) {
            setDistricts([])
            return
        }
        try {
            const data = await regionService.getListOldRegions({ type: 3, parent_code: provinceCode })
            setDistricts(data)
        } catch (error) {
            console.error('Failed to load districts', error)
        }
    }

    const fetchWards = async (districtCode: string) => {
        if (!districtCode) {
            setWards([])
            return
        }
        try {
            const data = await regionService.getListOldRegions({ type: 4, parent_code: districtCode })
            setWards(data)
        } catch (error) {
            console.error('Failed to load wards', error)
        }
    }

    const handleSelectAddress = (value?: number) => {
        setSelectedAddressId(value)
        if (!value) return
        const selected = addressList.find(addr => addr.id === value)
        if (selected) {
            form.setFieldsValue(selected)
            if (selected.province_code) {
                fetchDistricts(selected.province_code)
            }
            if (selected.district_code) {
                fetchWards(selected.district_code)
            } else {
                setWards([])
            }
        }
    }

    const provinceOptions = useMemo(
        () => provinces.map(province => ({ label: province.name, value: province.code })),
        [provinces]
    )

    const districtOptions = useMemo(
        () => districts.map(district => ({ label: district.name, value: district.code })),
        [districts]
    )

    const wardOptions = useMemo(
        () => wards.map(ward => ({ label: ward.name, value: ward.code })),
        [wards]
    )

    const handleProvinceChange = (value?: string) => {
        const province = provinces.find(item => item.code === value)
        form.setFieldsValue({
            province_code: value,
            province_name: province?.name,
            district_code: undefined,
            district_name: undefined,
            ward_code: undefined,
            ward_name: undefined,
        })
        setDistricts([])
        setWards([])
        if (value) {
            fetchDistricts(value)
        }
    }

    const handleDistrictChange = (value?: string) => {
        const district = districts.find(item => item.code === value)
        form.setFieldsValue({
            district_code: value,
            district_name: district?.name,
            ward_code: undefined,
            ward_name: undefined,
        })
        setWards([])
        if (value) {
            fetchWards(value)
        }
    }

    const handleWardChange = (value?: string) => {
        const ward = wards.find(item => item.code === value)
        form.setFieldsValue({
            ward_code: value,
            ward_name: ward?.name,
        })
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            onSave(values)
        } catch (error) {
            // validation errors handled by antd
        }
    }

    const renderAddressOptionLabel = (addr: AddressDetail) => {
        const name = [addr.first_name, addr.last_name].filter(Boolean).join(' ')
        const location = [addr.address, addr.province_name, addr.district_name, addr.ward_name]
            .filter(Boolean)
            .join(', ')
        return `${name || 'Không tên'} - ${location}`
    }

    return (
        <Modal
            open={open}
            title="Sửa địa chỉ giao hàng"
            onCancel={onCancel}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            width={720}
        >
            <Alert
                type="info"
                message={
                    <span>
                        Nếu hãng vận chuyển của bạn chưa hỗ trợ địa chỉ mới, bạn có thể đổi về địa chỉ cũ để thực hiện đầy đủ đơn vận chuyển&nbsp;
                        <a href="#" className="text-blue-600">tại đây</a>.
                    </span>
                }
                className="mb-4"
                showIcon
            />
            <Form form={form} layout="vertical">
                <Form.Item label="Chọn địa chỉ">
                    <Select
                        placeholder="Chọn địa chỉ"
                        loading={loadingAddresses}
                        value={selectedAddressId}
                        onChange={handleSelectAddress}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                    >
                        {addressList.map(address => (
                            <Option key={address.id} value={address.id} label={renderAddressOptionLabel(address)}>
                                {renderAddressOptionLabel(address)}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Họ" name="first_name">
                        <Input placeholder="Nhập họ" />
                    </Form.Item>
                    <Form.Item label="Tên" name="last_name">
                        <Input placeholder="Nhập tên" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Form.Item label="Postal / Zip Code" name="zip">
                        <Input placeholder="Nhập Postal / Zip Code" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Tỉnh/Thành phố" name="province_code" rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}>
                        <Select
                            placeholder="Chọn tỉnh/thành phố"
                            options={provinceOptions}
                            onChange={handleProvinceChange}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                    <Form.Item label="Quận/Huyện" name="district_code" rules={[{ required: true, message: 'Vui lòng chọn quận/huyện' }]}>
                        <Select
                            placeholder="Chọn quận/huyện"
                            options={districtOptions}
                            onChange={handleDistrictChange}
                            disabled={!form.getFieldValue('province_code')}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Phường/Xã" name="ward_code" rules={[{ required: true, message: 'Vui lòng chọn phường/xã' }]}>
                        <Select
                            placeholder="Chọn phường/xã"
                            options={wardOptions}
                            onChange={handleWardChange}
                            disabled={!form.getFieldValue('district_code')}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                    <Form.Item label="Địa chỉ cụ thể" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể' }]}>
                        <Input placeholder="Nhập địa chỉ cụ thể" />
                    </Form.Item>
                </div>
                <Form.Item name="province_name" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="district_name" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="ward_name" hidden>
                    <Input />
                </Form.Item>
                <Form.Item name="email" hidden>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default EditShippingAddressModal

