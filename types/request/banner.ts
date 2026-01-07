export interface CreateBannerRequest {
    image_url: string
    redirect_url?: string
    description?: string
    position?: number
    is_active?: boolean
}

export interface UpdateBannerRequest {
    id: number
    image_url?: string
    redirect_url?: string
    description?: string
    position?: number
    is_active?: boolean
}

export interface GetListBannersRequest {
    is_active?: boolean
}
