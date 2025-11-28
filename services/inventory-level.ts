import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { GetListInventoryLevelsResponse } from "@/types/response/inventory-level";

interface GetListInventoryLevelsRequest {
    variant_id?: number;
    location_ids?: number[];
    default_location?: boolean;
    page?: number;
    size?: number;
}

export type ChangeInventoryReason =
    | "create_product"
    | "fact_inventory"
    | "create_order";

export interface UpdateInventoryLevelRequest {
    location_id: number;
    variant_id: number;
    reason: ChangeInventoryReason;
    change_value: number;
    reference_document_id?: number;
}

const inventoryLevelService = {
    async getInventoryLevels(
        params: GetListInventoryLevelsRequest
    ): Promise<GetListInventoryLevelsResponse> {
        const res = await Axios.get<TApiResponse<GetListInventoryLevelsResponse>>(
            API.INVENTORY_LEVEL.GET_LIST,
            { params }
        );
        return res.data.data as GetListInventoryLevelsResponse;
    },
    async updateInventoryLevel(
        payload: UpdateInventoryLevelRequest
    ): Promise<void> {
        await Axios.put<TApiResponse<unknown>>(API.INVENTORY_LEVEL.UPDATE, payload);
    },
};

export default inventoryLevelService;


