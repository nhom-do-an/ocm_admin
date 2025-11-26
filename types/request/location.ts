import { ELocationStatus } from '../enums/enum'

export interface CreateLocationRequest {
    code?: string
    name: string
    email?: string
    phone?: string
    address?: string
    zip?: string
    status: ELocationStatus
    inventory_management: boolean
    fulfill_order: boolean
    default_location: boolean
    province_code: string
    district_code?: string
    ward_code: string
}

export interface UpdateLocationRequest {
    id: number
    code?: string
    name: string
    email?: string
    phone?: string
    address?: string
    zip?: string
    status: ELocationStatus
    inventory_management: boolean
    fulfill_order: boolean
    default_location: boolean
    province_code: string
    district_code?: string
    ward_code: string
}

export interface GetListLocationsRequest {
    page?: number
    size?: number
    key?: string
    inventory_management?: boolean;
    status?: ELocationStatus;
}

