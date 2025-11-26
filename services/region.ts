import { TGetRegionsRequest } from "@/types/request/region";
import Axios from "./axios";
import { API } from "@/constants/api";
import { TRegionResponse } from "@/types/response/region";
import { TApiResponse } from "@/types/response/response";
import { GetListOldRegionRequest } from "@/types/request/old-region";
import { OldRegion } from "@/types/response/old-region";


const regionService = {
    getListRegions: async (params: TGetRegionsRequest): Promise<TRegionResponse[]> => {
        const res = await Axios.get<TApiResponse<TRegionResponse[]>>(API.REGION.GET_REGIONS, { params });
        return res.data.data as TRegionResponse[];
    },
    getListOldRegions: async (params: GetListOldRegionRequest): Promise<OldRegion[]> => {
        const res = await Axios.get<TApiResponse<OldRegion[]>>(API.OLD_REGION.GET_LIST, { params });
        return res.data.data as OldRegion[];
    },
};
export default regionService;