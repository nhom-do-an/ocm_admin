import { ECollectionType } from "../enums/enum";

export interface Collection {
    id?: number;
    store_id?: number;
    name: string;
    alias?: string;
    description: string;
    type: ECollectionType;
    disjunctive?: boolean;
    rules: CollectionRule[];
    meta_title: string;
    meta_description: string;
    image?: Attachment;
    created_at?: string;
    updated_at?: string;
}


export interface CollectionRule {
    id: number;
    collection_id: number;
    column: string;
    condition: string;
    relation: 'equal' | 'not_equal' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | string;
}

export interface Attachment {
    id: number;
    category: string;
    created_at: string;
    updated_at: string;
    file_path: string;
    file_size: number;
    filename: string;
    mime_type: string;
    status: number;
    url: string;
}

export interface GetListCollectionResponse {
    collections: Collection[];
    count: number;
}