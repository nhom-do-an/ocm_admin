
export interface TTokenResponse {
    access_token: string;
    refresh_token: string;
}

export interface TUserResponse {
    id: number;
    name: string;
    phone: string;
    email: string;
    store_id: number;
    is_owner: boolean;
    domain_store: string;
    username: string;
    first_name: string;
    last_name: string;
    verified_email: boolean;
    active: boolean;
    login_method: number;
    last_login: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface TAuthResponse extends TTokenResponse, TUserResponse {
}

