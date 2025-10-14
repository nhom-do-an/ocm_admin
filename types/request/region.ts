export enum ERegionType {
    PROVINCE = 2,
    DISTRICT = 3,
    WARD = 4,
}
export interface TGetRegionsRequest {
    parent_code?: string;
    type: ERegionType;
}