import { ELocationStatus } from "../enums/enum"

export interface Location {
    address: string;
    code: string;
    created_at: string;
    default_location: boolean;
    email: string;
    fulfill_order: boolean;
    id: number;
    inventory_management: boolean;
    name: string;
    phone: string;
    status: ELocationStatus;
    store_id: number;
    updated_at: string;
    zip: string;
}
