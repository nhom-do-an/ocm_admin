export interface GetRevenueRequest {
    min_date: number
    max_date: number
    compare_with_previous: boolean
}

export interface GetTopSellingProductsRequest {
    min_date: number
    max_date: number
    limit?: number
}

