import { TApiResponse } from "@/types/response/response";
import Axios from "./axios";
import { API } from "@/constants/api";
import { GetListNotificationsResponse, CountUnreadNotificationsResponse } from "@/types/response/notification-user";
import { GetListNotificationsRequest } from "@/types/request/notification-user";

const notificationUserService = {
    getListNotifications: async (params?: GetListNotificationsRequest): Promise<GetListNotificationsResponse> => {
        const res = await Axios.get<TApiResponse<GetListNotificationsResponse>>(API.NOTIFICATION_USER.GET_LIST, { params });
        return res.data.data as GetListNotificationsResponse;
    },
    readNotification: async (id: number): Promise<void> => {
        await Axios.put<TApiResponse<void>>(API.NOTIFICATION_USER.READ(id));
    },
    getUnreadCount: async (): Promise<number> => {
        const res = await Axios.get<TApiResponse<number>>(API.NOTIFICATION_USER.GET_UNREAD_COUNT);
        // Backend returns count directly as number
        return typeof res.data.data === 'number' ? res.data.data : 0;
    },
    markAsReadAll: async (): Promise<void> => {
        await Axios.post<TApiResponse<void>>(API.NOTIFICATION_USER.MARK_AS_READ_ALL);
    },
};

export default notificationUserService;

