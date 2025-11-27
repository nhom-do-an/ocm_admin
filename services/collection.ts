
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';
import { Collection, GetListCollectionResponse } from '@/types/response/collection';

interface GetListCollectionsParams {
    page?: number;
    size?: number;
    key?: string;
    type?: string;
}

const collectionService = {
    async getCollections(params?: GetListCollectionsParams): Promise<GetListCollectionResponse> {
        const res = await Axios.get<TApiResponse<GetListCollectionResponse>>(API.COLLECTION.GET_COLLECTIONS, {
            params,
        });
        return res.data.data as GetListCollectionResponse;
    },
    async getDetailCollection(id: number): Promise<Collection> {
        const res = await Axios.get<TApiResponse<Collection>>(API.COLLECTION.GET_COLLECTION_DETAIL(id));
        return res.data.data as Collection;
    },
    async createCollection(data: Collection): Promise<Collection> {
        const res = await Axios.post<TApiResponse<Collection>>(API.COLLECTION.GET_COLLECTIONS, data);
        return res.data.data as Collection;
    },
    async updateCollection(data: Collection): Promise<Collection> {
        const res = await Axios.put<TApiResponse<Collection>>(API.COLLECTION.UPDATE_COLLECTION, data);
        return res.data.data as Collection;
    },
    async deleteCollection(id: number): Promise<void> {
        await Axios.delete<TApiResponse<null>>(API.COLLECTION.DELETE_COLLECTION(id));
    },
};

export default collectionService;