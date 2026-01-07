import Axios from './axios'
import { TApiResponse } from '@/types/response/response'
import { API } from '@/constants/api'
import { Contact, GetListContactsResponse } from '@/types/response/contact'
import { CreateContactRequest, UpdateContactRequest, GetListContactsRequest } from '@/types/request/contact'

const contactService = {
    async getListContacts(params?: GetListContactsRequest): Promise<GetListContactsResponse> {
        const res = await Axios.get<TApiResponse<Contact[]>>(API.CONTACT.LIST, { params })
        const contacts = (res.data.data as Contact[]) || []
        return {
            contacts,
            count: contacts.length,
        }
    },

    async getContactDetail(id: number): Promise<Contact> {
        const res = await Axios.get<TApiResponse<Contact>>(API.CONTACT.GET_DETAIL(id))
        return res.data.data as Contact
    },

    async createContact(data: CreateContactRequest): Promise<Contact> {
        const res = await Axios.post<TApiResponse<Contact>>(API.CONTACT.CREATE, data)
        return res.data.data as Contact
    },

    async updateContact(id: number, data: UpdateContactRequest): Promise<Contact> {
        const res = await Axios.put<TApiResponse<Contact>>(API.CONTACT.UPDATE(id), data)
        return res.data.data as Contact
    },

    async deleteContact(id: number): Promise<void> {
        await Axios.delete(API.CONTACT.DELETE(id))
    },
}

export default contactService
