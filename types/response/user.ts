import { TUserResponse } from "./auth";

export interface TUserListResponse {
    users: TUserResponse[];
    count: number;
}

export interface TStaffListResponse {
    staffs: TUserResponse[];
    count: number;
}

export interface TUserSummaryResponse {
    active_count: number;
    max_account: number;
}