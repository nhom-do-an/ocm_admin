'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import productService from '@/services/product'
import { GetListProductsRequest } from '@/types/request/product'
import { Product } from '@/types/response/product'
import { useLoader } from '@/hooks/useGlobalLoader'
import { Collection } from '@/types/response/collection'
import collectionService from '@/services/collection'

// Interface for internal state (arrays)
interface InternalFilters {
    store_id?: number;
    key?: string;
    tags?: string[];
    product_types?: string[];
    vendors?: string[];
    statuses?: string[];
    types?: string[];
    collection_ids?: number[];
    min_price?: number;
    max_price?: number;
    min_created_at?: string;
    max_created_at?: string;
    sort_field?: 'name' | 'price' | 'created_at';
    sort_type?: 'asc' | 'desc';
}

export const useProductList = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [products, setProducts] = useState<Product[]>([])
    const [productTypes, setProductTypes] = useState<string[]>([])
    const [vendors, setVendors] = useState<string[]>([])
    const [tags, setTags] = useState<string[]>([])
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    })
    const [filters, setFilters] = useState<InternalFilters>({})
    const [initialized, setInitialized] = useState(false)
    const { startLoading, stopLoading } = useLoader();


    // 📌 Parse params từ URL
    useEffect(() => {
        const params: InternalFilters = {}

        // Parse pagination
        const page = searchParams.get('page')
        const limit = searchParams.get('limit')
        if (page) {
            const pageNum = parseInt(page)
            if (!isNaN(pageNum)) {
                setPagination(prev => ({ ...prev, current: pageNum }))
            }
        }
        if (limit) {
            const sizeNum = parseInt(limit)
            if (!isNaN(sizeNum)) {
                setPagination(prev => ({ ...prev, pageSize: sizeNum }))
            }
        }

        // Parse string filters
        const key = searchParams.get('key')
        if (key) params.key = key

        // Parse comma-separated strings to arrays
        const vendors = searchParams.get('vendors')
        const product_types = searchParams.get('product_types')
        const types = searchParams.get('types')
        const statuses = searchParams.get('statuses')
        const tags = searchParams.get('tags')
        const collection_ids = searchParams.get('collection_ids')

        if (vendors) params.vendors = vendors.split(',')
        if (product_types) params.product_types = product_types.split(',')
        if (types) params.types = types.split(',')
        if (statuses) params.statuses = statuses.split(',')
        if (tags) params.tags = tags.split(',')
        if (collection_ids) params.collection_ids = collection_ids.split(',').map(id => parseInt(id))

        // Parse price range
        const min_price = searchParams.get('min_price')
        const max_price = searchParams.get('max_price')
        if (min_price) params.min_price = parseFloat(min_price)
        if (max_price) params.max_price = parseFloat(max_price)

        // Parse date range
        const min_created_at = searchParams.get('min_created_at')
        const max_created_at = searchParams.get('max_created_at')
        if (min_created_at) params.min_created_at = min_created_at
        if (max_created_at) params.max_created_at = max_created_at

        // Parse sorting
        const sort_field = searchParams.get('sort_field')
        const sort_type = searchParams.get('sort_type')
        if (sort_field) params.sort_field = sort_field as 'name' | 'price' | 'created_at'
        if (sort_type) params.sort_type = sort_type as 'asc' | 'desc'

        setFilters(params)
        setInitialized(true)
    }, [searchParams])

    // 📌 Convert arrays to comma-separated strings for API
    const prepareRequestParams = (internalFilters: InternalFilters): GetListProductsRequest => {
        const apiParams: GetListProductsRequest = {
            page: pagination.current,
            limit: pagination.pageSize,
        }

        if (internalFilters.key) apiParams.key = internalFilters.key
        if (internalFilters.store_id) apiParams.store_id = internalFilters.store_id

        // Convert arrays (typed in InternalFilters) sang dạng tương ứng GetListProductsRequest
        if (internalFilters.vendors?.length) {
            apiParams.vendors = [...internalFilters.vendors]
        }
        if (internalFilters.product_types?.length) {
            apiParams.product_types = [...internalFilters.product_types]
        }
        if (internalFilters.types?.length) {
            apiParams.types = [...internalFilters.types]
        }
        if (internalFilters.statuses?.length) {
            apiParams.statuses = [...internalFilters.statuses]
        }
        if (internalFilters.tags?.length) {
            apiParams.tags = [...internalFilters.tags]
        }
        if (internalFilters.collection_ids?.length) {
            apiParams.collection_ids = internalFilters.collection_ids
        }

        // Price range
        if (internalFilters.min_price !== undefined) apiParams.min_price = internalFilters.min_price
        if (internalFilters.max_price !== undefined) apiParams.max_price = internalFilters.max_price

        // Date range - convert DD/MM/YYYY to timestamp
        if (internalFilters.min_created_at) {
            const [day, month, year] = internalFilters.min_created_at.split('/')
            apiParams.min_created_at = new Date(`${year}-${month}-${day}`).getTime() / 1000
        }
        if (internalFilters.max_created_at) {
            const [day, month, year] = internalFilters.max_created_at.split('/')
            // Set to end of day (23:59:59)
            apiParams.max_created_at = new Date(`${year}-${month}-${day}T23:59:59`).getTime() / 1000
        }

        // Sorting
        if (internalFilters.sort_field) apiParams.sort_field = internalFilters.sort_field
        if (internalFilters.sort_type) apiParams.sort_type = internalFilters.sort_type

        return apiParams
    }

    interface TablePagination {
        current: number;
        pageSize: number;
    }

    const updateURLParams = (newFilters: InternalFilters, newPagination?: TablePagination) => {
        const params = new URLSearchParams()

        // Add pagination
        const currentPage = newPagination?.current || pagination.current
        const currentPageSize = newPagination?.pageSize || pagination.pageSize
        params.set('page', currentPage.toString())
        params.set('limit', currentPageSize.toString())

        // Add string filters
        if (newFilters.key) params.set('key', newFilters.key)

        if (newFilters.vendors?.length) params.set('vendors', newFilters.vendors.join(','))
        if (newFilters.product_types?.length) params.set('product_types', newFilters.product_types.join(','))
        if (newFilters.types?.length) params.set('types', newFilters.types.join(','))
        if (newFilters.statuses?.length) params.set('statuses', newFilters.statuses.join(','))
        if (newFilters.tags?.length) params.set('tags', newFilters.tags.join(','))
        if (newFilters.collection_ids?.length) params.set('collection_ids', newFilters.collection_ids.join(','))

        // Add price range
        if (newFilters.min_price !== undefined) params.set('min_price', newFilters.min_price.toString())
        if (newFilters.max_price !== undefined) params.set('max_price', newFilters.max_price.toString())

        // Add date range
        if (newFilters.min_created_at) params.set('min_created_at', newFilters.min_created_at)
        if (newFilters.max_created_at) params.set('max_created_at', newFilters.max_created_at)

        // Add sorting
        if (newFilters.sort_field) params.set('sort_field', newFilters.sort_field)
        if (newFilters.sort_type) params.set('sort_type', newFilters.sort_type)

        router.push(`?${params.toString()}`, { scroll: false })
    }

    const fetchProducts = async () => {
        startLoading()
        setLoading(true)
        try {
            const requestParams = prepareRequestParams(filters)
            const response = await Promise.all([
                productService.getListProducts(requestParams),
                productService.getProductTypeList(),
                productService.getVendorList(),
                productService.getTagsList(),
                collectionService.getCollections({ page: 1, size: 1000 }),
            ])
            setProducts(response[0].products || [])
            setPagination((prev) => ({ ...prev, total: response[0].count || 0 }))
            setProductTypes(response[1] || [])
            setVendors(response[2] || [])
            setTags(response[3] || [])
            setCollections(response[4]?.collections || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            stopLoading()
            setLoading(false)
        }
    }

    // 📌 Khi chọn dòng
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    // 📌 Khi đổi trang hoặc kích thước bảng
    const handleTableChange = (newPagination: TablePagination) => {
        const updatedPagination = {
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }
        setPagination(updatedPagination)
        updateURLParams(filters, updatedPagination)
    }

    const handleFilterChange = (key: keyof InternalFilters, value: unknown) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        const newPagination = { current: 1, pageSize: pagination.pageSize }
        setPagination((prev) => ({ ...prev, current: 1 }))
        updateURLParams(newFilters, newPagination)
    }

    const handleAdvancedFilter = () => {
        setOpenAdvancedFilter(true)
    }

    const handleApplyAdvancedFilter = (filterValues: InternalFilters) => {
        setFilters(filterValues)
        const newPagination = { current: 1, pageSize: pagination.pageSize }
        setPagination((prev) => ({ ...prev, current: 1 }))
        updateURLParams(filterValues, newPagination)
    }

    // 📌 Clear all filters
    const handleClearFilters = () => {
        setFilters({})
        setPagination((prev) => ({ ...prev, current: 1 }))
        router.push('?page=1&limit=20', { scroll: false })
    }

    // 📌 Thêm sản phẩm
    const handleAddProduct = () => {
        console.log('Thêm sản phẩm mới')
    }

    useEffect(() => {
        if (!initialized) return
        fetchProducts()
    }, [initialized, pagination.current, pagination.pageSize, filters])

    return {
        products,
        loading,
        selectedRowKeys,
        pagination,
        filters,
        openAdvancedFilter,
        setOpenAdvancedFilter,
        onSelectChange,
        handleTableChange,
        handleFilterChange,
        handleAddProduct,
        handleAdvancedFilter,
        handleApplyAdvancedFilter,
        handleClearFilters,
        fetchProducts,
        productTypes,
        vendors,
        tags,
        collections,
    }
}