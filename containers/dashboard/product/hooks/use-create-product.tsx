'use client'

import { useLoader } from "@/hooks/useGlobalLoader"
import { useGlobalNotification } from "@/hooks/useNotification"
import channelService from "@/services/channel"
import collectionService from "@/services/collection"
import locationService from "@/services/location"
import productService from "@/services/product"
import { ELocationStatus } from "@/types/enums/enum"
import { TPublicationResponse } from "@/types/response/channel"
import { Collection } from "@/types/response/collection"
import { Location } from "@/types/response/locations"
import { Product } from "@/types/response/product"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export const useCreateProduct = () => {
    const [collections, setCollections] = useState<Collection[]>([])
    const [locations, setLocations] = useState<Location[]>([])
    const [productTypes, setProductTypes] = useState<string[]>([])
    const [vendors, setVendors] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [publications, setPublications] = useState<TPublicationResponse[]>([])
    const [product, setProduct] = useState<Product | null>(null)
    const [editMode, setEditMode] = useState(false)
    const { startLoading, stopLoading } = useLoader();
    const { id } = useParams()
    const router = useRouter();
    const notification = useGlobalNotification();

    const fetchCreateProduct = async () => {
        setLoading(true)
        startLoading();
        try {
            const response = await Promise.all([
                locationService.getListLocation(),
                productService.getProductTypeList(),
                productService.getVendorList(),
                productService.getTagsList(),
                collectionService.getCollections(),
                channelService.getPublications(),
            ])
            setLocations(response[0] || [])
            setProductTypes(response[1] || [])
            setVendors(response[2] || [])
            setTags(response[3] || [])
            setCollections(response[4].collections || [])
            setPublications(response[5] || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    const fetchDetailProduct = async () => {
        setLoading(true)
        startLoading();
        try {
            if (id) {
                const response = await Promise.all([
                    locationService.getListLocations({ status: ELocationStatus.ACTIVE, inventory_management: true }),
                    productService.getProductTypeList(),
                    productService.getVendorList(),
                    productService.getTagsList(),
                    collectionService.getCollections(),
                    channelService.getPublications(),
                    productService.getDetailProductByID(Number(id)),

                ])
                setLocations(response[0].locations || [])
                setProductTypes(response[1] || [])
                setVendors(response[2] || [])
                setTags(response[3] || [])
                setCollections(response[4].collections || [])
                setPublications(response[5] || [])
                setProduct(response[6] || null)
                setEditMode(true)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    const createProduct = async (data: Product) => {
        setLoading(true)
        startLoading();
        try {
            const newProduct = await productService.createProduct(data)

            router.push(`/product/${newProduct.id}`)
            notification.success({ message: "Tạo sản phẩm thành công" });
        } catch (error) {
            console.error('Error creating product:', error)
            throw error
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    const updateProduct = async (data: Product) => {
        setLoading(true)
        startLoading();
        try {
            const updatedProduct = await productService.updateProduct(data)

            setProduct(updatedProduct);
            notification.success({ message: "Cập nhật sản phẩm thành công" });
        } catch (error) {
            console.error('Error updating product:', error)
            throw error
        } finally {
            setLoading(false)
            stopLoading();
        }
    }



    useEffect(() => {
        if (id) {
            console.log("Fetch detail product with id:", id)
            fetchDetailProduct()
        } else {
            fetchCreateProduct()
        }
    }, [id])

    return {
        collections,
        locations,
        productTypes,
        vendors,
        tags,
        loading,
        publications,
        product,
        editMode,
        createProduct,
        updateProduct
    }
}
