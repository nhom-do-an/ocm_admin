'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLoader } from '@/hooks/useGlobalLoader'
import { useGlobalNotification } from '@/hooks/useNotification'
import variantService, { UpdateVariantPayload, Variant } from '@/services/variant'
import productService from '@/services/product'
import inventoryLevelService from '@/services/inventory-level'
import { Product, ProductAttribute, ProductVariant } from '@/types/response/product'
import { InventoryLevel } from '@/types/response/inventory-level'

export const useVariantDetail = () => {
    const params = useParams()
    const router = useRouter()
    const { startLoading, stopLoading } = useLoader()
    const notification = useGlobalNotification()

    const productId = Number(params.productId)
    const variantId = Number(params.variantId)

    const [variant, setVariant] = useState<Variant | null>(null)
    const [product, setProduct] = useState<Product | null>(null)
    const [attributes, setAttributes] = useState<ProductAttribute[]>([])
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([])
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        if (!variantId) return
        setLoading(true)
        startLoading()
        try {
            const [variantDetail, inventoryRes] = await Promise.all([
                variantService.getVariantDetail(variantId),
                inventoryLevelService.getInventoryLevels({
                    variant_id: variantId,
                    page: 1,
                    size: 100,
                }),
            ])
            setVariant(variantDetail)
            setInventoryLevels(inventoryRes.inventory_levels || [])

            const pid = productId || variantDetail.product_id
            if (pid) {
                const productDetail = await productService.getDetailProductByID(pid)
                setProduct(productDetail)
                setVariants(productDetail.variants || [])
                setAttributes(productDetail.attributes || [])
            }
        } catch (error) {
            console.error('Error fetching variant detail:', error)
            notification.error({ message: 'Không thể tải chi tiết phiên bản' })
        } finally {
            setLoading(false)
            stopLoading()
        }
    }

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variantId])

    const goBackToProduct = () => {
        const pid = productId || variant?.product_id
        if (pid) {
            router.push(`/product/${pid}`)
        } else {
            router.back()
        }
    }

    const openAnotherVariant = (targetVariantId: number) => {
        const pid = productId || variant?.product_id
        if (!pid) return
        router.push(`/product/${pid}/variant/${targetVariantId}`)
    }

    const handleUpdateVariant = async (payload: UpdateVariantPayload) => {
        if (!variant) return
        try {
            const updated = await variantService.updateVariant(payload)
            setVariant(updated)
            // cập nhật lại list variant bên trái
            setVariants(prev =>
                prev.map(v => (v.id === updated.id ? { ...v, ...updated } : v)),
            )
            notification.success({ message: 'Cập nhật phiên bản thành công' })
        } catch (error) {
            console.error('Error updating variant:', error)
            notification.error({ message: 'Cập nhật phiên bản thất bại' })
            throw error
        }
    }

    const handleDeleteVariant = async () => {
        if (!variant) return
        setLoading(true)
        startLoading()
        try {
            await variantService.deleteVariant(variant.id)
            notification.success({ message: 'Xoá phiên bản thành công' })
            goBackToProduct()
        } catch (error) {
            console.error('Error deleting variant:', error)
            notification.error({ message: 'Xoá phiên bản thất bại' })
            throw error
        } finally {
            setLoading(false)
            stopLoading()
        }
    }

    return {
        variant,
        product,
        variants,
        attributes,
        inventoryLevels,
        loading,
        goBackToProduct,
        openAnotherVariant,
        handleUpdateVariant,
        handleDeleteVariant,
        refetch: fetchData,
    }
}


