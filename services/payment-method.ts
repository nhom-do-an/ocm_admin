import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { GetListPaymentMethodsRequest, CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from "@/types/request/payment-method";
import { GetListPaymentMethodsResponse, PaymentMethodDetail, PaymentProvider } from "@/types/response/payment-method";

const paymentMethodService = {
    async getListPaymentMethods (
        params?: GetListPaymentMethodsRequest
    ): Promise<GetListPaymentMethodsResponse> {
        const res = await Axios.get<TApiResponse<GetListPaymentMethodsResponse>>(API.PAYMENT_METHOD.GET_PAYMENT_METHODS, {
            params,
        });
        return res.data.data as GetListPaymentMethodsResponse;
    },

    async getPaymentMethodDetail(id: number): Promise<PaymentMethodDetail> {
        const res = await Axios.get<TApiResponse<PaymentMethodDetail>>(API.PAYMENT_METHOD.GET_DETAIL(id));
        return res.data.data as PaymentMethodDetail;
    },

    async createPaymentMethod(data: CreatePaymentMethodRequest) {
        const res = await Axios.post<TApiResponse<PaymentMethodDetail>>(API.PAYMENT_METHOD.CREATE, data);
        return res.data.data as PaymentMethodDetail;
    },

    async updatePaymentMethod(data: UpdatePaymentMethodRequest) {
        const res = await Axios.put<TApiResponse<PaymentMethodDetail>>(API.PAYMENT_METHOD.UPDATE, data);
        return res.data.data as PaymentMethodDetail;
    },

    async getListProviders(): Promise<PaymentProvider[]> {
        const res = await Axios.get<TApiResponse<PaymentProvider[]>>(API.PAYMENT_METHOD.GET_PROVIDERS);
        return res.data.data as PaymentProvider[];
    },
}

export default paymentMethodService;







