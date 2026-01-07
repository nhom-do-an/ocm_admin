export type ContactType = 'phone' | 'zalo' | 'facebook'

export interface Contact {
    id: number
    store_id: number
    type: ContactType
    value: string
    link: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface GetListContactsResponse {
    contacts: Contact[]
    count: number
}
