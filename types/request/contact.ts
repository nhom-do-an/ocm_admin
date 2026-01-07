import { ContactType } from '../response/contact'

export interface CreateContactRequest {
    type: ContactType
    value: string
    link?: string
    is_active?: boolean
}

export interface UpdateContactRequest {
    id: number
    type?: ContactType
    value?: string
    link?: string
    is_active?: boolean
}

export interface GetListContactsRequest {
    type?: ContactType
    is_active?: boolean
}
