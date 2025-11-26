import Axios from "./axios";
import { API } from "@/constants/api";
import { IShippingRate } from "@/types/request/order";
import { TApiResponse } from "@/types/response/response";


const shippingRateService = {
    getListShippingRates: async (shippingAreaId: number): Promise<IShippingRate[]> => {
        const res = await Axios.get<TApiResponse<IShippingRate[]>>(API.SHIPPING_RATE.GET_LIST, { params: { shippingAreaId } });
        return res.data.data as IShippingRate[];
    },
};
export default shippingRateService;