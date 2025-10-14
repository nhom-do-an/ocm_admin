'use client'
import { useState, useEffect } from 'react'

interface Product {
    id: string
    name: string
    image?: string
    availableStock: number
    category: string
    brand: string
    createdAt: string
    variants?: number
}

interface FilterParams {
    searchText: string
    channel: string
    category: string
    tag: string
}

export const useProductList = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    })
    const [filters, setFilters] = useState<FilterParams>({
        searchText: '',
        channel: '',
        category: '',
        tag: ''
    })
    const [advancedFilters, setAdvancedFilters] = useState<any>({})

    // Mock data - thay thế bằng API call thực tế
    const mockProducts: Product[] = [
        {
            id: '1',
            name: 'macbook mới',
            image: '',
            availableStock: 0,
            category: 'Laptop',
            brand: 'Apple',
            createdAt: '28/09/2025',
            variants: 0
        },
        {
            id: '2',
            name: 'tai nghe không dây',
            image: '',
            availableStock: 4,
            category: 'Âm thanh',
            brand: 'Sony',
            createdAt: '28/09/2025',
            variants: 0
        },
        {
            id: '3',
            name: 'macbook pro 2025',
            image: '',
            availableStock: -1,
            category: 'Laptop',
            brand: 'Apple',
            createdAt: '28/09/2025',
            variants: 2
        }
    ]

    // Fetch products
    const fetchProducts = async () => {
        setLoading(true)
        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 500))
            setProducts(mockProducts)
            setPagination(prev => ({ ...prev, total: mockProducts.length }))
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [pagination.current, pagination.pageSize, filters])

    // Handle selection
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    // Handle table change
    const handleTableChange = (newPagination: any) => {
        setPagination(newPagination)
    }

    // Handle filter change
    const handleFilterChange = (key: keyof FilterParams, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPagination(prev => ({ ...prev, current: 1 })) // Reset to first page
    }

    // Handle export
    const handleExport = () => {
        console.log('Xuất file với sản phẩm đã chọn:', selectedRowKeys)
    }

    // Handle import
    const handleImport = () => {
        console.log('Nhập file')
    }

    // Handle add product
    const handleAddProduct = () => {
        console.log('Thêm sản phẩm mới')
    }

    // Handle advanced filter
    const handleAdvancedFilter = () => {
        setOpenAdvancedFilter(true)
    }

    // Handle apply advanced filter
    const handleApplyAdvancedFilter = (filterValues: any) => {
        setAdvancedFilters(filterValues)
        setPagination(prev => ({ ...prev, current: 1 }))
        console.log('Applied advanced filters:', filterValues)
    }

    // Handle save filter
    const handleSaveFilter = () => {
        console.log('Lưu bộ lọc')
    }

    return {
        products,
        loading,
        selectedRowKeys,
        pagination,
        filters,
        advancedFilters,
        openAdvancedFilter,
        setOpenAdvancedFilter,
        onSelectChange,
        handleTableChange,
        handleFilterChange,
        handleAddProduct,
        handleAdvancedFilter,
        handleApplyAdvancedFilter,
        fetchProducts
    }
}