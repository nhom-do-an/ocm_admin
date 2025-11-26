
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';
import { CreateStaffRequest, GetListUsersRequest, GetStaffsRequest, UpdateStaffRequest } from '@/types/request/user';
import { TStaffListResponse, TUserListResponse, TUserSummaryResponse } from '@/types/response/user';
import { TUserResponse } from '@/types/response/auth';

const userService = {
    async getListUsers(params?: GetListUsersRequest): Promise<TUserListResponse> {
        const res = await Axios.get<TApiResponse<TUserListResponse>>(API.USER.GET_LIST_USERS, { params });
        return res.data.data as TUserListResponse;
    },

    async getOwner(): Promise<TUserResponse> {
        const res = await Axios.get<TApiResponse<TUserResponse>>(API.USER.GET_OWNER);
        return res.data.data as TUserResponse;
    },

    async getUserSummary(): Promise<TUserSummaryResponse> {
        const res = await Axios.get<TApiResponse<TUserSummaryResponse>>(API.USER.GET_USER_SUMMARY);
        return res.data.data as TUserSummaryResponse;
    },

    async getStaffs(params?: GetStaffsRequest): Promise<TStaffListResponse> {
        const res = await Axios.get<TApiResponse<TStaffListResponse>>(API.USER.GET_STAFFS, { params });
        return res.data.data as TStaffListResponse;
    },

    async createStaff(data: CreateStaffRequest): Promise<TUserResponse> {
        const res = await Axios.post<TApiResponse<TUserResponse>>(API.USER.CREATE_STAFF, data);
        return res.data.data as TUserResponse;
    },

    async updateStaff(data: UpdateStaffRequest): Promise<TUserResponse> {
        const res = await Axios.put<TApiResponse<TUserResponse>>(API.USER.UPDATE_STAFF(data.user_id), data);
        return res.data.data as TUserResponse;
    },
};

export default userService;
