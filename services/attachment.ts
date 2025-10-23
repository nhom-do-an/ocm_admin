
import Axios from './axios';

import { TApiResponse } from '@/types/response/response';
import { API } from '@/constants/api';
import { Attachment } from '@/types/response/collection';

const attachmentService = {
    async uploadAttachment(formData: FormData): Promise<Attachment[]> {
        const res = await Axios.post<TApiResponse<Attachment[]>>(API.ATTACHMENT.UPLOAD, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data.data as Attachment[];
    }
};

export default attachmentService;