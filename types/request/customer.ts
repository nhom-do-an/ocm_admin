export interface GetListCustomersRequest {
    store_id?: number;
    key?: string;
    status?: 'enabled' | 'disabled';
    page?: number;
    limit?: number;
}

export interface CreateCustomerRequest {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    gender?: 'male' | 'female' | 'other';
    dob?: string;
    note?: string;
    address_info?: CreateCustomerAddressRequest;
}

export interface CreateCustomerAddressRequest {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
    address: string;
    province_code: string;
    district_code: string;
    ward_code: string;
    zip?: string;
    is_default?: boolean;
    is_new_address?: boolean;
}