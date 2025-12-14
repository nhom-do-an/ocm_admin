'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Radio } from 'antd'
import { EDeliveryStatus } from '@/types/enums/enum'

interface UpdateShipmentStatusModalProps {
    open: boolean
    currentStatus?: string
    onCancel: () => void
    onSave: (status: EDeliveryStatus) => Promise<void> | void
}

const statusOptions = [
    { value: EDeliveryStatus.PENDING, label: 'Chờ lấy hàng' },
    { value: EDeliveryStatus.PICKED_UP, label: 'Đã lấy hàng' },
    { value: EDeliveryStatus.DELIVERING, label: 'Đang giao hàng' },
    { value: EDeliveryStatus.DELIVERED, label: 'Đã giao hàng' },
    { value: EDeliveryStatus.CANCELLED, label: 'Hủy giao hàng' },
]

// Thứ tự trạng thái (theo thứ tự từ thấp đến cao)
const statusOrder: Record<string, number> = {
    [EDeliveryStatus.PENDING]: 1,
    [EDeliveryStatus.PICKED_UP]: 2,
    [EDeliveryStatus.DELIVERING]: 3,
    [EDeliveryStatus.DELIVERED]: 4,
    [EDeliveryStatus.CANCELLED]: 5, // Hủy có thể ở bất kỳ trạng thái nào
}

const UpdateShipmentStatusModal: React.FC<UpdateShipmentStatusModalProps> = ({
    open,
    currentStatus,
    onCancel,
    onSave,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<EDeliveryStatus | undefined>(undefined)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            setSelectedStatus(undefined)
        }
    }, [open])

    const getAvailableStatuses = () => {
        if (!currentStatus) return statusOptions

        const currentOrder = statusOrder[currentStatus] || 0

        // Nếu đã hủy, không thể chuyển sang trạng thái khác
        if (currentStatus === EDeliveryStatus.CANCELLED) {
            return []
        }

        // Nếu đã giao hàng, không thể chuyển sang trạng thái khác (trừ hủy)
        if (currentStatus === EDeliveryStatus.DELIVERED) {
            return statusOptions.filter(opt => opt.value === EDeliveryStatus.CANCELLED)
        }

        // Chỉ cho phép chuyển sang trạng thái có thứ tự cao hơn hoặc hủy
        return statusOptions.filter(opt => {
            const optOrder = statusOrder[opt.value] || 0
            return optOrder > currentOrder || opt.value === EDeliveryStatus.CANCELLED
        })
    }

    const handleSave = async () => {
        if (!selectedStatus) return
        setSaving(true)
        try {
            await onSave(selectedStatus)
        } finally {
            setSaving(false)
        }
    }

    const availableStatuses = getAvailableStatuses()

    return (
        <Modal
            open={open}
            title="Chuyển trạng thái giao hàng"
            onCancel={onCancel}
            onOk={handleSave}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{
                loading: saving,
                disabled: !selectedStatus || selectedStatus === currentStatus
            }}
        >
            <div className="space-y-3">
                {availableStatuses.length === 0 ? (
                    <p className="text-sm text-gray-500">Không thể chuyển trạng thái từ trạng thái hiện tại</p>
                ) : (
                    <Radio.Group
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full"
                    >
                        <div className="space-y-2">
                            {availableStatuses.map((option) => (
                                <Radio key={option.value} value={option.value} className="block">
                                    {option.label}
                                </Radio>
                            ))}
                        </div>
                    </Radio.Group>
                )}
            </div>
        </Modal>
    )
}

export default UpdateShipmentStatusModal

