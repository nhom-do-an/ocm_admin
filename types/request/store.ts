export interface UpdateStoreRequest {
    name: string
    email: string
    phone: string
    address: string
    province_id?: number
    ward_id?: number
}

export interface UploadStoreLogoRequest {
    attachment_id: number
}

