export interface GetListOldRegionRequest {
    type: number; // 2 = province, 3 = district, 4 = ward
    parent_code?: string;
}

