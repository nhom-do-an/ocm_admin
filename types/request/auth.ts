export interface TLoginRequest {
    phone: string;
    password: string;
}

export interface TRegisterRequest {
    name: string;
    phone: string;
    password: string;
    province_code: string;
    store_name: string;
}