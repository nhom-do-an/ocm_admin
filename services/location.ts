import Axios from './axios'
import { TApiResponse } from '@/types/response/response'
import { API } from '@/constants/api'
import { Location, LocationDetail, GetListLocationsResponse } from '@/types/response/location'
import { CreateLocationRequest, UpdateLocationRequest, GetListLocationsRequest } from '@/types/request/location'

const locationService = {
    async getListLocations(params?: GetListLocationsRequest): Promise<GetListLocationsResponse> {
        const res = await Axios.get<TApiResponse<Location[]>>(API.LOCATION.LIST, { params })
        const locations = (res.data.data as Location[]) || []
        return {
            locations,
            count: locations.length,
        }
    },

    async getLocationDetail(id: number): Promise<LocationDetail> {
        const res = await Axios.get<TApiResponse<LocationDetail>>(API.LOCATION.GET_DETAIL(id))
        return res.data.data as LocationDetail
    },

    async createLocation(data: CreateLocationRequest): Promise<Location> {
        const res = await Axios.post<TApiResponse<Location>>(API.LOCATION.CREATE, data)
        return res.data.data as Location
    },

    async updateLocation(id: number, data: UpdateLocationRequest): Promise<Location> {
        const res = await Axios.put<TApiResponse<Location>>(API.LOCATION.UPDATE(id), data)
        return res.data.data as Location
    },
}

export default locationService