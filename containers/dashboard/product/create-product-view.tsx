'use client'
import React, { useState, useEffect } from 'react'
import {
    Input,
    Button,
    Card,
    Form,
    Select,
    Checkbox,
    InputNumber,
    Space,
    Table,
    Upload,
    Tag,
    Modal,
    Tooltip,
    Row,
    Col,
    UploadFile,
} from 'antd'
import { Plus, Trash2, Info, ArrowLeft, Upload as UploadIcon } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import TinyEditor from '@/components/TinyEditor'
import { Product, ProductAttribute, ProductVariant } from '@/types/response/product'
import { CreateInventoryQuantity } from '@/types/request/product'
import { useCreateProduct } from './hooks/use-create-product'
import { Attachment, Collection } from '@/types/response/collection'
import { EProductStatus, EProductType } from '@/types/enums/enum'
import attachmentService from '@/services/attachment'
import { useGlobalNotification } from '@/hooks/useNotification'
import { TPublicationResponse } from '@/types/response/channel'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import Image from 'next/image'
import inventoryLevelService, { ChangeInventoryReason } from '@/services/inventory-level'
import { InventoryLevel } from '@/types/response/inventory-level'

const { TextArea } = Input

interface FormValues {
    name: string;
    sku: string;
    barcode: string;
    unit: string;
    price: number;
    compare_at_price: number;
    cost_price: number;
    tracked: boolean;
    taxable: boolean;
    lot_management: boolean;
    requires_shipping: boolean;
    weight: number;
    weight_unit: string;
    meta_title: string;
    meta_description: string;
    vendor: string;
    product_type: string;
    tags: string[];
    collections: number[];
}

