import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { GetListPaymentMethodsRequest } from "@/types/request/payment-method";
import { GetListPaymentMethodsResponse } from "@/types/response/payment-method";

const paymentService = {
    async getListPaymentMethods (
        params: GetListPaymentMethodsRequest
    ): Promise<GetListPaymentMethodsResponse> {
        const res = await Axios.get<TApiResponse<GetListPaymentMethodsResponse>>(API.PAYMENT_METHOD.GET_PAYMENT_METHODS, {
            params,
        });
        return res.data.data as GetListPaymentMethodsResponse;
    },
}

export default paymentService;







