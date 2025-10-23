import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { GetListProductsRequest } from "@/types/request/product";
import { GetListProductsResponse, Product } from "@/types/response/product";

const productService = {
    async getListProducts(
        params: GetListProductsRequest
    ): Promise<GetListProductsResponse> {
        const res = await Axios.get<TApiResponse<GetListProductsResponse>>(API.PRODUCT.GET_PRODUCTS, {
            params,
        });
        return res.data.data as GetListProductsResponse;
    },
    async getProductTypeList(): Promise<string[]> {
        const res = await Axios.get<TApiResponse<string[]>>(API.PRODUCT.GET_PRODUCT_TYPE_LIST);
        return res.data.data as string[];
    },
    async getVendorList(): Promise<string[]> {
        const res = await Axios.get<TApiResponse<string[]>>(API.PRODUCT.GET_VENDOR_LIST);
        return res.data.data as string[];
    },
    async getTagsList(): Promise<string[]> {
        const res = await Axios.get<TApiResponse<string[]>>(API.PRODUCT.GET_TAGS_LIST);
        return res.data.data as string[];
    },
    async getDetailProductByID(id: number): Promise<Product> {
        const res = await Axios.get<TApiResponse<Product>>(API.PRODUCT.GET_PRODUCT_DETAIL(id));
        return res.data.data as Product;
    },
    async createProduct(data: Product): Promise<Product> {
        const res = await Axios.post<TApiResponse<Product>>(API.PRODUCT.CREATE_PRODUCT, data);
        return res.data.data as Product;
    },
    async updateProduct(data: Product): Promise<Product> {
        const res = await Axios.put<TApiResponse<Product>>(API.PRODUCT.UPDATE_PRODUCT(data.id || 0), data);
        return res.data.data as Product;
    },
}
export default productService;
