
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';

const locationService = {
    async getListLocation(): Promise<Location[]> {
        const res = await Axios.get<TApiResponse<Location[]>>(API.LOCATION.LIST);
        return res.data.data as Location[];
    }
};

export default locationService;