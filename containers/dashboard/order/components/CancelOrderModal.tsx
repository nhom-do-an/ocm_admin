'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Checkbox, Select, Input } from 'antd'

interface CancelOrderModalProps {
    open: boolean
    onCancel: () => void
    onConfirm: (data: { cancel_reason: string; restore_inventory?: boolean; send_email?: boolean }) => void
    loading?: boolean
}

const cancelReasons = [
    { value: 'customer', label: 'Khách hàng yêu cầu hủy' },
    { value: 'inventory', label: 'Không đủ hàng trong kho' },
    { value: 'fraud', label: 'Đơn hàng gian lận' },
    { value: 'other', label: 'Lý do khác' },
]

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
    open,
    onCancel,
    onConfirm,
    loading = false,
}) => {
    const [restoreInventory, setRestoreInventory] = useState(true)
    const [sendEmail, setSendEmail] = useState(true)
    const [cancelReason, setCancelReason] = useState<string>('')
    const [otherReason, setOtherReason] = useState<string>('')

    useEffect(() => {
        if (open) {
            setRestoreInventory(true)
            setSendEmail(true)
            setCancelReason('')
            setOtherReason('')
        }
    }, [open])

    const handleConfirm = () => {
        const reason = cancelReason === 'other' ? otherReason : cancelReason
        if (!reason || reason.trim() === '') {
            return
        }
        onConfirm({
            cancel_reason: reason,
            restore_inventory: restoreInventory,
            send_email: sendEmail,
        })
    }

    const handleCancel = () => {
        setCancelReason('')
        setOtherReason('')
        onCancel()
    }

    return (
        <Modal
            title="Hủy đơn hàng"
            open={open}
            onOk={handleConfirm}
            onCancel={handleCancel}
            okText="Hủy đơn hàng"
            cancelText="Không phải bây giờ"
            okButtonProps={{
                danger: true,
                loading,
                disabled: !cancelReason || (cancelReason === 'other' && !otherReason.trim()),
            }}
        >
            <div className="space-y-4">
                <div>
                    <Checkbox
                        checked={restoreInventory}
                        onChange={(e) => setRestoreInventory(e.target.checked)}
                    >
                        Hoàn kho tất cả sản phẩm
                    </Checkbox>
                </div>

                <div>
                    <Checkbox
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                    >
                        Gửi thông báo qua email đến khách hàng
                    </Checkbox>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Lý do hủy đơn</label>
                    <Select
                        placeholder="Chọn lý do hủy đơn"
                        value={cancelReason}
                        onChange={setCancelReason}
                        className="w-full"
                        options={cancelReasons}
                    />
                </div>

                {cancelReason === 'other' && (
                    <div>
                        <label className="block text-sm font-medium mb-2">Lý do khác</label>
                        <Input
                            placeholder="Nhập lý do hủy đơn"
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default CancelOrderModal

