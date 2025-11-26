import Axios from './axios'
import { API } from '@/constants/api'
import { TApiResponse } from '@/types/response/response'
import { GetEventsRequest } from '@/types/request/event'
import { GetListEventsResponse } from '@/types/response/event'

const eventService = {
    async getEvents(params: GetEventsRequest): Promise<GetListEventsResponse> {
        const res = await Axios.get<TApiResponse<GetListEventsResponse>>(API.EVENT.GET_EVENTS, {
            params,
        })

        return (
            res.data.data || {
                events: [],
                count: 0,
            }
        )
    },
}

export default eventService


