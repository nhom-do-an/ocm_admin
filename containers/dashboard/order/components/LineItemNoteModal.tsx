'use client'

import React, { useEffect, useState } from 'react'
import { Modal, Input } from 'antd'

const { TextArea } = Input

interface LineItemNoteModalProps {
    open: boolean
    defaultValue?: string
    onCancel: () => void
    onSave: (note: string) => void
}

const LineItemNoteModal: React.FC<LineItemNoteModalProps> = ({
    open,
    defaultValue = '',
    onCancel,
    onSave,
}) => {
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        if (open) {
            setValue(defaultValue || '')
        }
    }, [defaultValue, open])

    const handleSave = () => {
        onSave(value.trim())
    }

    return (
        <Modal
            open={open}
            title="Thêm ghi chú"
            onCancel={onCancel}
            footer={null}
            centered
            destroyOnClose
        >
            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Nội dung ghi chú</label>
                    <TextArea
                        rows={4}
                        placeholder="Nhập nội dung ghi chú"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50"
                        onClick={onCancel}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        onClick={handleSave}
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default LineItemNoteModal









