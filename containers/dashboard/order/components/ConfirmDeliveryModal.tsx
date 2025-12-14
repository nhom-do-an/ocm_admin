'use client'

import React from 'react'
import { Modal, Button } from 'antd'
import { X } from 'lucide-react'

interface ConfirmDeliveryModalProps {
    open: boolean
    onCancel: () => void
    onConfirm: () => void
    loading?: boolean
}

const ConfirmDeliveryModal: React.FC<ConfirmDeliveryModalProps> = ({
    open,
    onCancel,
    onConfirm,
    loading = false,
}) => {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            closeIcon={<X size={20} />}
            className="!rounded-lg"
            width={480}
        >
            <div className="py-4">
                <h2 className="text-xl font-semibold mb-4">Xác nhận đơn hàng đã giao hàng</h2>
                <p className="text-gray-700 mb-6">
                    Bạn có chắc chắn muốn đánh dấu đơn hàng này đã được giao không?
                </p>
                <div className="flex justify-end gap-3">
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" onClick={onConfirm} loading={loading}>
                        Xác nhận
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default ConfirmDeliveryModal

