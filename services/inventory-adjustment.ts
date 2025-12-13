import Axios from './axios'
import { TApiResponse } from '@/types/response/response'
import { API } from '@/constants/api'
import { GetInventoryAdjustmentsRequest } from '@/types/request/inventory-adjustment'
import { GetInventoryAdjustmentsResponse } from '@/types/response/inventory-adjustment'

const inventoryAdjustmentService = {
    async getInventoryAdjustments(
        params: GetInventoryAdjustmentsRequest,
    ): Promise<GetInventoryAdjustmentsResponse> {
        const res = await Axios.get<TApiResponse<GetInventoryAdjustmentsResponse>>(
            API.INVENTORY_ADJUSTMENT.GET_LIST,
            { params },
        )
        return res.data.data as GetInventoryAdjustmentsResponse
    },
}

export default inventoryAdjustmentService




