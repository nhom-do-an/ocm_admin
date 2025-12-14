import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { CreateFulfillmentRequest } from "@/types/request/order";
import { Fulfillment } from "@/types/response/order";

export interface FulfillmentLineItem {
    id?: number;
    fulfillment_id?: number;
    line_item_id?: number;
    quantity?: number;
}

const fulfillmentService = {
    async createFulfillment(data: CreateFulfillmentRequest): Promise<Fulfillment> {
        const res = await Axios.post<TApiResponse<Fulfillment>>(API.FULFILLMENT.CREATE, data);
        return res.data.data as Fulfillment;
    },
    async getFulfillmentLineItems(fulfillmentId: number): Promise<FulfillmentLineItem[]> {
        const res = await Axios.get<TApiResponse<FulfillmentLineItem[]>>(API.FULFILLMENT.GET_LINE_ITEMS(fulfillmentId));
        return res.data.data as FulfillmentLineItem[];
    },
};

export default fulfillmentService;

