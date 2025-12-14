import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { ShipmentDetail, GetListShipmentsRequest, GetListShipmentsResponse } from "@/types/response/shipment";

const shipmentService = {
    async getListShipments(
        params: GetListShipmentsRequest
    ): Promise<GetListShipmentsResponse> {
        const queryParams: any = {
            page: params.page || 1,
            size: params.size || 100,
        };
        if (params.order_id) {
            queryParams.order_id = params.order_id;
        }
        if (params.key) {
            queryParams.key = params.key;
        }
        if (params.location_ids && params.location_ids.length > 0) {
            queryParams.location_ids = params.location_ids.join(',');
        }
        if (params.statuses && params.statuses.length > 0) {
            queryParams.statuses = params.statuses.join(',');
        }
        const res = await Axios.get<TApiResponse<GetListShipmentsResponse>>(API.SHIPMENT.GET_LIST, {
            params: queryParams,
        });
        return res.data.data as GetListShipmentsResponse;
    },

    async printShipment(shipmentId: number): Promise<string> {
        const res = await Axios.get<TApiResponse<string>>(API.SHIPMENT.PRINT(shipmentId));
        return res.data.data as string;
    },

    async markAsDelivered(shipmentId: number): Promise<ShipmentDetail> {
        const res = await Axios.put<TApiResponse<ShipmentDetail>>(API.SHIPMENT.MARK_AS_DELIVERED(shipmentId));
        return res.data.data as ShipmentDetail;
    },

    async getDetailShipment(shipmentId: number): Promise<ShipmentDetail> {
        const res = await Axios.get<TApiResponse<ShipmentDetail>>(API.SHIPMENT.GET_DETAIL(shipmentId));
        return res.data.data as ShipmentDetail;
    },

    async updateShipmentStatus(shipmentId: number, deliveryStatus: string): Promise<ShipmentDetail> {
        const res = await Axios.put<TApiResponse<ShipmentDetail>>(API.SHIPMENT.UPDATE_STATUS(shipmentId), {
            delivery_status: deliveryStatus,
        });
        return res.data.data as ShipmentDetail;
    },
};

export default shipmentService;

