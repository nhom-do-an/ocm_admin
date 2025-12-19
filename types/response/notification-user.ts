export interface NotificationMetadata {
    order_id?: number;
    shipment_id?: number;
    [key: string]: unknown;
}

export interface Notification {
    id: number;
    title: string;
    content: string;
    detail_content?: string;
    image?: string;
    topic: string;
    type: string;
    html_content?: string;
    created_user_id?: string;
    metadata?: NotificationMetadata;
    status: string;
    schedule_time?: string;
    created_at: string;
    updated_at?: string;
}

export interface NotificationRead {
    id: number;
    title: string;
    content: string;
    detail_content?: string;
    image?: string;
    topic: string;
    type: string;
    html_content?: string;
    created_user_id?: string;
    metadata?: NotificationMetadata;
    status: string;
    schedule_time?: string;
    created_at: string;
    updated_at?: string;
    read: boolean;
}

export interface GetListNotificationsResponse {
    count: number;
    notifications: NotificationRead[];
}

export interface CountUnreadNotificationsResponse {
    count: number;
}

