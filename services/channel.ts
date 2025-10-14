
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';
import { TChannelResponse, TPublicationResponse } from '@/types/response/channel';

const channelService = {
    async getPublications(): Promise<TPublicationResponse[]> {
        const res = await Axios.get<TApiResponse<TPublicationResponse[]>>(API.CHANNEL.GET_PUBLICATIONS);
        return res.data.data as TPublicationResponse[];
    },
    async getListChannel(): Promise<TChannelResponse[]> {
        const res = await Axios.get<TApiResponse<TChannelResponse[]>>(API.CHANNEL.GET_LIST_CHANNEL);
        return res.data.data as TChannelResponse[];
    },
    async installChannel(channelId: number): Promise<void> {
        await Axios.post<TApiResponse<void>>(`${API.CHANNEL.INSTALL_CHANNEL}/${channelId}/connect`);
    },
    async removePublication(channelId: number): Promise<void> {
        await Axios.put<TApiResponse<void>>(API.CHANNEL.REMOVE_CHANNEL.replace('{channel_id}', channelId.toString()));
    }
};

export default channelService;
