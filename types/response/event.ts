import { EAuthorType, EEventVerb, ESubjectType } from "../enums/enum";

export interface Event {
    author_name?: string;
    author_type?: EAuthorType;
    created_at?: string;
    description?: string;
    id?: number;
    message?: string;
    path?: string;
    subject_id?: number;
    subject_type?: ESubjectType;
    user_id?: number;
    verb?: EEventVerb;
}

export interface GetListEventsResponse {
    events: Event[];
    count: number;
}