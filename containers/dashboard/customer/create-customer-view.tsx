'use client'
import React, { useState, useEffect, useCallback } from 'react'
import {
    Input,
    Button,
    Card,
    Form,
    Select,
    Radio,
    DatePicker,
} from 'antd'
import { ArrowLeft } from 'lucide-react'
import { useCreateCustomer } from './hooks/use-create-customer'
import { CreateCustomerRequest } from '@/types/request/customer'
import { useRouter } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'

const { TextArea } = Input

interface FormValues {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    gender?: 'male' | 'female' | 'other';
    dob?: Dayjs;
    note?: string;
    address_info?: {
        first_name: string;
        last_name: string;
        phone: string;
        email?: string;
        address: string;
        province_code?: string;
        district_code?: string;
        ward_code?: string;
        zip?: string;
    };
}

const CreateCustomerView: React.FC = () => {
    const {
        provinces,
        districts,
        wards,
        loading,
        customer,
        editMode,
        fetchDistricts,
        fetchWards,
        createCustomer,
    } = useCreateCustomer()

    const [form] = Form.useForm<FormValues>()
    const router = useRouter()

    const [selectedProvince, setSelectedProvince] = useState<string>('')
    const [selectedDistrict, setSelectedDistrict] = useState<string>('')
    const [selectedWard, setSelectedWard] = useState<string>('')

    // Watch form values to enable/disable save button
    const [formValues, setFormValues] = useState<Partial<FormValues>>({})
    const [initialData, setInitialData] = useState<Partial<FormValues> | null>(null)
    const [isChanged, setIsChanged] = useState<boolean>(false)

    // Populate form when customer data is loaded (edit mode)
    useEffect(() => {
        if (!loading && editMode && customer) {
            const address = customer.default_address
            const formData: FormValues = {
                first_name: customer.first_name || '',
                last_name: customer.last_name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                gender: customer.gender || 'male',
                dob: customer.dob ? dayjs(customer.dob) : undefined,
                note: customer.note || '',
            }

            if (address) {
                formData.address_info = {
                    first_name: address.first_name || '',
                    last_name: address.last_name || '',
                    phone: address.phone || '',
                    email: address.email || '',
                    address: address.address || '',
                    province_code: address.province_code || undefined,
                    district_code: address.district_code || undefined,
                    ward_code: address.ward_code || undefined,
                    zip: address.zip || '',
                }
                setSelectedProvince(address.province_code || '')
                setSelectedDistrict(address.district_code || '')
                setSelectedWard(address.ward_code || '')
            }

            form.setFieldsValue(formData)
            setFormValues(formData)

            const initialFormData: Partial<FormValues> = {
                first_name: customer.first_name || '',
                last_name: customer.last_name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                gender: customer.gender || 'male',
                dob: customer.dob ? dayjs(customer.dob) : undefined,
                note: customer.note || '',
            }

            if (address) {
                initialFormData.address_info = {
                    first_name: address.first_name || '',
                    last_name: address.last_name || '',
                    phone: address.phone || '',
                    email: address.email || '',
                    address: address.address || '',
                    province_code: address.province_code || '',
                    district_code: address.district_code || '',
                    ward_code: address.ward_code || '',
                    zip: address.zip || '',
                }
            }

            setInitialData(initialFormData)
        }
    }, [loading, editMode, customer, form])

    // Check if form has changed (for edit mode)
    const checkChanged = useCallback(() => {
        if (!initialData || !editMode) return false
        const values = form.getFieldsValue()
        const initialDob = initialData.dob ? (typeof initialData.dob === 'string' ? initialData.dob : dayjs(initialData.dob).format('YYYY-MM-DD')) : ''
        const currentDob = values.dob ? values.dob.format('YYYY-MM-DD') : ''
        return (
            values.first_name !== initialData.first_name ||
            values.last_name !== initialData.last_name ||
            values.phone !== initialData.phone ||
            values.email !== initialData.email ||
            values.gender !== initialData.gender ||
            currentDob !== initialDob ||
            values.note !== initialData.note ||
            JSON.stringify(values.address_info) !== JSON.stringify(initialData.address_info)
        )
    }, [form, initialData, editMode])

    useEffect(() => {
        if (editMode) {
            setIsChanged(checkChanged())
        }
    }, [checkChanged, editMode, formValues])

    const handleProvinceChange = (value: string) => {
        setSelectedProvince(value)
        setSelectedDistrict('')
        setSelectedWard('')
        form.setFieldsValue({
            address_info: {
                ...form.getFieldValue('address_info'),
                district_code: undefined,
                ward_code: undefined,
            }
        })
        if (value) {
            fetchDistricts(value)
        }
    }

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value)
        setSelectedWard('')
        form.setFieldsValue({
            address_info: {
                ...form.getFieldValue('address_info'),
                ward_code: undefined,
            }
        })
        if (value) {
            fetchWards(value)
        }
    }

    const handleWardChange = (value: string) => {
        setSelectedWard(value)
    }

    const handleFormChange = () => {
        const values = form.getFieldsValue()
        setFormValues(values)
        if (editMode) {
            setIsChanged(checkChanged())
        }
    }

    const onFinish = async (values: FormValues) => {
        const data: CreateCustomerRequest = {
            first_name: values.first_name,
            last_name: values.last_name,
            phone: values.phone,
            email: values.email,
            gender: values.gender,
            dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
            note: values.note,
        }

        if (values.address_info && values.address_info.province_code && values.address_info.district_code && values.address_info.ward_code) {
            data.address_info = {
                first_name: values.address_info.first_name || values.first_name,
                last_name: values.address_info.last_name || values.last_name,
                phone: values.address_info.phone || values.phone,
                email: values.address_info.email || values.email,
                address: values.address_info.address,
                province_code: values.address_info.province_code,
                district_code: values.address_info.district_code,
                ward_code: values.address_info.ward_code,
                zip: values.address_info.zip,
                is_default: true,
                is_new_address: true,
            }
        }

        try {
            await createCustomer(data)
        } catch (error) {
            console.error('Error creating customer:', error)
        }
    }

    const isSaveDisabled = editMode
        ? (!isChanged || loading)
        : (!formValues.first_name || !formValues.last_name || !formValues.phone || loading)

    if (loading && editMode && !customer) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải thông tin khách hàng...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex-1 flex items-start justify-center px-2 py-6 overflow-hidden">
                <div className="w-full max-w-[1400px] flex flex-col h-full min-h-0">
                    {/* Header */}
                    <div className="flex-shrink-0 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    type="text"
                                    icon={<ArrowLeft size={20} />}
                                    onClick={() => router.back()}
                                />
                                <h1 className="text-2xl !font-semibold">
                                    {editMode ? 'Chi tiết khách hàng' : 'Thêm mới khách hàng'}
                                </h1>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                disabled={isSaveDisabled}
                                loading={loading}
                                onClick={() => form.submit()}
                            >
                                {editMode ? 'Lưu' : 'Tạo khách hàng'}
                            </Button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onValuesChange={handleFormChange}
                            initialValues={{
                                gender: 'male',
                            }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                                {/* Left Column - Customer Information (8/10) */}
                                <div className="lg:col-span-7 space-y-4">
                                    {/* Basic Information */}
                                    <Card title="Thông tin cơ bản">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Form.Item
                                                label="Họ"
                                                name="first_name"
                                                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                                            >
                                                <Input placeholder="Nhập họ" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Tên"
                                                name="last_name"
                                                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                            >
                                                <Input placeholder="Nhập tên" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Email"
                                                name="email"
                                                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                                            >
                                                <Input placeholder="Nhập email" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Số điện thoại"
                                                name="phone"
                                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                            >
                                                <Input placeholder="Nhập số điện thoại" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Ngày sinh"
                                                name="dob"
                                            >
                                                <DatePicker
                                                    format="DD/MM/YYYY"
                                                    placeholder="dd/MM/yyyy"
                                                    className="w-full"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="Giới tính"
                                                name="gender"
                                            >
                                                <Radio.Group>
                                                    <Radio value="male">Nam</Radio>
                                                    <Radio value="female">Nữ</Radio>
                                                    <Radio value="other">Khác</Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                        </div>
                                    </Card>

                                    {/* Address */}
                                    <Card title="Địa chỉ nhận hàng">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <Form.Item
                                                label="Họ"
                                                name={['address_info', 'first_name']}
                                            >
                                                <Input placeholder="Nhập họ" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Tên"
                                                name={['address_info', 'last_name']}
                                            >
                                                <Input placeholder="Nhập tên" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Số điện thoại"
                                                name={['address_info', 'phone']}
                                            >
                                                <Input placeholder="Nhập số điện thoại" />
                                            </Form.Item>

                                            <Form.Item
                                                label="Email"
                                                name={['address_info', 'email']}
                                                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                                            >
                                                <Input placeholder="Nhập email" />
                                            </Form.Item>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <Form.Item
                                                label="Tỉnh/Thành phố"
                                                name={['address_info', 'province_code']}
                                            >
                                                <Select
                                                    placeholder="Chọn Tỉnh thành"
                                                    onChange={handleProvinceChange}
                                                    value={selectedProvince}
                                                    options={provinces.map(p => ({ label: p.name, value: p.code }))}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="Quận/Huyện"
                                                name={['address_info', 'district_code']}
                                            >
                                                <Select
                                                    placeholder="Chọn Quận huyện"
                                                    onChange={handleDistrictChange}
                                                    value={selectedDistrict}
                                                    disabled={!selectedProvince}
                                                    options={districts.map(d => ({ label: d.name, value: d.code }))}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label="Phường/Xã"
                                                name={['address_info', 'ward_code']}
                                            >
                                                <Select
                                                    placeholder="Chọn Phường xã"
                                                    onChange={handleWardChange}
                                                    value={selectedWard}
                                                    disabled={!selectedDistrict}
                                                    options={wards.map(w => ({ label: w.name, value: w.code }))}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            label="Địa chỉ cụ thể"
                                            name={['address_info', 'address']}
                                        >
                                            <Input placeholder="Nhập địa chỉ" />
                                        </Form.Item>

                                        <Form.Item
                                            label="Postal/Zipcode"
                                            name={['address_info', 'zip']}
                                        >
                                            <Input placeholder="Nhập Postal/Zipcode" />
                                        </Form.Item>
                                    </Card>
                                </div>

                                {/* Right Column - Note (2/10) */}
                                <div className="lg:col-span-3">
                                    <Card title="Ghi chú" className="sticky top-0">
                                        <Form.Item
                                            name="note"
                                        >
                                            <TextArea
                                                rows={10}
                                                placeholder="Nhập ghi chú"
                                                className="resize-none"
                                            />
                                        </Form.Item>
                                    </Card>
                                </div>
                            </div>
                        </Form>
                    </div>

                    {/* Bottom Save Button */}
                    <div className="flex-shrink-0 pt-4 border-t flex justify-end">
                        <Button
                            type="primary"
                            size="large"
                            disabled={isSaveDisabled || loading}
                            loading={loading}
                            onClick={() => form.submit()}
                        >
                            {editMode ? 'Lưu' : 'Tạo khách hàng'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateCustomerView

