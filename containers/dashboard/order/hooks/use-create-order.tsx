'use client'

import { useLoader } from "@/hooks/useGlobalLoader"
import { useGlobalNotification } from "@/hooks/useNotification"
import customerService from "@/services/customer"
import locationService from "@/services/location"
import sourceService from "@/services/source"
import userService from "@/services/user"
import variantService, { Variant } from "@/services/variant"
import paymentService from "@/services/payment-method"
import { TUserResponse } from "@/types/response/auth"
import { Customer } from "@/types/response/customer"
import { Location } from "@/types/response/locations"
import { Order } from "@/types/response/order"
import { Source } from "@/types/response/source"
import { PaymentMethod } from "@/types/response/payment-method"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ELocationStatus } from "@/types/enums/enum"

export const useCreateOrder = () => {
    const [sources, setSources] = useState<Source[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [assignees, setAssignees] = useState<TUserResponse[]>([])
    const [variants, setVariants] = useState<Variant[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState<Order | null>(null)
    const [editMode, setEditMode] = useState(false)
    const { startLoading, stopLoading } = useLoader()
    const { id } = useParams()
    const router = useRouter()
    const notification = useGlobalNotification()

    const fetchCreateOrderData = async () => {
        setLoading(true)
        startLoading()
        try {
            const response = await Promise.all([
                sourceService.getListSources(),
                locationService.getListLocations({ status: ELocationStatus.ACTIVE, inventory_management: true }),
                userService.getListUsers({ size: 1000 }),
                paymentService.getListPaymentMethods({ limit: 1000 }),
            ])
            setSources(response[0] || [])
            setLocations(response[1].locations || [])
            setAssignees(response[2].users || [])
            setPaymentMethods(response[3] || [])
        } catch (error) {
            console.error('Error fetching order data:', error)
            notification.error({ message: 'Không thể tải dữ liệu' })
        } finally {
            setLoading(false)
            stopLoading()
        }
    }

    const createOrder = async () => {
        setLoading(true)
        startLoading()
        try {

            notification.success({ message: "Tạo đơn hàng thành công" })
        } catch (error) {
            console.error('Error creating order:', error)
            notification.error({ message: 'Tạo đơn hàng thất bại' })
            throw error
        } finally {
            setLoading(false)
            stopLoading()
        }
    }

    const getVariants = useCallback(async (keyword: string, locationID: number) => {
        const response = await variantService.getListVariants({ key: keyword, location_id: locationID })
        setVariants(response.variants || [])
    }, [])

    const getCustomers = useCallback(async (keyword: string) => {
        const response = await customerService.getListCustomers({ key: keyword })
        setCustomers(response.customers || [])
    }, [])

    useEffect(() => {
        if (id) {
            console.log("Fetch detail order with id:", id)
        } else {
            fetchCreateOrderData()
        }
    }, [id])

    return {
        sources,
        locations,
        assignees,
        loading,
        order,
        editMode,
        createOrder,
        getVariants,
        getCustomers,
        variants,
        customers,
        paymentMethods,
    }
}