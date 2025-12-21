export interface GetRevenueResponse {
    label: string
    current: number
    previous?: number
    total_revenue: number
    previous_revenue?: number
    total_shipping_fee: number
    previous_shipping_fee?: number
    total_line_item_fee: number
    previous_line_item_fee?: number
    total_orders: number
    previous_orders?: number
}

export interface GetTopSellingProductsResponse {
    variant_id: number
    title: string
    sku: string
    product_name: string
    total_sold: number
    total_revenue: number
    previous_sold?: number
    previous_revenue?: number
}