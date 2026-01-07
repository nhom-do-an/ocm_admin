export enum NotificationCategory {
    ORDER = 'order',
    SHIPPING = 'shipping',
    CUSTOMER = 'customer',
}

export interface NotificationTemplate {
    id: number
    template: string
    name: string
    description: string
    subject: string
    content: string
    active: boolean
    can_edit_active: boolean
    category: NotificationCategory
    store_id: number
    html_content: string
    created_at: string
    updated_at: string
}

