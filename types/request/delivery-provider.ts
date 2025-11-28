import { DeliveryProviderStatus, DeliveryProviderType } from "../enums/enum";

export interface GetListDeliveryProvidersRequest {
    type: DeliveryProviderType;
    status?: DeliveryProviderStatus;
    key?: string;
    page?: number;
    size?: number;
}

export interface CreateDeliveryProviderRequest {
    address: string;
    email: string;
    name: string;
    note: string;
    phone: string;
    status: DeliveryProviderStatus;
    type: DeliveryProviderType;
}

export interface UpdateDeliveryProviderRequest {
    address?: string;
    email?: string;
    name?: string;
    note?: string;
    phone?: string;
    status?: DeliveryProviderStatus;
    type?: DeliveryProviderType;
}