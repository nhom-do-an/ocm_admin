'use client'

import React, { useEffect, useState } from 'react'
import { Modal, DatePicker, Space, Button } from 'antd'
import dayjs, { Dayjs } from 'dayjs'

interface UpdateExpectedDeliveryModalProps {
    open: boolean
    defaultValue?: string | null
    onCancel: () => void
    onSave: (timestamp: number | null) => Promise<void> | void
}

const UpdateExpectedDeliveryModal: React.FC<UpdateExpectedDeliveryModalProps> = ({
    open,
    defaultValue,
    onCancel,
    onSave,
}) => {
    const [value, setValue] = useState<Dayjs | null>(defaultValue ? dayjs(defaultValue) : null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            setValue(defaultValue ? dayjs(defaultValue) : null)
        }
    }, [open, defaultValue])

    const handleConfirm = async () => {
        setSaving(true)
        try {
            await onSave(value ? value.valueOf() : null)
        } finally {
            setSaving(false)
        }
    }

    const handleClear = () => {
        setValue(null)
    }

    return (
        <Modal
            open={open}
            title="Cập nhật ngày hẹn giao"
            onCancel={onCancel}
            onOk={handleConfirm}
            okText="Áp dụng"
            cancelText="Hủy"
            okButtonProps={{ loading: saving }}
        >
            <div className="space-y-3">
                <Space direction="vertical" className="w-full">
                    <DatePicker
                        className="w-full"
                        value={value}
                        onChange={setValue}
                        showTime={{ format: 'HH:mm' }}
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Chọn ngày hẹn giao"
                    />
                    <Button type="link" className="!px-0" onClick={handleClear}>
                        Xóa ngày hẹn giao
                    </Button>
                </Space>
            </div>
        </Modal>
    )
}

export default UpdateExpectedDeliveryModal









