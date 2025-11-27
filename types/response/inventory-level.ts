export interface InventoryLevel {
    id: number;
    inventory_item_id: number;
    location_id: number;
    store_id: number;
    available: number; // Tồn kho
    on_hand: number;   // Có thể bán
    committed: number; // Đang về
    incoming: number;  // Đang giao dịch
    location_name: string;
    variant_title?: string;
    product_name?: string;
    product_id?: number;
    variant_id?: number;
    image_url?: string;
}

export interface GetListInventoryLevelsResponse {
    inventory_levels: InventoryLevel[];
    count: number;
}


