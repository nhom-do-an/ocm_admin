import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { TrendingResponse, TrendingPredictionsResponse } from "@/types/response/trending";

const aiService = {
    async getTrending(n: number = 20): Promise<TrendingResponse> {
        const res = await Axios.get<TApiResponse<TrendingResponse>>(API.AI.GET_TRENDING, {
            params: { n },
        });
        return res.data.data as TrendingResponse;
    },
    async getTrendingPredictions(limit: number = 20, date?: string): Promise<TrendingPredictionsResponse> {
        const params: Record<string, string | number> = { limit };
        if (date) {
            params.date = date;
        }
        const res = await Axios.get<TApiResponse<TrendingPredictionsResponse>>(API.AI.GET_TRENDING_PREDICTIONS, {
            params,
        });
        return res.data.data as TrendingPredictionsResponse;
    },
};

export default aiService;