const CreateProduct: React.FC = () => {
    const { collapsed } = useGlobalContext()
    const { updateProduct, createProduct, collections, locations, productTypes, vendors, tags, loading, publications, product, editMode } = useCreateProduct()
    const [form] = Form.useForm<FormValues>()
    const [content, setContent] = useState('')
    const [summary, setSummary] = useState('')
    const [attributes, setAttributes] = useState<ProductAttribute[]>([])
    const [attributeChange, setAttributeChange] = useState<number>(0)
    const [attributeInput, setAttributeInput] = useState<{ [key: number]: string }>({})
    const [inventoryQuantity, setInventoryQuantity] = useState<CreateInventoryQuantity[]>([])
    const [variants, setVariants] = useState<ProductVariant[]>([])
    const [variantModalVisible, setVariantModalVisible] = useState(false)
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
    const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null)
    const [images, setImages] = useState<Attachment[]>([])
    const [openSummary, setOpenSummary] = useState<boolean>(summary !== '')
    const [openSeo, setOpenSeo] = useState<boolean>(false)
    const [inventoryRows, setInventoryRows] = useState<CreateInventoryQuantity[]>([])
    const [inventoryManagement, setInventoryManagement] = useState<boolean>(true)
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [selectedPublications, setSelectedPublications] = useState<TPublicationResponse[]>([]);
    const [hasDefaultVariant, setHasDefaultVariant] = useState<boolean>(false);
    const notification = useGlobalNotification()
    const [isModalDeleteVisible, setIsModalDeleteVisible] = useState<boolean>(false);
    const [imageSelectModalVisible, setImageSelectModalVisible] = useState<boolean>(false);
    const [selectingImageForVariantIndex, setSelectingImageForVariantIndex] = useState<number | null>(null);
    const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([])
    const [adjustModalVisible, setAdjustModalVisible] = useState(false)
    const [selectedLevel, setSelectedLevel] = useState<InventoryLevel | null>(null)
    const [adjustValue, setAdjustValue] = useState<number>(0)
    const [newQuantity, setNewQuantity] = useState<number>(0)
    const [reason, setReason] = useState<ChangeInventoryReason>('fact_inventory')
    const router = useRouter()
    const generateVariantCombinations = (attrs: ProductAttribute[]): Array<{
        title: string
        option1?: string
        option2?: string
        option3?: string
    }> => {
        const validAttrs = attrs.filter(attr => attr.name && attr.values.length > 0)

        if (validAttrs.length === 0) {
            return []
        }

        const combinations: string[][] = []

        const generate = (index: number, current: string[]) => {
            if (index === validAttrs.length) {
                combinations.push([...current])
                return
            }

            for (const value of validAttrs[index].values) {
                current.push(value)
                generate(index + 1, current)
                current.pop()
            }
        }

        generate(0, [])

        // Create variant combinations
        return combinations.map(combo => {
            const variantTitle = combo.join(' / ')

            return {
                title: variantTitle,
                option1: combo[0] || '',
                option2: combo[1] || '',
                option3: combo[2] || '',
            }
        })
    }

    useEffect(() => {
        if (attributeChange === 0) return
        const variantCombinations = generateVariantCombinations(attributes)

        setVariants(prevVariants => {
            const newVariants: ProductVariant[] = variantCombinations.map((combo, index) => {
                const existingVariant = prevVariants.find(v => v.title === combo.title)

                if (existingVariant) {
                    return {
                        ...existingVariant,
                        title: combo.title,
                        option1: combo.option1,
                        option2: combo.option2,
                        option3: combo.option3,
                        key: existingVariant.title || existingVariant.id
                    }
                }

                return {
                    ...combo,
                    sku: form.getFieldValue('sku') || '',
                    barcode: form.getFieldValue('barcode') || '',
                    price: form.getFieldValue('price'),
                    compare_at_price: form.getFieldValue('compare_at_price') || 0,
                    cost_price: form.getFieldValue('cost_price') || 0,
                    tracked: form.getFieldValue('tracked') || false,
                    lot_management: form.getFieldValue('lot_management') || false,
                    requires_shipping: form.getFieldValue('requires_shipping') || true,
                    position: index + 1,
                    weight: form.getFieldValue('weight') || 0,
                    weight_unit: form.getFieldValue('weight_unit') || 'g',
                    unit: form.getFieldValue('unit') || '',
                    inventory_quantities: inventoryQuantity
                }

            })

            return newVariants
        })
    }, [attributeChange])

    const handleAddAttribute = () => {
        setAttributes([...attributes, { name: '', values: [], position: attributes.length + 1 }])
    }

    const handleRemoveAttribute = (index: number) => {
        setAttributeChange(prev => prev + 1) // Increment to indicate change
        setAttributes(attributes.filter((_, i) => i !== index))
    }

    const handleAddAttributeValue = (index: number) => {
        setAttributeChange(prev => prev + 1) // Increment to indicate change
        const value = attributeInput[index]
        if (value && value.trim()) {
            if (attributes[index].values.includes(value.trim())) {
                // Prevent duplicate values
                return
            }
            const newAttributes = [...attributes]
            newAttributes[index].values.push(value.trim())
            setAttributes(newAttributes)
            setAttributeInput({ ...attributeInput, [index]: '' })
        }
    }

    const handleRemoveAttributeValue = (attrIndex: number, valueIndex: number) => {
        setAttributeChange(prev => prev + 1) // Increment to indicate change
        const newAttributes = [...attributes]
        newAttributes[attrIndex].values = newAttributes[attrIndex].values.filter((_, i) => i !== valueIndex)
        setAttributes(newAttributes)
    }

    const handleSelectImageForVariant = (index: number) => {
        setSelectingImageForVariantIndex(index)
        setEditingVariant(variants[index])
        setImageSelectModalVisible(true)
    }

    const variantColumns: ColumnsType<any> = editMode
        ? [
            {
                title: 'Hình ảnh',
                key: 'image',
                width: 80,
                render: (_, record) => (
                    <div className="w-12 h-12 border rounded flex items-center justify-center overflow-hidden">
                        {record.image && record.image.url ? (
                            <Image src={record.image.url} alt={record.title} className="w-full h-full object-cover" width={50} height={50} />
                        ) : (
                            <UploadIcon size={20} className="text-gray-400" />
                        )}
                    </div>
                ),
            },
            {
                title: 'Phiên bản',
                key: 'variant',
                render: (_: any, record: any) => (
                    <button
                        className="font-medium text-blue-600 hover:text-blue-800"
                        onClick={() => {
                            if (record.id || product?.id) {
                                const pid = product?.id || record.product_id
                                const vid = record.id
                                if (pid && vid) {
                                    router.push(`/admin/product/${pid}/variant/${vid}`)
                                }
                            }
                        }}
                    >
                        {record.title}
                    </button>
                ),
            },
            {
                title: 'Giá bán',
                dataIndex: 'price',
                render: (price: number) => `${price ? price.toLocaleString('vi-VN') : 0}₫`,
            },
            {
                title: 'Có thể bán',
                key: 'variant',
                render: (_: any, record: any) =>
                    `${record.inventory_quantity ?? 0}`,
            },
        ]
        : [
            {
                title: '',
                width: 40,
                render: () => <Checkbox />,
            },
            {
                title: 'Hình ảnh',
                key: 'image',
                width: 80,
                render: (_: any, record: any, index: number) => (
                    <div
                        className="w-12 h-12 border rounded cursor-pointer hover:border-blue-500 flex items-center justify-center overflow-hidden"
                        onClick={() => handleSelectImageForVariant(index)}
                    >
                        {record.image && record.image.url ? (
                            <Image src={record.image.url} alt={record.title} className="w-full h-full object-cover" width={50} height={50} />
                        ) : (
                            <UploadIcon size={20} className="text-gray-400" />
                        )}
                    </div>
                ),
            },
            {
                title: 'Phiên bản',
                key: 'variant',
                render: (_: any, record: any, index: number) => (
                    <div>
                        <div className="font-medium">{record.title}</div>
                        <Space size="small">
                            <Button
                                type="link"
                                size="small"
                                className="p-0 h-auto"
                                onClick={() => {
                                    setEditingVariant(record)
                                    setEditingVariantIndex(index)
                                    setVariantModalVisible(true)
                                }}
                            >
                                Chỉnh sửa
                            </Button>
                            <Button
                                type="link"
                                size="small"
                                danger
                                className="p-0 h-auto"
                                onClick={() => handleDeleteVariant(index)}
                            >
                                Xóa
                            </Button>
                        </Space>
                    </div>
                ),
            },
            {
                title: 'Giá bán',
                dataIndex: 'price',
                render: (price: number) => `${price ? price.toLocaleString('vi-VN') : 0}₫`,
            },
            {
                title: 'Có thể bán',
                key: 'variant',
                render: (_: any, record: any) =>
                    `${inventoryQuantity.map(iq => iq.available).reduce((a, b) => a + b, 0)} tại ${locations.length} kho`,
            },
        ]

    const handleSaveVariant = (values: any) => {
        if (editingVariantIndex !== null) {
            const newVariants = [...variants]
            newVariants[editingVariantIndex] = {
                ...newVariants[editingVariantIndex],
                ...values,
            }
            setVariants(newVariants)
        }
        setVariantModalVisible(false)
        setEditingVariant(null)
        setEditingVariantIndex(null)
    }

    const handleSubmit = async (values: FormValues) => {
        const selectedCollections: Collection[] = values.collections ? values.collections.map(id => collections.find(c => c.id === id)).filter(c => c !== undefined) : [];
        const productData: Product = {
            id: product?.id || 0,
            name: values.name,
            content: content || '',
            summary: summary || '',
            attributes: attributes.filter(attr => attr.name && attr.values.length > 0),
            variants: variants,
            meta_title: values.meta_title || '',
            meta_description: values.meta_description || '',
            images: images,
            vendor: values.vendor ? values.vendor[0] || '' : '',
            product_type: values.product_type ? values.product_type[0] || '' : '',
            tags: values.tags || [],
            type: EProductType.Normal,
            status: EProductStatus.ACTIVE,
            collections: selectedCollections,
        }
        if (productData.variants.length == 0) {
            const defaultVariant: ProductVariant = {
                title: "Default Title",
                option1: "Default Title",
                sku: form.getFieldValue('sku') || '',
                barcode: form.getFieldValue('barcode') || '',
                price: form.getFieldValue('price'),
                compare_at_price: form.getFieldValue('compare_at_price') || 0,
                cost_price: form.getFieldValue('cost_price') || 0,
                tracked: form.getFieldValue('tracked') || false,
                lot_management: form.getFieldValue('lot_management') || false,
                requires_shipping: form.getFieldValue('requires_shipping') || true,
                position: 1,
                weight: form.getFieldValue('weight') || 0,
                weight_unit: form.getFieldValue('weight_unit') || 'g',
                unit: form.getFieldValue('unit') || '',
                inventory_quantities: inventoryQuantity
            }
            productData.variants.push(defaultVariant)

            const defaultAttribute: ProductAttribute = {
                name: "Title",
                values: ["Default Title"],
                position: 1
            }
            productData.attributes.push(defaultAttribute)
        }
        console.log("data::", productData)
        if (editMode && product) {
            await updateProduct(productData)
        } else {
            await createProduct(productData)
        }
    }

    useEffect(() => {
        if (!loading) {
            for (const location of locations) {
                setInventoryQuantity(prev => [...prev, { location_id: location.id, available: 0, on_hand: 0 }])
                setInventoryRows(prev => [...prev, { location_id: location.id, available: 0, on_hand: 0, key: location.id }])
            }
            if (editMode && product) {
                setContent(product.content)
                setSummary(product.summary)
                setOpenSummary(product.summary !== '')
                setOpenSeo(!!(product.meta_title || product.meta_description))
                form.setFieldsValue({
                    name: product.name,
                    meta_title: product.meta_title,
                    meta_description: product.meta_description,
                    vendor: product.vendor || undefined,
                    product_type: product.product_type || undefined,
                    tags: product.tags || [],
                    collections: product.collections.map(col => col.id)

                })
                setAttributes(product.attributes || [])
                setVariants(product.variants || [])
                setImages(product.images || [])
                const fileListFromImages: UploadFile[] = (product.images || []).map((img, index) => ({
                    uid: String(index),
                    name: img.filename,
                    status: 'done',
                    url: img.url,
                }))
                setFileList(fileListFromImages)
                setSelectedPublications([])

                if (product.attributes && product.attributes.length > 0 && product.variants && product.variants.length > 0 && product.attributes[0].name == "Title") {
                    setHasDefaultVariant(true);
                    form.setFieldsValue({
                        "sku": product.variants[0].sku,
                        "barcode": product.variants[0].barcode,
                        "unit": product.variants[0].unit,
                        "price": product.variants[0].price,
                        "compare_at_price": product.variants[0].compare_at_price,
                        "cost_price": product.variants[0].cost_price,
                        "tracked": product.variants[0].tracked,
                        "lot_management": product.variants[0].lot_management,
                        "requires_shipping": product.variants[0].requires_shipping,
                        "weight": product.variants[0].weight,
                        "weight_unit": product.variants[0].weight_unit,

                    });
                    setVariants([]);
                    setAttributes([]);
                }
            }
        }
    }, [loading])

    // Fetch inventory levels khi có default variant
    useEffect(() => {
        const fetchInventoryLevels = async () => {
            if (hasDefaultVariant && editMode && product?.variants?.[0]?.id) {
                try {
                    const res = await inventoryLevelService.getInventoryLevels({
                        variant_id: product.variants[0].id,
                        page: 1,
                        size: 100,
                    })
                    setInventoryLevels(res.inventory_levels || [])
                } catch (error) {
                    console.error('Error fetching inventory levels:', error)
                }
            }
        }
        fetchInventoryLevels()
    }, [hasDefaultVariant, editMode, product?.variants])

    const inventoryLevelColumns: ColumnsType<InventoryLevel> = [
        {
            title: 'Kho lưu trữ',
            dataIndex: 'location_name',
            key: 'location_name',
        },
        {
            title: 'Tồn kho',
            dataIndex: 'available',
            key: 'available',
            align: 'right',
            render: (val: number, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => openAdjustModal(record)}
                >
                    {val?.toLocaleString('vi-VN') ?? 0}
                </Button>
            ),
        },
        {
            title: 'Hàng đang về',
            dataIndex: 'committed',
            key: 'committed',
            align: 'right',
            render: (val: number) => val?.toLocaleString('vi-VN') ?? 0,
        },
        {
            title: 'Đang giao dịch',
            dataIndex: 'incoming',
            key: 'incoming',
            align: 'right',
            render: (val: number) => val?.toLocaleString('vi-VN') ?? 0,
        },
        {
            title: 'Có thể bán',
            dataIndex: 'on_hand',
            key: 'on_hand',
            align: 'right',
            render: (val: number) => val?.toLocaleString('vi-VN') ?? 0,
        },
    ]

    const openAdjustModal = (level: InventoryLevel) => {
        setSelectedLevel(level)
        setAdjustValue(0)
        setNewQuantity(level.available)
        setReason('fact_inventory')
        setAdjustModalVisible(true)
    }

    const handleChangeNewQuantity = (value: number | null) => {
        if (value === null || !selectedLevel) return
        setNewQuantity(value)
        setAdjustValue(value - (selectedLevel.available || 0))
    }

    const handleChangeAdjustValue = (value: number | null) => {
        if (value === null || !selectedLevel) return
        setAdjustValue(value)
        setNewQuantity((selectedLevel.available || 0) + value)
    }

    const handleSaveAdjust = async () => {
        if (!selectedLevel || !product?.variants?.[0]?.id) return
        if (!adjustValue) {
            setAdjustModalVisible(false)
            return
        }
        try {
            await inventoryLevelService.updateInventoryLevel({
                location_id: selectedLevel.location_id,
                variant_id: product.variants[0].id,
                reason,
                change_value: adjustValue,
                reference_document_id: 0,
            })
            setAdjustModalVisible(false)
            // Refetch inventory levels
            const res = await inventoryLevelService.getInventoryLevels({
                variant_id: product.variants[0].id,
                page: 1,
                size: 100,
            })
            setInventoryLevels(res.inventory_levels || [])
            notification.success({ message: 'Cập nhật tồn kho thành công' })
        } catch (error) {
            console.error('Error updating inventory level:', error)
            notification.error({ message: 'Cập nhật tồn kho thất bại' })
        }
    }

    const handleSelectPublication = (e: any, pub: TPublicationResponse) => {
        if (e.target.checked) {
            setSelectedPublications(prev => [...prev, pub])
        } else {
            setSelectedPublications(prev => prev.filter(item => item.id !== pub.id))
        }
    }

    const handleChangeInventory = (value: number | null, record: CreateInventoryQuantity) => {
        if (value === null) return

        const updatedRows = inventoryRows.map(row =>
            row.location_id === record.location_id ? { ...row, available: value, on_hand: value } : row
        )
        setInventoryRows(updatedRows)

        // 2️⃣ Cập nhật inventoryQuantity tổng
        const updatedInventory = inventoryQuantity.map(iq =>
            iq.location_id === record.location_id ? { ...iq, available: value, on_hand: value } : iq
        )
        setInventoryQuantity(updatedInventory)

        setVariants(prevVariants => prevVariants.map(variant => ({
            ...variant,
            inventory_quantities: updatedInventory
        })))
    }

    const handleUpload = async (options: any) => {
        console.log("upload::", options);
        const { file, onSuccess, onError } = options;
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'product');

            const uploaded = await attachmentService.uploadAttachment(formData);

            // ✅ Cập nhật URL hiển thị trong fileList
            setFileList((prev) =>
                prev.map((f) =>
                    f.uid === (file as any).uid ? { ...f, status: 'done', url: Array.isArray(uploaded) ? uploaded[0].url : uploaded.url } : f
                )
            );

            // ✅ Thêm uploaded vào images, đảm bảo images là mảng đơn
            setImages((prev) => {
                // Nếu uploaded là mảng, làm phẳng và thêm từng phần tử
                if (Array.isArray(uploaded)) {
                    return [...prev, ...uploaded];
                }
                // Nếu uploaded là một đối tượng Attachment, thêm trực tiếp
                return [...prev, uploaded];
            });

            onSuccess(uploaded);
        } catch (err) {
            notification.error({ message: 'Upload file thất bại' });
            onError(err);
        }
    };

    const handleRemove = (file: UploadFile) => {
        setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        setImages((prev) => prev.filter((img) => img.url !== file.url));
    };

    const handleChange = ({ fileList: newList }: { fileList: UploadFile[] }) => {
        setFileList(newList);
    };


    const inventoryColumns: ColumnsType<CreateInventoryQuantity> = [
        { title: 'Kho', dataIndex: 'location_id', render: (location_id) => locations.find(location => location.id === location_id)?.name || 'N/A' },
        { title: 'Tổng tồn kho', dataIndex: 'available', render: (available, record) => <InputNumber value={available} className="w-full" onChange={(value) => handleChangeInventory(value, record)} /> },
    ]

    const onBack = () => {
        router.back();
    }

    const handleDeleteVariant = (index: number) => {
        setIsModalDeleteVisible(true)
    }


    const handleAddMissingVariants = () => {
        const allCombinations = generateVariantCombinations(attributes)
        const existingTitles = new Set(variants.map(v => v.title))

        const missingVariants = allCombinations.filter(combo => !existingTitles.has(combo.title))

        if (missingVariants.length === 0) {
            notification.info({ message: 'Không có phiên bản nào còn thiếu' })
            return
        }

        const newVariants: ProductVariant[] = missingVariants.map((combo, index) => ({
            ...combo,
            sku: form.getFieldValue('sku') || '',
            barcode: form.getFieldValue('barcode') || '',
            price: form.getFieldValue('price'),
            compare_at_price: form.getFieldValue('compare_at_price') || 0,
            cost_price: form.getFieldValue('cost_price') || 0,
            tracked: form.getFieldValue('tracked') || false,
            lot_management: form.getFieldValue('lot_management') || false,
            requires_shipping: form.getFieldValue('requires_shipping') || true,
            position: variants.length + index + 1,
            weight: form.getFieldValue('weight') || 0,
            weight_unit: form.getFieldValue('weight_unit') || 'g',
            unit: form.getFieldValue('unit') || '',
            inventory_quantities: inventoryQuantity
        }))

        setVariants(prev => [...prev, ...newVariants])
        notification.success({ message: `Đã thêm ${newVariants.length} phiên bản mới` })
    }

    const getMissingVariantsCount = () => {
        const allCombinations = generateVariantCombinations(attributes)
        const existingTitles = new Set(variants.map(v => v.title))
        return allCombinations.filter(combo => !existingTitles.has(combo.title)).length
    }

    return (
        <>{loading ? <></> : <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className={`bg-white h-[65px] z-100 fixed top-0 left-0 w-full flex flex-col justify-center ${collapsed ? '!w-[calc(100%-80px)] left-20' : '!w-[calc(100%-256px)] left-64'} transition-all max-sm:!w-full max-sm:left-0`}>
                <div className="bg-white h-full  flex items-center justify-between shadow-lg w-full px-5">
                    <div className="flex gap-1 items-center">
                        <Button
                            className='!border !border-gray-200'
                            type="text"
                            icon={<ArrowLeft size={20} />}
                            onClick={onBack}
                        />
                    </div>
                    {editMode}
                    <Space>
                        {editMode ? <Button type="primary" size="large" onClick={form.submit}>
                            Lưu
                        </Button> : <Button type="primary" size="large" onClick={form.submit}>
                            Thêm sản phẩm
                        </Button>}
                    </Space>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1400px] mx-auto p-6">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={24}>
                        {/* Left Column */}
                        <Col xs={24} lg={16}>
                            {/* Thông tin sản phẩm */}
                            <Card className="!mb-2">
                                <h2 className="text-lg font-semibold mb-4">Thông tin sản phẩm</h2>
                                <Form.Item
                                    label="Tên sản phẩm"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                                >
                                    <Input placeholder="Nhập tên sản phẩm (tối đa 320 ký tự)" maxLength={320} />
                                </Form.Item>
                                {(!editMode || hasDefaultVariant) && <Row gutter={16}>
                                    <Col sm={{ span: 16 }} md={{ span: 12 }} lg={{ span: 8 }}>
                                        <Form.Item label="Mã SKU" name="sku">
                                            <Input placeholder="Nhập mã SKU (tối đa 50 ký tự)" maxLength={50} />
                                        </Form.Item>
                                    </Col>
                                    <Col sm={{ span: 16 }} md={{ span: 12 }} lg={{ span: 8 }}>
                                        <Form.Item label="Mã vạch/ Barcode" name="barcode">
                                            <Input placeholder="Nhập mã vạch/ Barcode (tối đa" />
                                        </Form.Item>
                                    </Col>
                                    <Col sm={{ span: 16 }} md={{ span: 12 }} lg={{ span: 8 }}>
                                        <Form.Item label="Đơn vị tính" name="unit">
                                            <Input placeholder="Nhập đơn vị tính" />
                                        </Form.Item>
                                    </Col>
                                </Row>}

                                <Form.Item label="Mô tả">
                                    <div className="">
                                        <TinyEditor value={content} onChange={setContent} />
                                    </div>

                                </Form.Item>
                                {!openSummary ? <Button type="link" className="px-0 mt-2" onClick={() => setOpenSummary(true)}>Thêm mô tả ngắn</Button> : <Form.Item label="Mô tả ngắn">
                                    <div className="">
                                        <TinyEditor value={summary} onChange={setSummary} />
                                    </div>

                                </Form.Item>}
                            </Card>

                            {/* Thông tin giá */}
                            {(!editMode || hasDefaultVariant) && <Card className="!mb-2">
                                <h2 className="text-lg font-semibold mb-4">Thông tin giá</h2>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Giá bán" name="price">
                                            <InputNumber
                                                className="w-full"
                                                placeholder="Nhập giá bán sản phẩm"
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                addonAfter="₫"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={
                                            <span>
                                                Giá so sánh{' '}
                                                <Tooltip title="Giá gốc trước khi giảm">
                                                    <Info size={14} className="inline text-gray-400" />
                                                </Tooltip>
                                            </span>
                                        } name="compare_at_price">
                                            <InputNumber
                                                className="w-full"
                                                placeholder="Nhập giá so sánh sản phẩm"
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                addonAfter="₫"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={
                                            <span>
                                                Giá vốn{' '}
                                                <Tooltip title="Giá nhập của sản phẩm">
                                                    <Info size={14} className="inline text-gray-400" />
                                                </Tooltip>
                                            </span>
                                        } name="cost_price">
                                            <InputNumber
                                                className="w-full"
                                                placeholder="Nhập giá vốn sản phẩm"
                                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                addonAfter="₫"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>}

                            {/* Thông tin kho */}
                            {!editMode && <Card className="!mb-2">
                                <h2 className="text-lg font-semibold mb-4">Thông tin kho</h2>
                                <Form.Item label="Lưu kho tại" name="location_id" initialValue={1}>
                                    <Select placeholder="Cửa hàng chính">
                                        <Select.Option value={1}>Cửa hàng chính</Select.Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="lot_management"
                                    valuePropName="checked"
                                    initialValue={true}
                                >
                                    <Checkbox onChange={(e) => setInventoryManagement(e.target.checked)}>
                                        Quản lý số lượng tồn kho
                                    </Checkbox>
                                </Form.Item>

                                {inventoryManagement && (
                                    <>
                                        <Form.Item name="tracked" valuePropName="checked">
                                            <Checkbox>Cho phép bán âm</Checkbox>
                                        </Form.Item>
                                        <div className="mt-4">
                                            <h3 className="font-medium mb-2">Bảng phân bổ tồn kho</h3>
                                            <Table
                                                dataSource={inventoryRows}
                                                columns={inventoryColumns}
                                                pagination={false}
                                                size="small"
                                            />
                                        </div>
                                    </>)}


                            </Card>}

                            {/* Thông tin kho - cho default variant */}
                            {editMode && hasDefaultVariant && <Card className="!mb-2">
                                <h2 className="text-lg font-semibold mb-4">Thông tin kho</h2>
                                <Space direction="vertical" className="w-full">
                                    <div className="flex flex-col gap-1">
                                        <Form.Item
                                            name="lot_management"
                                            valuePropName="checked"
                                        >
                                            <Checkbox>Quản lý tồn kho</Checkbox>
                                        </Form.Item>
                                        <Form.Item
                                            name="tracked"
                                            valuePropName="checked"
                                        >
                                            <Checkbox>Cho phép bán âm</Checkbox>
                                        </Form.Item>
                                        <Form.Item
                                            name="requires_shipping"
                                            valuePropName="checked"
                                        >
                                            <Checkbox>
                                                Sản phẩm yêu cầu vận chuyển
                                            </Checkbox>
                                        </Form.Item>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">
                                            Bảng phân bổ tồn kho
                                        </h3>
                                        <Table<InventoryLevel>
                                            size="small"
                                            dataSource={inventoryLevels}
                                            columns={inventoryLevelColumns}
                                            rowKey={(record) =>
                                                String(record.id)
                                            }
                                            pagination={false}
                                            loading={loading}
                                        />
                                    </div>
                                </Space>
                            </Card>}

                            {/* Vận chuyển */}
                            {(!editMode || hasDefaultVariant) && <Card className="!mb-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold mb-4">Vận chuyển</h2>
                                    <Form.Item name="requires_shipping" valuePropName="checked" initialValue={true}>
                                        <Checkbox>Sản phẩm yêu cầu vận chuyển</Checkbox>
                                    </Form.Item>
                                </div>

                                <Form.Item label="Khối lượng">
                                    <Space.Compact className="w-full">
                                        <Form.Item name="weight" noStyle>
                                            <InputNumber className="w-full" placeholder="0" />
                                        </Form.Item>
                                        <Form.Item name="weight_unit" noStyle initialValue="g">
                                            <Select style={{ width: 80 }}>
                                                <Select.Option value="g">g</Select.Option>
                                                <Select.Option value="kg">kg</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Space.Compact>
                                </Form.Item>
                            </Card>}

                            {/* Thuộc tính */}
                            <Card className="!mb-2">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        Thuộc tính
                                        <Tooltip title="Phiên bản sẽ tự động được tạo dựa trên sự kết hợp của các giá trị thuộc tính">
                                            <Info size={16} className="text-gray-400 cursor-help" />
                                        </Tooltip>
                                    </h2>
                                    {attributes.length == 0 && (<Button type="link" onClick={handleAddAttribute}>Thêm thuộc tính</Button>)}
                                </div>
                                <div className="space-y-4">
                                    {attributes.map((attr, index) => (
                                        <div key={index} className="border rounded p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1">
                                                    <div className="mb-3">
                                                        <label className="block mb-1 text-sm font-medium">Tên thuộc tính</label>
                                                        <Input
                                                            value={attr.name}
                                                            onChange={(e) => {
                                                                const newAttrs = [...attributes]
                                                                newAttrs[index].name = e.target.value
                                                                setAttributes(newAttrs)
                                                            }}
                                                            placeholder={`Thuộc tính ` + (index + 1)} maxLength={50}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block mb-1 text-sm font-medium">Giá trị</label>
                                                        <div className="flex gap-2 mb-2 flex-wrap">
                                                            {attr.values.map((value, vIndex) => (
                                                                <Tag
                                                                    key={vIndex}
                                                                    closable
                                                                    onClose={() => handleRemoveAttributeValue(index, vIndex)}
                                                                    color="blue"
                                                                >
                                                                    {value}
                                                                </Tag>
                                                            ))}
                                                        </div>
                                                        <Input
                                                            placeholder="Nhập ký tự và ấn enter"
                                                            value={attributeInput[index] || ''}
                                                            onChange={(e) => setAttributeInput({ ...attributeInput, [index]: e.target.value })}
                                                            onPressEnter={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddAttributeValue(index);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => handleRemoveAttribute(index)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {attributes.length > 0 && attributes.length < 3 && (
                                    <Button
                                        type="link"
                                        icon={<Plus size={16} />}
                                        onClick={handleAddAttribute}
                                        className="mt-3"
                                    >
                                        Thêm thuộc tính khác
                                    </Button>)}
                            </Card>

                            {/* Phiên bản */}
                            <Card className="!mb-2">
                                <div className='w-full flex items-center justify-between '>
                                    <h2 className="text-lg font-semibold mb-4">

                                        Phiên bản
                                        {variants.length > 0 && (
                                            <span className="text-sm text-gray-500 font-normal ml-2">
                                                ({variants.length} phiên bản)
                                            </span>
                                        )}
                                    </h2>
                                    {getMissingVariantsCount() > 0 && (
                                        <Button type="link" onClick={handleAddMissingVariants}>
                                            Thêm {getMissingVariantsCount()} phiên bản còn thiếu
                                        </Button>
                                    )}
                                </div>

                                {variants.length > 0 ? (
                                    <>
                                        <Table
                                            key={"kkks"}
                                            dataSource={variants}
                                            columns={variantColumns}
                                            pagination={false}
                                            size="small"
                                            rowKey="title"
                                        />
                                        <div className="mt-3 text-sm text-gray-600">
                                            Tổng tồn kho: Có thể bán: <strong>{inventoryQuantity.map(iq => iq.available).reduce((a, b) => a + b, 0) * variants.length}</strong>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <p>Chưa có phiên bản nào</p>
                                        <p className="text-xs mt-1">Thêm thuộc tính để tự động tạo phiên bản</p>
                                    </div>
                                )}
                            </Card>

                            {/* Tối ưu SEO */}
                            <Card className="!mb-2">
                                <div className="flex items-start justify-between">
                                    <h2 className="text-lg font-semibold mb-4">Tối ưu SEO</h2>

                                    {!openSeo && <Button type="link" className="px-0 mt-2" onClick={() => setOpenSeo(true)}>Chỉnh sửa SEO</Button>}
                                </div>

                                {openSeo && (
                                    <>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Xin hãy nhập Tiêu đề và Mô tả để xem trước kết quả tìm kiếm của sản phẩm này.
                                        </p>
                                        <Form.Item
                                            label={<span>Tiêu đề trang <span className="text-gray-400 text-xs">Số ký tự đã dùng 0/70</span></span>}
                                            name="meta_title"
                                        >
                                            <Input />
                                        </Form.Item>
                                        <Form.Item
                                            label={<span>Thẻ mô tả <span className="text-gray-400 text-xs">Số ký tự đã dùng 0/320</span></span>}
                                            name="meta_description"
                                        >
                                            <TextArea rows={3} />
                                        </Form.Item>
                                    </>)}
                            </Card>
                        </Col>

                        {/* Right Column */}
                        <Col xs={24} lg={8}>
                            {/* Ảnh sản phẩm */}
                            <Card className="!mb-2">
                                <div className="flex items-start justify-between mb-4">
                                    <h2 className="text-lg font-semibold">Ảnh sản phẩm</h2>
                                </div>
                                <Upload.Dragger
                                    multiple
                                    listType="picture-card"
                                    fileList={fileList}
                                    customRequest={handleUpload}
                                    onChange={handleChange}
                                    accept="image/*"
                                    onRemove={handleRemove}
                                >
                                    <div className="text-center !mb-2">
                                        <UploadIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm">Kéo thả hoặc chọn file</p>
                                    </div>
                                </Upload.Dragger>

                            </Card>

                            {/* Kênh bán hàng */}
                            <Card className="!mb-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">Kênh bán hàng</h2>
                                </div>
                                {publications && publications.length > 0 && (
                                    <Space direction="vertical" className="w-full mb-4">
                                        {publications.map(pub => (
                                            <Checkbox key={pub.id} onChange={(e) => handleSelectPublication(e, pub)}>
                                                <div>
                                                    <div className="font-medium">{pub.channel_name}</div>
                                                </div>
                                            </Checkbox>
                                        ))}
                                    </Space>
                                )}

                            </Card>

                            {/* Danh mục */}
                            <Card className="!mb-2">
                                <Form.Item label={
                                    <span className="flex items-center gap-1">
                                        Danh mục
                                        <Tooltip title="Chọn danh mục cho sản phẩm">
                                            <Info size={14} className="text-gray-400" />
                                        </Tooltip>
                                    </span>
                                } name="collections">
                                    <Select placeholder="Chọn danh mục" mode="multiple" options={collections.map(c => ({ label: c.name, value: c.id }))} notFoundContent="Không tìm thấy danh mục" />
                                </Form.Item>
                            </Card>

                            {/* Nhãn hiệu */}
                            <Card className="!mb-2">
                                <Form.Item label="Nhãn hiệu" name="vendor">
                                    <Select
                                        mode="tags"
                                        placeholder="Chọn nhãn hiệu"
                                        options={vendors.map(v => ({ label: v, value: v }))}
                                        maxTagCount={1}
                                        onChange={(values) => {
                                            console.log("selected vendor::", values)
                                            if (values.length > 1) {
                                                // Giữ lại giá trị mới nhất
                                                const latest = values[values.length - 1];
                                                form.setFieldValue('vendor', [latest]);
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </Card>


                            {/* Loại sản phẩm */}
                            <Card className="!mb-2">

                                <Form.Item label="Loại sản phẩm" name="product_type">
                                    <Select
                                        mode="tags"
                                        placeholder="Chọn loại sản phẩm"
                                        options={productTypes.map(pt => ({ label: pt, value: pt }))}
                                        maxTagCount={1}
                                        onChange={(values) => {

                                            if (values.length > 1) {
                                                // Giữ lại giá trị mới nhất
                                                const latest = values[values.length - 1];
                                                form.setFieldValue('product_type', [latest]);
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </Card>

                            {/* Tag */}
                            <Card className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Form.Item label="Tag" className="mb-0 flex-1" name="tags">
                                        <Select
                                            mode="tags"
                                            placeholder="Tìm kiếm hoặc thêm mới"
                                            className="w-full"
                                            options={tags.map(tag => ({ label: tag, value: tag }))}
                                        />
                                    </Form.Item>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Variant Edit Modal */}
            <Modal
                title={`Chỉnh sửa ${editingVariant?.title || ''}`}
                open={variantModalVisible}
                onCancel={() => {
                    setVariantModalVisible(false)
                    setEditingVariant(null)
                    setEditingVariantIndex(null)
                }}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setVariantModalVisible(false)
                        setEditingVariant(null)
                        setEditingVariantIndex(null)
                    }}>
                        Hủy
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={() => {
                            const values = {
                                sku: (document.getElementById('variant-sku') as HTMLInputElement)?.value || '',
                                barcode: (document.getElementById('variant-barcode') as HTMLInputElement)?.value || '',
                                price: parseFloat((document.getElementById('variant-price') as HTMLInputElement)?.value || '0'),
                                comparePrice: parseFloat((document.getElementById('variant-compare-price') as HTMLInputElement)?.value || '0'),
                            }
                            handleSaveVariant(values)
                        }}
                    >
                        Xác nhận
                    </Button>,
                ]}
                width={600}
            >
                <div className="space-y-4">
                    <Row gutter={16}>
                        <Col span={12}>
                            <label className="block mb-1 text-sm font-medium">Mã SKU</label>
                            <Input
                                id="variant-sku"
                                placeholder="Nhập mã SKU"
                                defaultValue={editingVariant?.sku}
                            />
                        </Col>
                        <Col span={12}>
                            <label className="block mb-1 text-sm font-medium">Mã vạch/Barcode</label>
                            <Input
                                id="variant-barcode"
                                placeholder="Nhập mã vạch/Barcode"
                                defaultValue={editingVariant?.barcode}
                            />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <label className="block mb-1 text-sm font-medium">Giá bán</label>
                            <InputNumber
                                id="variant-price"
                                className="w-full"
                                addonAfter="₫"
                                placeholder="0"
                                defaultValue={editingVariant?.price}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => Number(value?.replace(/\$\s?|(,*)/g, '') || 0)}
                            />

                        </Col>
                        <Col span={12}>
                            <label className="block mb-1 text-sm font-medium">Giá so sánh</label>
                            <InputNumber
                                id="variant-compare-price"
                                className="w-full"
                                addonAfter="₫"
                                placeholder="Nhập giá so sánh"
                                defaultValue={editingVariant?.compare_at_price}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => Number(value?.replace(/\$\s?|(,*)/g, '') || 0)}
                            />
                        </Col>
                    </Row>
                    <div className="text-right text-sm pt-2 border-t">
                        <div className="text-gray-600">
                            Giá bán: <strong className="text-gray-900">{editingVariant?.price && editingVariant?.price.toLocaleString('vi-VN')}₫</strong>
                        </div>
                        <div className="text-gray-600">

                            Có thể bán <strong className="text-gray-900">{inventoryQuantity?.reduce((sum, iq) => sum + (iq.available || 0), 0) || 0}</strong> tại <strong className="text-gray-900">1 kho</strong>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Variant Edit Modal */}
            <Modal
                title={`Chỉnh sửa ảnh ${editingVariant?.title || ''}`}
                open={imageSelectModalVisible}
                onCancel={() => setImageSelectModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setImageSelectModalVisible(false)}>
                        Hủy
                    </Button>,
                ]}
                width={640}
            >
                <div className="grid grid-cols-4 gap-3">
                    {images.map((img) => {
                        const isSelected =
                            selectingImageForVariantIndex !== null &&
                            variants[selectingImageForVariantIndex]?.image?.url === img.url;

                        return (
                            <div
                                key={img.id}
                                onClick={() => {
                                    if (selectingImageForVariantIndex !== null) {
                                        const newVariants = [...variants];
                                        newVariants[selectingImageForVariantIndex].image = img;
                                        newVariants[selectingImageForVariantIndex].image_id = img.id;
                                        setVariants(newVariants);
                                    }
                                }}
                                className={`relative cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 ${isSelected
                                    ? 'border-2 border-blue-500 ring-2 ring-blue-200'
                                    : 'border border-gray-200 hover:border-blue-400'
                                    }`}
                            >
                                <Image
                                    src={img.url}
                                    alt={img.filename || ''}
                                    width={150}
                                    height={150}
                                    className=""
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Modal>

            {/* Modal điều chỉnh tồn kho */}
            <Modal
                title="Điều chỉnh tồn kho"
                open={adjustModalVisible}
                onCancel={() => setAdjustModalVisible(false)}
                onOk={handleSaveAdjust}
                okText="Lưu"
                cancelText="Hủy"
            >
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Kho lưu trữ
                        </div>
                        <div className="font-medium">
                            {selectedLevel?.location_name || '-'}
                        </div>
                    </div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <div className="text-sm text-gray-500 mb-1">
                                Điều chỉnh
                            </div>
                            <InputNumber
                                className="w-full"
                                value={adjustValue}
                                onChange={handleChangeAdjustValue}
                            />
                        </Col>
                        <Col span={12}>
                            <div className="text-sm text-gray-500 mb-1">
                                Tồn kho mới
                            </div>
                            <InputNumber
                                className="w-full"
                                value={newQuantity}
                                onChange={handleChangeNewQuantity}
                            />
                        </Col>
                    </Row>
                    <div>
                        <div className="text-sm text-gray-500 mb-1">
                            Lý do
                        </div>
                        <Form.Item noStyle>
                            <Select
                                className="w-full"
                                value={reason}
                                onChange={(value: ChangeInventoryReason) => setReason(value)}
                                options={[
                                    {
                                        value: 'fact_inventory',
                                        label: 'Cập nhật tồn kho thực tế',
                                    },
                                    {
                                        value: 'create_product',
                                        label: 'Tạo sản phẩm',
                                    },
                                    {
                                        value: 'create_order',
                                        label: 'Tạo đơn hàng',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </div>
                </div>
            </Modal>
        </div>}
        </>
    )


}

export default CreateProduct