export interface Customer {
    id?: number;
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    orders_count?: number;
    total_spent?: number;
    last_order_id?: number;
    last_order_name?: string;
    gender?: 'male' | 'female' | 'other';
    dob?: string;
    note?: string;
    status?: 'enabled' | 'disabled';
    verified_email?: boolean;
    store_id?: number;
    created_at?: string;
    updated_at?: string;
    default_address?: AddressDetail;
}

export interface GetListCustomersResponse {
    customers: Customer[];
    count: number;
}

export interface AddressDetail {
    id?: number;
    customer_id?: number;
    address?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    zip?: string;
    is_new_region?: boolean;
    default_address?: boolean;
    province_code?: string;
    district_code?: string;
    ward_code?: string;
    province_name?: string;
    district_name?: string;
    ward_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CustomerDetail extends Customer {
    orders_count?: number;
    total_spent?: number;
    last_order_id?: number;
    last_order_name?: string;
    default_address?: AddressDetail;
}

