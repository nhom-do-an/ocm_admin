import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { CreateOrderPaymentRequest, CreateOrderRequest, GetListOrdersRequest, UpdateOrderItemsRequest, UpdateOrderRequest } from "@/types/request/order";
import { GetListOrdersResponse, OrderDetail } from "@/types/response/order";
import { GetEventsRequest } from "@/types/request/event";
import { GetListEventsResponse } from "@/types/response/event";
import { Transaction } from "@/types/response/transation";

const orderService = {
    async getListOrders(
        params: GetListOrdersRequest
    ): Promise<GetListOrdersResponse> {
        const res = await Axios.get<TApiResponse<GetListOrdersResponse>>(API.ORDER.GET_ORDERS, {
            params,
        });
        return res.data.data as GetListOrdersResponse;
    },

    async createOrder(
        data: CreateOrderRequest
    ): Promise<OrderDetail> {
        const res = await Axios.post<TApiResponse<OrderDetail>>(API.ORDER.CREATE_ORDER, data);
        return res.data.data as OrderDetail;
    },

    async getOrderDetail(
        id: number
    ): Promise<OrderDetail> {
        const res = await Axios.get<TApiResponse<OrderDetail>>(API.ORDER.GET_ORDER_DETAIL(id));
        return res.data.data as OrderDetail;
    },

    async getOrderEvents(
        data: GetEventsRequest
    ): Promise<GetListEventsResponse> {
        const res = await Axios.get<TApiResponse<GetListEventsResponse>>(API.ORDER.GET_EVENTS(data.subject_id || 0), {
            params: data,
        });
        return res.data.data as GetListEventsResponse;
    },

    async getOrderTransactions(
        id: number
    ): Promise<Transaction[]> {
        const res = await Axios.get<TApiResponse<Transaction[]>>(API.ORDER.GET_TRANSACTIONS(id));
        return res.data.data as Transaction[];
    },

    async updateOrder(
        id: number,
        data: UpdateOrderRequest
    ): Promise<OrderDetail> {
        const res = await Axios.put<TApiResponse<OrderDetail>>(API.ORDER.UPDATE_ORDER(id), data);
        return res.data.data as OrderDetail;
    },

    async createOrderPayments(
        id: number,
        data: CreateOrderPaymentRequest
    ): Promise<OrderDetail> {
        const res = await Axios.post<TApiResponse<OrderDetail>>(API.ORDER.CREATE_ORDER_PAYMENTS(id), data);
        return res.data.data as OrderDetail;
    },
    async GetOrderPrint(
        id: number
    ): Promise<string> {
        const res = await Axios.get<TApiResponse<string>>(API.ORDER.GET_ORDER_PRINT(id));
        return res.data.data as string;
    },

    async updateOrderItems(
        id: number,

        data: UpdateOrderItemsRequest
    ): Promise<OrderDetail> {
        const res = await Axios.put<TApiResponse<OrderDetail>>(API.ORDER.UPDATE_ORDER_ITEMS(id), data);
        return res.data.data as OrderDetail;
    },

    async cancelOrder(
        id: number,
        data: import('@/types/request/order').CancelOrderRequest
    ): Promise<OrderDetail> {
        const res = await Axios.put<TApiResponse<OrderDetail>>(API.ORDER.CANCEL_ORDER(id), data);
        return res.data.data as OrderDetail;
    }
}

export default orderService;







