'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Modal, Button, Checkbox, Input, Space, List, Tooltip } from 'antd'
import { ArrowUp, ArrowDown, X } from 'lucide-react'

export type OrderColumnKey =
    | 'order_name'
    | 'customer'
    | 'source'
    | 'order_status'
    | 'packaging_status'
    | 'processing_status'
    | 'delivery_status'
    | 'financial_status'
    | 'location'
    | 'channel'
    | 'total_price'
    | 'cancel_reason'
    | 'note'
    | 'created_user'
    | 'shipping_address'
    | 'shipping_method'
    | 'shipping_fee'
    | 'payment_method'
    | 'created_at'
    | 'confirmed_on'
    | 'expected_delivery_date'
    | 'canceled_on'

export const REQUIRED_COLUMN: OrderColumnKey = 'order_name'

export const ALL_COLUMNS: { key: OrderColumnKey; label: string }[] = [
    { key: 'order_name', label: 'Mã đơn hàng' },
    { key: 'customer', label: 'Khách hàng' },
    { key: 'source', label: 'Nguồn đơn' },
    { key: 'order_status', label: 'Trạng thái đơn hàng' },
    { key: 'packaging_status', label: 'Trạng thái đóng gói' },
    { key: 'processing_status', label: 'Trạng thái xử lý' },
    { key: 'delivery_status', label: 'Trạng thái giao hàng' },
    { key: 'financial_status', label: 'Trạng thái thanh toán' },
    { key: 'location', label: 'Chi nhánh tạo đơn' },
    { key: 'channel', label: 'Kênh bán hàng' },
    { key: 'total_price', label: 'Thành tiền' },
    { key: 'cancel_reason', label: 'Lý do huỷ đơn' },
    { key: 'note', label: 'Ghi chú' },
    { key: 'created_user', label: 'Nhân viên tạo đơn' },
    { key: 'shipping_address', label: 'Địa chỉ giao hàng' },
    { key: 'shipping_method', label: 'Phương thức vận chuyển' },
    { key: 'shipping_fee', label: 'Phí giao hàng' },
    { key: 'payment_method', label: 'Phương thức thanh toán' },
    { key: 'created_at', label: 'Ngày đặt hàng' },
    { key: 'confirmed_on', label: 'Ngày xác nhận' },
    { key: 'expected_delivery_date', label: 'Ngày hẹn giao' },
    { key: 'canceled_on', label: 'Ngày huỷ đơn' },
]

interface Props {
    open: boolean
    onClose: () => void
    value: OrderColumnKey[]
    onSave: (cols: OrderColumnKey[]) => void
}

const ColumnSettingsModal: React.FC<Props> = ({ open, onClose, value, onSave }) => {
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState<OrderColumnKey[]>(value || [])

    // Sync state with prop when modal opens or value changes
    useEffect(() => {
        if (open && value) {
            setSelected(value)
        }
    }, [open, value])

    const leftOptions = useMemo(() =>
        ALL_COLUMNS.filter(c => c.label.toLowerCase().includes(search.toLowerCase())),
        [search]
    )

    const toggle = (key: OrderColumnKey) => {
        if (key === REQUIRED_COLUMN) return
        setSelected(prev => {
            const current = prev || []
            return current.includes(key) ? current.filter(k => k !== key) : [...current, key]
        })
    }

    const move = (index: number, dir: -1 | 1) => {
        setSelected(prev => {
            const current = prev || []
            const next = [...current]
            const to = index + dir
            if (to < 0 || to >= next.length) return next
            const [item] = next.splice(index, 1)
            next.splice(to, 0, item)
            return next
        })
    }

    const remove = (index: number) => {
        const current = selected || []
        const key = current[index]
        if (key === REQUIRED_COLUMN) return
        setSelected(prev => {
            const current = prev || []
            return current.filter((_, i) => i !== index)
        })
    }

    const handleOk = () => {
        const current = selected || []
        const ensureRequired = current.includes(REQUIRED_COLUMN)
            ? current
            : [REQUIRED_COLUMN, ...current]
        onSave(ensureRequired)
        onClose()
    }

    return (
        <Modal
            title="Điều chỉnh cột hiển thị trên trang danh sách"
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Lưu"
            width={900}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="mb-2 font-medium">Thêm cột hiển thị</div>
                    <Input
                        placeholder="Tìm kiếm cột hiển thị"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="!mb-3"
                    />
                    <div className="max-h-80 overflow-y-auto border rounded p-3 border-gray-300">
                        <Checkbox.Group value={selected} className="w-full">
                            <Space direction="vertical" className="w-full">
                                {leftOptions.map((opt) => (
                                    <Checkbox
                                        key={opt.key}
                                        value={opt.key}
                                        disabled={opt.key === REQUIRED_COLUMN}
                                        onChange={() => toggle(opt.key)}
                                    >
                                        {opt.label}
                                        {opt.key === REQUIRED_COLUMN && (
                                            <Tooltip title="Cột bắt buộc">
                                                <span className="ml-2 text-xs text-gray-400">(bắt buộc)</span>
                                            </Tooltip>
                                        )}
                                    </Checkbox>
                                ))}
                            </Space>
                        </Checkbox.Group>
                    </div>
                </div>
                <div>
                    <div className="mb-2 font-medium">Sắp xếp cột hiển thị</div>
                    <div className="border rounded max-h-80 overflow-y-auto border-gray-300 px-5 py-2">
                        <List
                            dataSource={selected}
                            renderItem={(key, index) => (
                                <List.Item
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', String(index))
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const from = Number(e.dataTransfer.getData('text/plain'))
                                        if (Number.isNaN(from) || from === index) return
                                        setSelected(prev => {
                                            const next = [...prev]
                                            const [item] = next.splice(from, 1)
                                            next.splice(index, 0, item)
                                            return next
                                        })
                                    }}
                                    actions={[
                                        <Button key="up" type="text" onClick={() => move(index, -1)} icon={<ArrowUp size={16} />} />,
                                        <Button key="down" type="text" onClick={() => move(index, 1)} icon={<ArrowDown size={16} />} />,
                                        key !== REQUIRED_COLUMN ? (
                                            <Button key="rm" type="text" danger onClick={() => remove(index)} icon={<X size={16} />} />
                                        ) : <span key="req" className="text-xs text-gray-400">Bắt buộc</span>
                                    ]}
                                >
                                    {ALL_COLUMNS.find(c => c.key === key)?.label}
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ColumnSettingsModal
