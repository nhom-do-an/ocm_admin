export interface GetListPaymentMethodsRequest {
    store_id?: number;
    key?: string;
    page?: number;
    limit?: number;
}

export interface CreatePaymentMethodRequest {
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    auto_posting_receipt?: boolean;
    provider_id: number;
    beneficiary_account_id?: number;
}

export interface UpdatePaymentMethodRequest {
    id: number;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    auto_posting_receipt?: boolean;
    provider_id: number;
    beneficiary_account_id?: number;
}

export interface CreateBeneficiaryAccountRequest {
    bank_id: number;
    account_name: string;
    account_number: string;
    note?: string;
}

export interface UpdateBeneficiaryAccountRequest {
    id: number;
    bank_id: number;
    account_name: string;
    account_number: string;
    note?: string;
}




