import { TApiResponse } from "@/types/response/response";
import Axios from "./axios";
import { API } from "@/constants/api";
import { GetListDeliveryProvidersResponse } from "@/types/response/delivery-serrvice";
import { CreateDeliveryProviderRequest, GetListDeliveryProvidersRequest, UpdateDeliveryProviderRequest } from "@/types/request/delivery-provider";
import { DeliveryProvider } from "@/types/request/order";

const deliveryProviderService = {
    getListDeliveryProviders: async (params: GetListDeliveryProvidersRequest): Promise<GetListDeliveryProvidersResponse> => {
        const res = await Axios.get<TApiResponse<GetListDeliveryProvidersResponse>>(API.DELIVERY_PROVIDER.GET_LIST, { params });
        return res.data.data as GetListDeliveryProvidersResponse;
    },
    createDeliveryProvider: async (data: CreateDeliveryProviderRequest): Promise<DeliveryProvider> => {
        const res = await Axios.post<TApiResponse<DeliveryProvider>>(API.DELIVERY_PROVIDER.CREATE, data);
        return res.data.data as DeliveryProvider;
    },
    updateDeliveryProvider: async (id: number, data: UpdateDeliveryProviderRequest): Promise<DeliveryProvider> => {
        const res = await Axios.put<TApiResponse<DeliveryProvider>>(API.DELIVERY_PROVIDER.UPDATE(id), data);
        return res.data.data as DeliveryProvider;
    },
};
export default deliveryProviderService;