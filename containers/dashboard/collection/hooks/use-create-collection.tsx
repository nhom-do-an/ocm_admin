'use client'

import { useLoader } from "@/hooks/useGlobalLoader"
import { useGlobalNotification } from "@/hooks/useNotification"
import collectionService from "@/services/collection"
import productService from "@/services/product"
import { Collection } from "@/types/response/collection"
import { Product } from "@/types/response/product"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export const useCreateCollection = () => {
    const [collection, setCollection] = useState<Collection | null>(null)
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [collectionProducts, setCollectionProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const { startLoading, stopLoading } = useLoader();
    const { id } = useParams()
    const router = useRouter();
    const notification = useGlobalNotification();

    const fetchCollectionProducts = async (collectionId: number) => {
        setLoadingProducts(true)
        try {
            const res = await productService.getListProducts({
                collection_ids: [collectionId],
                page: 1,
                limit: 20,
            })
            setCollectionProducts(res.products || [])
        } catch (error) {
            console.error('Error fetching collection products:', error)
        } finally {
            setLoadingProducts(false)
        }
    }

    const fetchDetailCollection = async () => {
        setLoading(true)
        startLoading();
        try {
            if (id) {
                const response = await collectionService.getDetailCollection(Number(id))
                setCollection(response)
                setEditMode(true)
                if (response.id) {
                    fetchCollectionProducts(response.id)
                }
            }
        } catch (error) {
            console.error('Error fetching collections:', error)
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    const createCollection = async (data: Collection) => {
        setLoading(true)
        startLoading();
        try {
            const newCollection = await collectionService.createCollection(data)

            router.push(`/collection/${newCollection.id}`)
            notification.success({ message: "Tạo bộ sưu tập thành công" });
        } catch (error) {
            console.error('Error creating collection:', error)
            throw error
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    const updateCollection = async (data: Collection) => {
        setLoading(true)
        startLoading();
        try {
            const updated = await collectionService.updateCollection(data)
            setCollection(updated)
            notification.success({ message: "Cập nhật danh mục thành công" });
        } catch (error) {
            console.error('Error updating collection:', error)
            throw error
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    const deleteCollection = async (collectionId: number) => {
        setLoading(true)
        startLoading();
        try {
            await collectionService.deleteCollection(collectionId)
            notification.success({ message: "Xoá danh mục thành công" });
            router.push('/collection')
        } catch (error) {
            console.error('Error deleting collection:', error)
            throw error
        } finally {
            setLoading(false)
            stopLoading();
        }
    }

    useEffect(() => {
        if (id) {
            console.log("Fetch detail collection with id:", id)
            fetchDetailCollection()
        }
    }, [id])

    return {
        collection,
        loading,
        editMode,
        collectionProducts,
        loadingProducts,
        createCollection,
        updateCollection,
        deleteCollection,
    }
}
