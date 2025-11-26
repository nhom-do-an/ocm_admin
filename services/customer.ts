import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { GetListCustomersRequest, CreateCustomerRequest } from "@/types/request/customer";
import { GetListCustomersResponse, Customer, CustomerDetail, AddressDetail } from "@/types/response/customer";

const customerService = {
    async getListCustomers(
        params: GetListCustomersRequest
    ): Promise<GetListCustomersResponse> {
        const res = await Axios.get<TApiResponse<GetListCustomersResponse>>(API.CUSTOMER.GET_CUSTOMERS, {
            params,
        });
        return res.data.data as GetListCustomersResponse;
    },
    async createCustomer(
        data: CreateCustomerRequest
    ): Promise<Customer> {
        const res = await Axios.post<TApiResponse<Customer>>(API.CUSTOMER.CREATE_CUSTOMER, data);
        return res.data.data as Customer;
    },
    async getCustomerDetail(id: number): Promise<CustomerDetail> {
        const res = await Axios.get<TApiResponse<CustomerDetail>>(API.CUSTOMER.GET_CUSTOMER_DETAIL(id));
        return res.data.data as CustomerDetail;
    },
    async getCustomerAddressList(id: number): Promise<AddressDetail[]> {
        const res = await Axios.get<TApiResponse<AddressDetail[]>>(API.CUSTOMER.GET_CUSTOMER_ADDRESS_LIST(id));
        return res.data.data as AddressDetail[];
    },
}

export default customerService;

