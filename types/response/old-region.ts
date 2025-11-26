export interface OldRegion {
    id: number;
    name: string;
    code: string;
    type: number; // 2 = province, 3 = district, 4 = ward
    parent_code: string;
    priority: number;
}

