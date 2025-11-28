export interface PaymentProvider {
    id: number;
    name?: string;
    description?: string;
}

export interface Bank {
    id: number;
    name?: string;
    short_name?: string;
    logo?: string;
    bin?: string;
}

export interface BeneficiaryAccount {
    id: number;
    bank_id?: number;
    account_name?: string;
    account_number?: string;
    note?: string;
    bank_name?: string;
    bank_short_name?: string;
    bank_logo?: string;
    bank_bin?: string;
    created_at?: string;
    updated_at?: string;
}

export interface BeneficiaryAccountDetail {
    id: number;
    bank_name?: string;
    bank_short_name?: string;
    bank_logo?: string;
    bank_bin?: string;
    account_name?: string;
    account_number?: string;
    note?: string;
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

export interface PaymentMethodDetail extends PaymentMethod {
    provider?: PaymentProvider;
    beneficiary_account?: BeneficiaryAccountDetail;
}

export type GetListPaymentMethodsResponse = PaymentMethod[]

