'use client'

import { useLoader } from "@/hooks/useGlobalLoader"
import { useGlobalNotification } from "@/hooks/useNotification"
import collectionService from "@/services/collection"
import { Collection } from "@/types/response/collection"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export const useCreateCollection = () => {
    const [collection, setCollection] = useState<Collection | null>(null)
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const { startLoading, stopLoading } = useLoader();
    const { id } = useParams()
    const router = useRouter();
    const notification = useGlobalNotification();

    const fetchDetailCollection = async () => {
        setLoading(true)
        startLoading();
        try {
            if (id) {
                const response = await collectionService.getDetailCollection(Number(id))
                setCollection(response)
                setEditMode(true)
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
        createCollection,
    }
}
