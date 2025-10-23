
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';
import { Collection, GetListCollectionResponse } from '@/types/response/collection';

const collectionService = {
    async getCollections(): Promise<GetListCollectionResponse> {
        const res = await Axios.get<TApiResponse<GetListCollectionResponse>>(API.COLLECTION.GET_COLLECTIONS);
        return res.data.data as GetListCollectionResponse;
    },
    async getDetailCollection(id: number): Promise<Collection> {
        const res = await Axios.get<TApiResponse<Collection>>(`${API.COLLECTION.GET_COLLECTION_DETAIL(id)}`);
        return res.data.data as Collection;
    },
    async createCollection(data: Collection): Promise<Collection> {
        const res = await Axios.post<TApiResponse<Collection>>(API.COLLECTION.GET_COLLECTIONS, data);
        return res.data.data as Collection;
    }
};

export default collectionService;