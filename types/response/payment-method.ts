export interface PaymentProvider {
    id: number;
    name?: string;
    code?: string;
    type?: string;
}

export interface BeneficiaryAccountDetail {
    id: number;
    bank_name?: string;
    bank_short_name?: string;
    bank_logo?: string;
    bank_bin?: string;
}

export interface PaymentMethod {
    id: number;
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
    auto_posting_receipt?: boolean;
    provider_id?: number;
    beneficiary_account_id?: number;
    store_id?: number;
    provider?: PaymentProvider;
    beneficiary_account?: BeneficiaryAccountDetail;
    created_at?: string;
    updated_at?: string;
}

export type GetListPaymentMethodsResponse = PaymentMethod[]

