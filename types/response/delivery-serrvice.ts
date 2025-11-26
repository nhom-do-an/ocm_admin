import { DeliveryProvider } from "../request/order";

export interface GetListDeliveryProvidersResponse {
    count: number;
    delivery_providers: DeliveryProvider[];
}