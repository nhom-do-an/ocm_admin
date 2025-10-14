
import { TAuthResponse, TUserResponse } from '@/types/response/auth';
import Axios from './axios';
import { TLoginRequest, TRegisterRequest } from '@/types/request/auth';
import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';

const authService = {
    async login(datalogin: TLoginRequest): Promise<TAuthResponse> {
        const res = await Axios.post<TApiResponse<TAuthResponse>>(API.AUTH.LOGIN, datalogin);
        return res.data.data as TAuthResponse;
    },

    async register(data: TRegisterRequest): Promise<TAuthResponse> {
        const res = await Axios.post<TApiResponse<TAuthResponse>>(API.AUTH.REGISTER, data);
        return res.data.data as TAuthResponse;
    },

    async getProfile(): Promise<TUserResponse> {
        const res = await Axios.get<TApiResponse<TUserResponse>>(API.AUTH.PROFILE);
        return res.data.data as TUserResponse;
    }
};

export default authService;