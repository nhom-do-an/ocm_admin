
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';
import { StoreDetail } from '@/types/response/store';
import { UpdateStoreRequest, UploadStoreLogoRequest } from '@/types/request/store';

const storeService = {
    async checkStore(): Promise<boolean> {
        const res = await Axios.get<TApiResponse<boolean>>(API.STORE.CHECK_STORE);
        return res.data.data as boolean;
    },

    async getStoreDetail(storeId: number): Promise<StoreDetail> {
        const res = await Axios.get<TApiResponse<StoreDetail>>(API.STORE.GET_DETAIL(storeId));
        return res.data.data as StoreDetail;
    },

    async updateStore(data: UpdateStoreRequest): Promise<void> {
        await Axios.put<TApiResponse<void>>(API.STORE.UPDATE, data);
    },

    async uploadLogo(storeId: number, data: UploadStoreLogoRequest): Promise<void> {
        await Axios.post<TApiResponse<void>>(API.STORE.UPLOAD_LOGO(storeId), data);
    },
};

export default storeService;