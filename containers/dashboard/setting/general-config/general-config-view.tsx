'use client'

import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Select, Upload, message, UploadFile } from 'antd'
import type { RcCustomRequestOptions } from 'antd/es/upload/interface'
import { Upload as Plus } from 'lucide-react'
import useGeneralConfig from './hooks/use-general-config'
import { UpdateStoreRequest, UploadStoreLogoRequest } from '@/types/request/store'
import attachmentService from '@/services/attachment'
import regionService from '@/services/region'
import { OldRegion } from '@/types/response/old-region'
import Loader from '@/components/Loader'

const GeneralConfigView: React.FC = () => {
    const { store, loading, updating, uploadingLogo, updateStore, uploadLogo } = useGeneralConfig()
    const [form] = Form.useForm()
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [provinces, setProvinces] = useState<OldRegion[]>([])
    const [districts, setDistricts] = useState<OldRegion[]>([])
    const [wards, setWards] = useState<OldRegion[]>([])
    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)
    const [loadingWards, setLoadingWards] = useState(false)
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | undefined>(store?.province_id ? '' : undefined)
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | undefined>(store?.district_id ? '' : undefined)

    useEffect(() => {
        if (store) {
            form.setFieldsValue({
                name: store.name,
                phone: store.phone,
                address: store.address,
                email: store.email,
                province_id: store.province_id,
                ward_id: store.ward_id,
                district_id: undefined, // Will be set after districts are loaded
            })

            if (store.logo_url) {
                setFileList([
                    {
                        uid: '-1',
                        name: 'logo',
                        status: 'done',
                        url: store.logo_url,
                    },
                ])
            }
        }
    }, [store, form])

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                setLoadingProvinces(true)
                const regions = await regionService.getProvinces()
                setProvinces(regions || [])
            } catch (error) {
                console.error('Failed to fetch provinces:', error)
            } finally {
                setLoadingProvinces(false)
            }
        }
        fetchProvinces()
    }, [])

    useEffect(() => {
        if (store?.province_id && provinces.length > 0) {
            const province = provinces.find(p => p.id === store.province_id)
            if (province) {
                setSelectedProvinceCode(province.code)
                fetchDistricts(province.code).then(async (districts) => {
                    // If we have a ward_id, we need to find which district it belongs to
                    if (store.ward_id && districts.length > 0) {
                        // Try to find the ward by fetching wards from each district
                        for (const district of districts) {
                            const wards = await regionService.getWards(district.code)
                            const ward = wards.find(w => w.id === store.ward_id)
                            if (ward) {
                                setSelectedDistrictCode(district.code)
                                setWards(wards)
                                form.setFieldValue('district_id', district.id)
                                break
                            }
                        }
                    }
                })
            }
        }
    }, [store?.province_id, store?.ward_id, provinces, form])

    useEffect(() => {
        if (selectedDistrictCode) {
            fetchWards(selectedDistrictCode)
        }
    }, [selectedDistrictCode])

    const fetchDistricts = async (provinceCode: string) => {
        try {
            setLoadingDistricts(true)
            const regions = await regionService.getDistricts(provinceCode)
            setDistricts(regions || [])
        } catch (error) {
            console.error('Failed to fetch districts:', error)
        } finally {
            setLoadingDistricts(false)
        }
    }

    const fetchWards = async (districtCode: string) => {
        try {
            setLoadingWards(true)
            const regions = await regionService.getWards(districtCode)
            setWards(regions || [])
        } catch (error) {
            console.error('Failed to fetch wards:', error)
        } finally {
            setLoadingWards(false)
        }
    }

    const handleUpload = async (options: RcCustomRequestOptions) => {
        const { file, onSuccess, onError } = options
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('category', 'store')

            const uploaded = await attachmentService.uploadAttachment(formData)
            const uploadedFile = Array.isArray(uploaded) ? uploaded[0] : uploaded

            setFileList([
                {
                    uid: file.uid,
                    name: uploadedFile.filename,
                    status: 'done',
                    url: uploadedFile.url,
                },
            ])

            // Upload logo to store
            await uploadLogo({ attachment_id: uploadedFile.id })

            onSuccess(uploadedFile)
        } catch (err) {
            message.error('Upload logo thất bại')
            onError(err)
        }
    }

    const handleRemove = () => {
        setFileList([])
    }

    const handleSubmit = async (values: UpdateStoreRequest) => {
        try {
            await updateStore(values)
        } catch (error) {
            // Error already handled in hook
        }
    }

    const handleProvinceChange = (provinceId: number) => {
        const province = provinces.find(p => p.id === provinceId)
        if (province) {
            setSelectedProvinceCode(province.code)
            form.setFieldsValue({
                district_id: undefined,
                ward_id: undefined,
            })
            setSelectedDistrictCode(undefined)
            setDistricts([])
            setWards([])
            fetchDistricts(province.code)
        } else {
            setSelectedProvinceCode(undefined)
            form.setFieldsValue({
                district_id: undefined,
                ward_id: undefined,
            })
            setDistricts([])
            setWards([])
        }
    }

    const handleDistrictChange = (districtId: number) => {
        const district = districts.find(d => d.id === districtId)
        if (district) {
            setSelectedDistrictCode(district.code)
            form.setFieldValue('ward_id', undefined)
            setWards([])
            fetchWards(district.code)
        } else {
            setSelectedDistrictCode(undefined)
            form.setFieldValue('ward_id', undefined)
            setWards([])
        }
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
                <h1 className="text-2xl font-semibold text-gray-900">Cấu hình chung</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cửa hàng của bạn</p>
            </div>

            <Card>
                <h2 className="text-lg font-semibold mb-6">Thông tin cửa hàng</h2>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        name: store?.name || '',
                        phone: store?.phone || '',
                        address: store?.address || '',
                        email: store?.email || '',
                        province_id: store?.province_id,
                        district_id: undefined,
                        ward_id: store?.ward_id,
                    }}
                >
                    {/* Logo */}
                    <Form.Item label="Logo">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onRemove={handleRemove}
                            customRequest={handleUpload}
                            maxCount={1}
                            accept="image/*"
                        >
                            {fileList.length < 1 && (
                                <div>
                                    <Plus size={20} />
                                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                </div>
                            )}
                        </Upload>
                        <p className="text-xs text-gray-500 mt-2">(Dung lượng ảnh tối đa 2MB)</p>
                    </Form.Item>

                    {/* Tên cửa hàng */}
                    <Form.Item
                        label="Tên cửa hàng"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
                    >
                        <Input placeholder="Nhập tên cửa hàng" />
                    </Form.Item>

                    {/* Điện thoại */}
                    <Form.Item
                        label="Điện thoại"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    {/* Địa chỉ */}
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    {/* Tỉnh/Thành phố */}
                    <Form.Item
                        label="Tỉnh/Thành phố"
                        name="province_id"
                    >
                        <Select
                            placeholder="Chọn tỉnh thành"
                            loading={loadingProvinces}
                            onChange={handleProvinceChange}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {provinces.map(province => (
                                <Select.Option key={province.id} value={province.id}>
                                    {province.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Quận/Huyện */}
                    <Form.Item
                        label="Quận/Huyện"
                        name="district_id"
                    >
                        <Select
                            placeholder="Chọn quận huyện"
                            loading={loadingDistricts}
                            onChange={handleDistrictChange}
                            allowClear
                            showSearch
                            defaultValue={store?.district_id}
                            disabled={!selectedProvinceCode}
                            filterOption={(input, option) =>
                                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {districts.map(district => (
                                <Select.Option key={district.id} value={district.id}>
                                    {district.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Xã/Phường */}
                    <Form.Item
                        label="Xã/Phường"
                        name="ward_id"
                    >
                        <Select
                            placeholder="Chọn xã phường"
                            loading={loadingWards}
                            allowClear
                            defaultValue={store?.ward_id || ''}
                            showSearch
                            disabled={!selectedDistrictCode}
                            filterOption={(input, option) =>
                                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {wards.map(ward => (
                                <Select.Option key={ward.id} value={ward.id}>
                                    {ward.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Email gửi thông báo */}
                    <Form.Item
                        label="Email gửi thông báo"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={updating}>
                            Lưu thay đổi
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default GeneralConfigView

