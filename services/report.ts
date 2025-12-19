
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';
import { GetRevenueRequest, GetTopSellingProductsRequest } from '@/types/request/report';
import { GetRevenueResponse, GetTopSellingProductsResponse } from '@/types/response/report';

const reportService = {
    // Thống kê doanh thu theo thời gian
    async statsRevenueByDate(params: GetRevenueRequest): Promise<GetRevenueResponse[]> {
        const res = await Axios.get<TApiResponse<GetRevenueResponse[]>>(API.REPORT.GET_REVENUE_BY_DATE, { params });
        return res.data.data as GetRevenueResponse[];
    },

    // Thống kê doanh thu theo chi nhánh
    async statsRevenueByLocation(params: GetRevenueRequest): Promise<GetRevenueResponse[]> {
        const res = await Axios.get<TApiResponse<GetRevenueResponse[]>>(API.REPORT.GET_REVENUE_BY_LOCATION, { params });
        return res.data.data as GetRevenueResponse[];
    },

    // Thống kê doanh thu theo nguồn đơn
    async statsRevenueBySource(params: GetRevenueRequest): Promise<GetRevenueResponse[]> {
        const res = await Axios.get<TApiResponse<GetRevenueResponse[]>>(API.REPORT.GET_REVENUE_BY_SOURCE, { params });
        return res.data.data as GetRevenueResponse[];
    },

    // Thống kê doanh thu theo khách hàng
    async statsRevenueByCustomer(params: GetRevenueRequest): Promise<GetRevenueResponse[]> {
        const res = await Axios.get<TApiResponse<GetRevenueResponse[]>>(API.REPORT.GET_REVENUE_BY_CUSTOMER, { params });
        return res.data.data as GetRevenueResponse[];
    },

    // Thống kê top sản phẩm bán chạy
    async statsTopSellingProducts(params: GetTopSellingProductsRequest): Promise<GetTopSellingProductsResponse[]> {
        const res = await Axios.get<TApiResponse<GetTopSellingProductsResponse[]>>(API.REPORT.GET_TOP_SELLING_PRODUCTS, { params });
        return res.data.data as GetTopSellingProductsResponse[];
    },
};

export default reportService;