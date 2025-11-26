'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from 'antd'
import Image, { type StaticImageData } from 'next/image'

interface EmptyStateProps {
    imageSrc: string | StaticImageData
    title: string
    description?: string
    actionLabel?: string
    actionHref?: string
    actionTarget?: string
    imageAlt?: string
    onActionClick?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
    imageSrc,
    title,
    description,
    actionLabel,
    actionHref,
    actionTarget,
    imageAlt,
    onActionClick,
}) => {
    return (
        <div className="flex flex-col items-center text-center py-10 gap-4">
            <Image
                src={imageSrc}
                alt={imageAlt || title}
                width={60}
                height={60}
                className="object-contain"
                priority={false}
            />
            <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {description && <p className="text-xs text-gray-500 leading-relaxed">{description}</p>}
            </div>
            {actionLabel && (actionHref || onActionClick) && (
                actionHref ? (
                    <Link href={actionHref} target={actionTarget}>
                        <Button size="middle" className="secondary-button">
                            {actionLabel}
                        </Button>
                    </Link>
                ) : (
                    <Button size="middle" className="secondary-button" onClick={onActionClick}>
                        {actionLabel}
                    </Button>
                )
            )}
        </div>
    )
}

export default EmptyState
