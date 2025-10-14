
export interface TPublicationResponse {
    id: number
    channel_id: number
    store_id: number
    created_at: string
    updated_at: string
    deleted_at: string | null
    channel_name: string
    channel_alias: string
    channel_image_url: string
}

export interface TChannelResponse {
    id: number
    name: string
    description: string
    short_name: string
    type: 'website' | 'pos' | 'tiktokshop'
    image_url: string
    installed: boolean
}