import Axios from './axios'
import { TApiResponse } from '@/types/response/response'
import { API } from '@/constants/api'
import { NotificationTemplate } from '@/types/response/notification'

const notificationService = {
    async getTemplates(): Promise<NotificationTemplate[]> {
        const res = await Axios.get<TApiResponse<NotificationTemplate[]>>(API.NOTIFICATION.GET_TEMPLATES)
        return res.data.data as NotificationTemplate[]
    },

    async getTemplateById(id: number): Promise<NotificationTemplate> {
        const res = await Axios.get<TApiResponse<NotificationTemplate>>(API.NOTIFICATION.GET_TEMPLATE_BY_ID(id))
        return res.data.data as NotificationTemplate
    },

    async updateTemplate(template: Partial<NotificationTemplate>): Promise<void> {
        await Axios.put<TApiResponse<void>>(API.NOTIFICATION.UPDATE_TEMPLATE, template)
    },
}

export default notificationService

