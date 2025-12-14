'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Input } from 'antd'

const { TextArea } = Input

interface UpdateShipmentNoteModalProps {
    open: boolean
    defaultValue?: string
    onCancel: () => void
    onSave: (note: string) => Promise<void> | void
}

const UpdateShipmentNoteModal: React.FC<UpdateShipmentNoteModalProps> = ({
    open,
    defaultValue = '',
    onCancel,
    onSave,
}) => {
    const [value, setValue] = useState(defaultValue)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            setValue(defaultValue || '')
        }
    }, [defaultValue, open])

    const handleSave = async () => {
        setSaving(true)
        try {
            await onSave(value.trim())
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal
            open={open}
            title="Sửa ghi chú"
            onCancel={onCancel}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            okButtonProps={{ loading: saving }}
        >
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nội dung ghi chú</label>
                <TextArea
                    rows={4}
                    placeholder="Nhập nội dung ghi chú"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
        </Modal>
    )
}

export default UpdateShipmentNoteModal

