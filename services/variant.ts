import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { GetListVariantsRequest } from "@/types/request/variant";
import { Attachment } from "@/types/response/collection";

export interface Variant {
    id: number;
    sku?: string;
    product_id?: number;
    product_name?: string;
    title?: string;
    image?: Attachment;
    price?: number;
    compare_at_price?: number;
    weight?: number;
    unit?: string;
    weight_unit?: string;
    image_id?: number;
    position?: number;
    option1?: string;
    option2?: string;
    option3?: string;
    type?: string;
    sold?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    tracked?: boolean;
    requires_shipping?: boolean;
    cost_price?: number;
    lot_management?: boolean;
    inventory_quantity?: number;
}

export interface GetListVariantResponse {
    variants: Variant[];
    count: number;
}

const variantService = {
    async getListVariants(params?: GetListVariantsRequest): Promise<GetListVariantResponse> {
        const res = await Axios.get<TApiResponse<GetListVariantResponse>>(API.VARIANT.GET_VARIANTS, {
            params,
        });
        return res.data.data as GetListVariantResponse;
    },
}

export default variantService;





