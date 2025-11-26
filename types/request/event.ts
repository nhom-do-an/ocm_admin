import { ESubjectType } from "../enums/enum";

export interface GetEventsRequest {
    store_id?: number;
    user_id?: number;
    subject_type?: ESubjectType;
    subject_id?: number;
    min_date?: number;
    max_date?: number;
    page?: number;
    size?: number;
}