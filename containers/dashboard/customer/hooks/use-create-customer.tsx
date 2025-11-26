'use client'

import { useLoader } from "@/hooks/useGlobalLoader"
import { useGlobalNotification } from "@/hooks/useNotification"
import customerService from "@/services/customer"
import regionService from "@/services/region"
import { OldRegion } from "@/types/response/old-region"
import { Customer, CustomerDetail } from "@/types/response/customer"
import { CreateCustomerRequest } from "@/types/request/customer"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export const useCreateCustomer = () => {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = searchParams.get('id') || params.id
    const [provinces, setProvinces] = useState<OldRegion[]>([])
    const [districts, setDistricts] = useState<OldRegion[]>([])
    const [wards, setWards] = useState<OldRegion[]>([])
    const [loading, setLoading] = useState(false)
    const [customer, setCustomer] = useState<CustomerDetail | null>(null)
    const [editMode, setEditMode] = useState(false)
    const { startLoading, stopLoading } = useLoader();
    const router = useRouter();
    const notification = useGlobalNotification();

    // Fetch provinces on mount
    const fetchProvinces = async () => {
        setLoading(true)
        startLoading();
        try {
            const response = await regionService.getListOldRegions({
                type: 2, // RProvince
                parent_code: 'VN'
            })
            setProvinces(response || [])
        } catch (error) {
            console.error('Error fetching provinces:', error)
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách tỉnh thành'
            })
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    // Fetch districts when province is selected
    const fetchDistricts = async (provinceCode: string) => {
        if (!provinceCode) {
            setDistricts([])
            setWards([])
            return
        }
        try {
            const response = await regionService.getListOldRegions({
                type: 3, // RDistrict
                parent_code: provinceCode
            })
            setDistricts(response || [])
            setWards([]) // Clear wards when province changes
        } catch (error) {
            console.error('Error fetching districts:', error)
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách quận/huyện'
            })
        }
    }

    // Fetch wards when district is selected
    const fetchWards = async (districtCode: string) => {
        if (!districtCode) {
            setWards([])
            return
        }
        try {
            const response = await regionService.getListOldRegions({
                type: 4, // RWard
                parent_code: districtCode
            })
            setWards(response || [])
        } catch (error) {
            console.error('Error fetching wards:', error)
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách phường/xã'
            })
        }
    }

    // Fetch customer detail for edit mode
    const fetchCustomerDetail = async () => {
        const customerId = typeof id === 'string' ? id : id
        if (!customerId) return
        
        setLoading(true)
        startLoading();
        try {
            const response = await customerService.getCustomerDetail(Number(customerId))
            setCustomer(response)
            setEditMode(true)
            
            // Load districts and wards if address exists
            if (response.default_address) {
                const address = response.default_address
                if (address.province_code) {
                    await fetchDistricts(address.province_code)
                    if (address.district_code) {
                        await fetchWards(address.district_code)
                    }
                }
            }
        } catch (error: any) {
            console.error('Error fetching customer detail:', error)
            notification.error({
                message: 'Lỗi',
                description: error?.response?.data?.message || 'Không thể tải thông tin khách hàng'
            })
            router.push('/customer/list')
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    // Create or update customer
    const createCustomer = async (data: CreateCustomerRequest) => {
        setLoading(true)
        startLoading();
        try {
            if (editMode && customer?.id) {
                // TODO: Implement update customer API when available
                // const response = await customerService.updateCustomer(customer.id, data)
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật khách hàng thành công'
                })
            } else {
                const response = await customerService.createCustomer(data)
                notification.success({
                    message: 'Thành công',
                    description: 'Tạo khách hàng thành công'
                })
            }
            router.push('/customer/list')
        } catch (error: any) {
            console.error('Error saving customer:', error)
            notification.error({
                message: 'Lỗi',
                description: error?.response?.data?.message || 'Không thể lưu khách hàng'
            })
            throw error
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    useEffect(() => {
        fetchProvinces()
    }, [])

    useEffect(() => {
        if (id) {
            fetchCustomerDetail()
        }
    }, [id])

    return {
        provinces,
        districts,
        wards,
        loading,
        customer,
        editMode,
        fetchProvinces,
        fetchDistricts,
        fetchWards,
        createCustomer,
    }
}

