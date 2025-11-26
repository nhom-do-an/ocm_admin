export interface GetListUsersRequest {
    key?: string;
    page?: number;
    size?: number;
}

export interface GetStaffsRequest {
    key?: string;
    page?: number;
    size?: number;
}

export interface CreateStaffRequest {
    first_name: string;
    last_name?: string;
    email?: string;
    phone: string;
    password: string;
    active?: boolean;
}

export interface UpdateStaffRequest {
    user_id: number;
    first_name: string;
    last_name?: string;
    email?: string;
    phone: string;
    password?: string;
    active?: boolean;
}