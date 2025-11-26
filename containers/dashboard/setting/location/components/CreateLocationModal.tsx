'use client'

import React, { useEffect, useState } from 'react'
import { Form, Input, Modal, Select, Checkbox } from 'antd'
import { CreateLocationRequest } from '@/types/request/location'
import { ELocationStatus } from '@/types/enums/enum'
import regionService from '@/services/region'
import { TRegionResponse } from '@/types/response/region'
import { ERegionType } from '@/types/request/region'
import { OldRegion } from '@/types/response/old-region'

type Props = {
    open: boolean
    loading: boolean
    onCancel: () => void
    onSubmit: (values: CreateLocationRequest) => Promise<void> | void
}

const CreateLocationModal: React.FC<Props> = ({ open, loading, onCancel, onSubmit }) => {
    const [form] = Form.useForm<CreateLocationRequest>()
    const [provinces, setProvinces] = useState<TRegionResponse[]>([])
    const [districts, setDistricts] = useState<OldRegion[]>([])
    const [wards, setWards] = useState<OldRegion[]>([])
    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>()
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>()

    useEffect(() => {
        if (open) {
            form.resetFields()
            setSelectedProvinceCode(undefined)
            setSelectedDistrictCode(undefined)
            setDistricts([])
            setWards([])
            fetchProvinces()
        }
    }, [open, form])

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
            const data = await regionService.getListRegions({ type: ERegionType.PROVINCE })
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
            const data = await regionService.getListOldRegions({ type: 3, parent_code: provinceCode })
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
            await onSubmit(values)
            form.resetFields()
        } catch {
            // validation handled by form
        }
    }

    return (
        <Modal
            title="Thêm mới chi nhánh"
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okButtonProps={{ loading }}
            destroyOnClose
            width={800}
            style={{ top: 20 }}
            bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
        >
            <Form form={form} layout="vertical" initialValues={{ status: ELocationStatus.ACTIVE, inventory_management: false, fulfill_order: false, default_location: false }}>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <Form.Item
                    label="Địa chỉ"
                    name="address"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                >
                    <Input placeholder="Nhập địa chỉ chi tiết" />
                </Form.Item>
                <Form.Item label="Mã bưu điện" name="zip">
                    <Input placeholder="Nhập mã bưu điện" />
                </Form.Item>
                <Form.Item label="Trạng thái" name="status">
                    <Select>
                        <Select.Option value={ELocationStatus.ACTIVE}>Đang hoạt động</Select.Option>
                        <Select.Option value={ELocationStatus.INACTIVE}>Tạm tắt</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Chi nhánh mặc định" name="default_location" valuePropName="checked">
                    <Checkbox>Chi nhánh mặc định</Checkbox>
                </Form.Item>
                <Form.Item label="Địa chỉ lấy hàng" name="fulfill_order" valuePropName="checked">
                    <Checkbox>Địa chỉ lấy hàng</Checkbox>
                </Form.Item>
                <Form.Item label="Thiết lập làm chi nhánh quản lý kho" name="inventory_management" valuePropName="checked">
                    <Checkbox>Thiết lập làm chi nhánh quản lý kho</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default CreateLocationModal

