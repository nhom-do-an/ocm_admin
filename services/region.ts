import { TGetRegionsRequest } from "@/types/request/region";
import Axios from "./axios";
import { API } from "@/constants/api";
import { TRegionResponse } from "@/types/response/region";
import { TApiResponse } from "@/types/response/response";


const regionService = {
    getListRegions: async (params: TGetRegionsRequest): Promise<TRegionResponse[]> => {
        const res = await Axios.get<TApiResponse<TRegionResponse[]>>(API.REGION.GET_REGIONS, { params });
        return res.data.data as TRegionResponse[];
    },
};
export default regionService;