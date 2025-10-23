export interface GetListProductsRequest {
    store_id?: number;
    key?: string;
    tags?: string[];
    product_types?: string[];
    vendors?: string[];
    statuses?: string[];
    min_price?: number;
    max_price?: number;
    min_created_at?: number;
    max_created_at?: number;
    types?: string[];
    collection_ids?: number[];
    sort_field?: string;
    sort_type?: string;
    page?: number;
    limit?: number;
}

export interface CreateInventoryQuantity {
    location_id: number;
    available: number;
    on_hand: number;
}