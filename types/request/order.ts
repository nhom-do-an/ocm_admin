import { EDeliveryMethod, EFreightPayerType, EFulfillmentShipmentStatus, EShippingRequirement, ETransactionStatus, ShippingLineType } from "../enums/enum";
import { AddressDetail } from "../response/customer";
import { Location } from "../response/locations";


export interface GetListOrdersRequest {
    store_id?: number;
    key?: string;
    statuses?: string[];
    financial_statuses?: string[];
    return_statuses?: string[];
    fulfillment_statuses?: string[];
    delivery_statuses?: string[];
    channel_ids?: number[];
    source_ids?: number[];
    location_ids?: number[];
    assignee_ids?: number[];
    customer_ids?: number[];
    created_user_ids?: number[];
    variant_ids?: number[];
    payment_method_ids?: number[];
    print_status?: boolean;
    min_created_at?: number;
    max_created_at?: number;
    min_confirmed_at?: number;
    max_confirmed_at?: number;
    min_expected_delivery_date?: number;
    max_expected_delivery_date?: number;
    sort_field?: 'created_at' | 'order_name';
    sort_type?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface CreateLineItemRequest {
    variant_id: number;
    quantity: number;
    note?: string;
    alias?: string;
    grams?: number;
    image_url?: string;
    original_price?: number;
    price?: number;
    product_exist?: boolean;
    product_name?: string;
    requires_shipping?: boolean;
}

export interface CreateTransactionRequest {
    amount: number;
    status: ETransactionStatus;
    payment_method_id: number;
}

export interface CreateShippingInfoRequest {
    cod_amount: number; // số tiền COD
    freight_payer: EFreightPayerType; // người trả phí
    height: number; // Cao
    length: number; // Dài
    requirement: EShippingRequirement; // yêu cầu giao hàng
    service_fee: number; // phí vận chuyển
    weight: number; // Khối lượng
    weight_type: string; // Kiểu khối lượng (mặc định là product)
    width: number; // Rộng
}


export interface CreateTrackingInfoRequest {
    delivery_provider_id: number; // id của đối tác vận chuyển
    tracking_number: string; // mã vận chuyển
}

export interface DeliveryProvider {
    address: string;
    code: string;
    created_at: string;
    email: string;
    id: number;
    name: string;
    note: string;
    phone: string;
    status: string;
    store_id: number;
    type: string;
}


export interface ShippingLine {
    name: string;
    price: number;
    shipping_rate_id: number;
    type: ShippingLineType;
}

export interface IShippingRate {
    created_at: string;
    id: number;
    name: string;
    price: number;
    shipping_area_id: number;
    store_id: number;
    updated_at: string;
}

export interface CreateOrderRequest {
    assignee_id: number;
    customer_id: number;
    fulfillment?: CreateFulfillmentRequest;
    line_items: CreateLineItemRequest[];
    location_id: number;
    note: string;
    shipping_address: AddressDetail;
    shipping_lines: ShippingLine[];
    source_id: number;
    transactions: CreateTransactionRequest[];
}

export interface CreateFulfillmentRequest {
    delivery_method: EDeliveryMethod;
    delivery_status: EFulfillmentShipmentStatus;
    order_id?: number;
    send_notification?: boolean;
    shipping_info?: CreateShippingInfoRequest;
    tracking_info?: CreateTrackingInfoRequest;
    pickup_address?: Location;
    note: string;
}

export interface UpdateOrderRequest {
    assignee_id?: number;
    email?: string;
    expected_delivery_date?: number;
    line_items?: UpdateLineItemRequest[];
    location_id?: number;
    name?: string;
    note?: string;
    phone?: string;
    shipping_address?: AddressDetail;
    shipping_lines?: ShippingLine[];
}

export interface UpdateLineItemRequest {
    id?: number;
    note?: string;
    quantity?: number;
    variant_id?: number;
}

export interface UpdateShippingLineRequest {
    id?: number;
    price?: number;
    title?: string;
    type?: ShippingLineType;
}


export interface UpdateLineItemAndShippingLineRequest {
    line_items?: UpdateLineItemRequest[];
    send_email?: boolean;
    shipping_lines?: UpdateShippingLineRequest[];
}

export interface CreateOrderPaymentRequest {
    transactions?: CreateTransactionRequest[];
}
