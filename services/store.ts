
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';

const storeService = {
    async checkStore(): Promise<boolean> {
        const res = await Axios.get<TApiResponse<boolean>>(API.STORE.CHECK_STORE);
        return res.data.data as boolean;
    }
};

export default storeService;