'use client'

import React, { useEffect, useState } from 'react'
import { Form, Input, Modal, Select, Checkbox } from 'antd'
import { UpdateLocationRequest } from '@/types/request/location'
import { LocationDetail } from '@/types/response/location'
import { ELocationStatus } from '@/types/enums/enum'
import regionService from '@/services/region'
import { TRegionResponse } from '@/types/response/region'
import { ERegionType } from '@/types/request/region'
import { OldRegion } from '@/types/response/old-region'

type Props = {
    open: boolean
    loading: boolean
    location?: LocationDetail | null
    onCancel: () => void
    onSubmit: (values: UpdateLocationRequest) => Promise<void> | void
}

const LocationDetailModal: React.FC<Props> = ({ open, loading, location, onCancel, onSubmit }) => {
    const [form] = Form.useForm<UpdateLocationRequest>()
    const [provinces, setProvinces] = useState<TRegionResponse[]>([])
    const [districts, setDistricts] = useState<OldRegion[]>([])
    const [wards, setWards] = useState<OldRegion[]>([])
    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>()
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>()

    useEffect(() => {
        if (open && location) {
            form.setFieldsValue({
                id: location.id,
                name: location.name,
                code: location.code,
                phone: location.phone,
                email: location.email,
                address: location.address,
                zip: location.zip,
                status: location.status,
                default_location: location.default_location,
                fulfill_order: location.fulfill_order,
                inventory_management: location.inventory_management,
                province_code: location.province_code,
                district_code: location.district_code,
                ward_code: location.ward_code,
            })
            setSelectedProvinceCode(location.province_code)
            const districtCode = location.district_code
            setSelectedDistrictCode(districtCode)
            if (location.province_code) {
                fetchDistricts(location.province_code).then(() => {
                    if (districtCode) {
                        fetchWards(districtCode)
                    }
                })
            }
        } else if (open) {
            form.resetFields()
            setSelectedProvinceCode(undefined)
            setSelectedDistrictCode(undefined)
            setDistricts([])
            setWards([])
        }
        if (open) {
            fetchProvinces()
        }
    }, [open, location, form])

    // Watch for default_location changes
    const defaultLocation = Form.useWatch('default_location', form)
    useEffect(() => {
        if (defaultLocation) {
            form.setFieldsValue({
                fulfill_order: true,
                inventory_management: true,
            })
        }
    }, [defaultLocation, form])

    const fetchProvinces = async () => {
        setLoadingProvinces(true)
        try {
            const data = await regionService.getListOldRegions({ type: ERegionType.PROVINCE })
            setProvinces(data || [])
        } catch (error) {
            console.error('Failed to fetch provinces', error)
        } finally {
            setLoadingProvinces(false)
        }
    }

    const fetchDistricts = async (provinceCode: string) => {
        setLoadingDistricts(true)
        try {
            const data = await regionService.getListOldRegions({ type: ERegionType.DISTRICT, parent_code: provinceCode })
            setDistricts(data || [])
        } catch (error) {
            console.error('Failed to fetch districts', error)
        } finally {
            setLoadingDistricts(false)
        }
    }

    const fetchWards = async (districtCode: string) => {
        setLoadingWards(true)
        try {
            const data = await regionService.getListOldRegions({ type: 4, parent_code: districtCode })
            setWards(data || [])
        } catch (error) {
            console.error('Failed to fetch wards', error)
        } finally {
            setLoadingWards(false)
        }
    }

    const handleProvinceChange = (value: string) => {
        setSelectedProvinceCode(value)
        setSelectedDistrictCode(undefined)
        form.setFieldsValue({ district_code: undefined, ward_code: undefined })
        setDistricts([])
        setWards([])
        if (value) {
            fetchDistricts(value)
        }
    }

    const handleDistrictChange = (value: string) => {
        setSelectedDistrictCode(value)
        form.setFieldsValue({ ward_code: undefined })
        setWards([])
        if (value) {
            fetchWards(value)
        }
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields()
            if (!location?.id) {
                console.error('Location ID is missing')
                return
            }
            await onSubmit({ ...values, id: location.id })
            form.resetFields()
        } catch {
            // validation handled by form
        }
    }

    return (
        <Modal
            title="Chi tiết chi nhánh"
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okButtonProps={{ loading }}
            destroyOnClose
            width={600}
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" className="[&_.ant-form-item]:mb-4!">
                <div className="grid grid-cols-2 gap-2">
                    <Form.Item
                        label="Tên chi nhánh"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
                    >
                        <Input placeholder="Nhập tên chi nhánh" />
                    </Form.Item>
                    <Form.Item label="Mã chi nhánh" name="code">
                        <Input placeholder="Nhập mã chi nhánh" />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" name="phone">
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input placeholder="Nhập email" />
                    </Form.Item>
                    <Form.Item
                        label="Tỉnh/Thành phố"
                        name="province_code"
                        rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố' }]}
                    >
                        <Select
                            placeholder="Chọn tỉnh thành"
                            loading={loadingProvinces}
                            onChange={handleProvinceChange}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={provinces.map(p => ({ label: p.name, value: p.code }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Quận/Huyện"
                        name="district_code"
                    >
                        <Select
                            placeholder="Chọn quận huyện"
                            loading={loadingDistricts}
                            disabled={!selectedProvinceCode}
                            onChange={handleDistrictChange}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={districts.map(d => ({ label: d.name, value: d.code }))}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Phường xã"
                        name="ward_code"
                        rules={[{ required: true, message: 'Vui lòng chọn phường xã' }]}
                    >
                        <Select
                            placeholder="Chọn phường xã"
                            loading={loadingWards}
                            disabled={!selectedDistrictCode}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={wards.map(w => ({ label: w.name, value: w.code }))}
                        />
                    </Form.Item>
                    <Form.Item label="Mã bưu điện" name="zip">
                        <Input placeholder="Nhập mã bưu điện" />
                    </Form.Item>
                </div>
                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                    <Input placeholder="Nhập địa chỉ chi tiết" />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status">
                    <Select>
                        <Select.Option value={ELocationStatus.ACTIVE}>Đang hoạt động</Select.Option>
                        <Select.Option value={ELocationStatus.INACTIVE}>Dừng hoạt động</Select.Option>
                    </Select>
                </Form.Item>
                <div className="grid grid-cols-2 gap-2">
                    <Form.Item name="default_location" valuePropName="checked">
                        <Checkbox>Chi nhánh mặc định</Checkbox>
                    </Form.Item>
                    <Form.Item name="fulfill_order" valuePropName="checked">
                        <Checkbox>Địa chỉ lấy hàng</Checkbox>
                    </Form.Item>
                    <Form.Item name="inventory_management" valuePropName="checked">
                        <Checkbox>Thiết lập làm chi nhánh quản lý kho</Checkbox>
                    </Form.Item>
                </div>

            </Form>
        </Modal>
    )
}

export default LocationDetailModal

