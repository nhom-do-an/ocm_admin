'use client'
import React from 'react'
import { Variant } from '@/services/variant'
import Image from 'next/image'

interface VariantCardProps {
    variant: Variant
    onClick: () => void
}

const VariantCard: React.FC<VariantCardProps> = ({ variant, onClick }) => {
    const isOutOfStock = (variant.inventory_quantity ?? 0) === 0 && variant.tracked === false
    return (
        <div
            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={onClick}
        >
            <div className="flex justify-between item-center w-full">
                <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        {variant.image?.url ? (
                            <Image
                                src={variant.image.url}
                                alt={variant.product_name || ''}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                            {variant.product_name || 'Sản phẩm'}
                        </div>
                        {variant.title && (
                            <div className="text-xs text-gray-500 mt-1">
                                {variant.title}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-start gap-1 flex-col justify-center">


                    {isOutOfStock ? (
                        <span className="text-xs font-medium text-red-600">Hết hàng</span>
                    ) : variant.inventory_quantity !== undefined && (
                        <span className="text-xs text-blue-500">
                            Có thể bán: {variant.inventory_quantity}
                        </span>
                    )}
                    {variant.sku && (
                        <span className="text-xs text-gray-400">
                            SKU: {variant.sku}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VariantCard

