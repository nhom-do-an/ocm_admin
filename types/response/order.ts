import { EDeliveryMethod, EFinancialStatus, EFulfillmentOrderStatus, EFulfillmentShipmentStatus, EFulfillmentStatus, EOrderReturnStatus, EOrderStatus } from '../enums/enum';
import { TUserResponse } from './auth';
import { TChannelResponse } from './channel';
import { CustomerDetail } from './customer';
import { AddressDetail } from './customer';
import { Location } from './locations';
import { Source } from './source';

export interface Fulfillment {
    id?: number;
    name?: string;
    store_id?: number;
    order_id?: number;
    location_id?: number;
    channel_id?: number;
    source_id?: number;
    delivery_method?: EDeliveryMethod;
    shipment_status?: EFulfillmentShipmentStatus;
    status?: EFulfillmentStatus;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface Order {
    id?: number;
    name?: string;
    order_number?: number;
    status?: EOrderStatus;
    fulfillment_status?: EFulfillmentOrderStatus;
    financial_status?: EFinancialStatus;
    return_status?: EOrderReturnStatus;
    customer_id?: number;
    assignee_id?: number;
    created_user_id?: number;
    location_id?: number;
    source_id?: number;
    channel_id?: number;
    note?: string;
    canceled_on?: string;
    confirmed_on?: string;
    closed_on?: string;
    processed_on?: string;
    completed_on?: string;
    expected_delivery_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface OrderDetail extends Order {
    line_items?: LineItemDetail[];
    shipping_address?: AddressDetail;
    billing_address?: AddressDetail;
    payment_method_lines?: PaymentMethodLine[];
    shipping_lines?: ShippingLine[];
    customer?: CustomerDetail;
    assignee?: TUserResponse;
    user?: TUserResponse;
    channel?: TChannelResponse;
    source?: Source;
    location?: Location;
    fulfillments?: Fulfillment[];
    total_line_item?: number;
    total_price?: number;
    requires_shipping?: boolean;
    total_weight?: number;
    item_count?: number;
}

export interface LineItemDetail {
    id?: number;
    image_url?: string;
    product_id?: number;
    variant_id?: number;
    quantity?: number;
    note?: string;
    price?: number;
    product_name?: string;
    variant_title?: string;
}

export interface PaymentMethodLine {
    id?: number;
    payment_method_id?: number;
    amount?: number;
    status?: string;
    payment_method_name?: string;
}

export interface ShippingLine {
    id?: number;
    shipping_rate_id?: number;
    price?: number;
    name?: string;
    type?: string;
}

export interface GetListOrdersResponse {
    orders: OrderDetail[];
    count: number;
}







