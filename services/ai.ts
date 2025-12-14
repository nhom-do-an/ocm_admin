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
    async getTrendingPredictions(limit: number = 20): Promise<TrendingPredictionsResponse> {
        const res = await Axios.get<TApiResponse<TrendingPredictionsResponse>>(API.AI.GET_TRENDING_PREDICTIONS, {
            params: { limit },
        });
        return res.data.data as TrendingPredictionsResponse;
    },
};

export default aiService;

