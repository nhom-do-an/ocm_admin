import { LineItemDetail } from './order';
import { LocationDetail } from './location';
import { AddressDetail } from './customer';
import { DeliveryProvider } from '../request/order';
import { EDeliveryMethod, EDeliveryStatus, EFinancialStatus } from '../enums/enum';

export interface TrackingInfo {
    id?: number;
    tracking_number?: string;
    delivery_provider_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface TrackingInfoDetail extends TrackingInfo {
    delivery_provider?: DeliveryProvider;
}

export interface ShippingInfo {
    id?: number;
    cod_amount?: number;
    service_fee?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    freight_payer?: string;
    requirement?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Shipment {
    id?: number;
    order_id?: number;
    name?: string;
    fulfillment_id?: number;
    tracking_info_id?: number;
    shipping_info_id?: number;
    note?: string;
    location_id?: number;
    channel_id?: number;
    source_id?: number;
    shipping_address_id?: number;
    printed?: boolean;
    cancelled_on?: string;
    delivered_on?: string;
    picked_up_on?: string;
    status?: string;
    delivery_status?: EDeliveryStatus;
    payment_status?: EFinancialStatus;
    delivery_method?: EDeliveryMethod;
    service_fee?: number;
    cod_amount?: number;
    store_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ShipmentDetail extends Shipment {
    line_items?: LineItemDetail[];
    location?: LocationDetail;
    shipping_address?: AddressDetail;
    tracking_info?: TrackingInfoDetail;
    shipping_info?: ShippingInfo;
}

export interface GetListShipmentsRequest {
    order_id?: number;
    key?: string;
    location_ids?: number[];
    statuses?: string[];
    page?: number;
    size?: number;
    min_created_at?: number;
    max_created_at?: number;
}

export interface GetListShipmentsResponse {
    shipments: ShipmentDetail[];
    count: number;
}

