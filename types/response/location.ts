import { ELocationStatus } from '../enums/enum'

export interface Location {
    id: number
    code: string
    name: string
    email: string
    phone: string
    address: string
    zip: string
    status: ELocationStatus
    inventory_management: boolean
    fulfill_order: boolean
    default_location: boolean
    store_id: number
    created_at: string
    updated_at: string
}

export interface LocationDetail extends Location {
    province_name?: string
    district_name?: string
    ward_name?: string
    province_code?: string
    district_code?: string
    ward_code?: string
}

export interface GetListLocationsResponse {
    locations: Location[]
    count: number
}


