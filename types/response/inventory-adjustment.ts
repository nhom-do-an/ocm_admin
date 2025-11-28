export type ChangeInventoryType = 'available' | 'on_hand' | 'incoming' | 'committed'
export type ChangeInventoryReason = 'create_product' | 'fact_inventory' | 'create_order'

export interface InventoryAdjustmentChange {
    delta_value?: number
    value_after_change?: number
    change_type?: ChangeInventoryType
    reason?: ChangeInventoryReason
}

export interface InventoryAdjustment {
    id: number
    store_id: number
    location_id: number
    inventory_item_id: number
    changes: string
    actor_id: number
    actor_name?: string
    reference_document_type?: string
    reference_document_name?: string
    reference_document_id?: number
    created_at: string
    updated_at?: string
}

export interface GetInventoryAdjustmentsResponse {
    inventory_adjustments: InventoryAdjustment[]
    count: number
}



