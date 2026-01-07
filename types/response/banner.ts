export interface Banner {
    id: number
    store_id: number
    image_url: string
    redirect_url: string
    description: string
    position: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface GetListBannersResponse {
    banners: Banner[]
    count: number
}
