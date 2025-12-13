export interface TrendingItem {
    item_id: number;
    variant_id: number;
    predicted_sales: number;
    trend_score: number;
    growth_rate: number;
    rank: number;
    product_name?: string;
    price?: number;
    image_url?: string;
}

export interface TrendingResponse {
    store_id: number;
    trending: TrendingItem[];
    products: any[];
    count: number;
    strategy: 'ai_model' | 'cold_start';
}

export interface TrendingPrediction {
    item_id: number;
    variant_id: number;
    predicted_sales: number;
    predicted_revenue: number;
    prediction_date: string;
    product_name: string;
    variant_title: string;
    price: number;
    actual_sales?: number;
}

export interface TrendingPredictionsResponse {
    predictions: TrendingPrediction[];
    total_predicted_sales: number;
    total_predicted_revenue: number;
}

