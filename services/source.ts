import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { Source } from "@/types/response/source";

const sourceService = {
    async getListSources(): Promise<Source[]> {
        const res = await Axios.get<TApiResponse<Source[]>>(API.SOURCE.GET_SOURCES);
        return res.data.data as Source[];
    },
}

export default sourceService;

