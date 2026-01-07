import Axios from './axios'
import { TApiResponse } from '@/types/response/response'
import { API } from '@/constants/api'
import { Banner, GetListBannersResponse } from '@/types/response/banner'
import { CreateBannerRequest, UpdateBannerRequest, GetListBannersRequest } from '@/types/request/banner'

const bannerService = {
    async getListBanners(params?: GetListBannersRequest): Promise<GetListBannersResponse> {
        const res = await Axios.get<TApiResponse<Banner[]>>(API.BANNER.LIST, { params })
        const banners = (res.data.data as Banner[]) || []
        return {
            banners,
            count: banners.length,
        }
    },

    async getBannerDetail(id: number): Promise<Banner> {
        const res = await Axios.get<TApiResponse<Banner>>(API.BANNER.GET_DETAIL(id))
        return res.data.data as Banner
    },

    async createBanner(data: CreateBannerRequest): Promise<Banner> {
        const res = await Axios.post<TApiResponse<Banner>>(API.BANNER.CREATE, data)
        return res.data.data as Banner
    },

    async updateBanner(id: number, data: UpdateBannerRequest): Promise<Banner> {
        const res = await Axios.put<TApiResponse<Banner>>(API.BANNER.UPDATE(id), data)
        return res.data.data as Banner
    },

    async deleteBanner(id: number): Promise<void> {
        await Axios.delete(API.BANNER.DELETE(id))
    },
}

export default bannerService
