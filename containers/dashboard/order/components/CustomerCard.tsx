'use client'

import React from 'react'
import { Customer } from '@/types/response/customer'

interface CustomerCardProps {
    customer: Customer
    onClick: () => void
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
    const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim() || customer.email || 'Khách hàng'
    const phone = customer.default_address?.phone || customer.phone || 'Chưa có số điện thoại'
    const email = customer.email

    return (
        <div
            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={onClick}
        >
            <div className="font-medium text-sm text-gray-900">{fullName}</div>
            <div className="text-xs text-gray-500 mt-1">{phone}</div>
            {email && <div className="text-xs text-gray-400">{email}</div>}
        </div>
    )
}

export default CustomerCard

