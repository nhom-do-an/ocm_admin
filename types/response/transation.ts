import { EReferenceType, ETransactionCauseType, ETransactionKind, ETransactionStatus } from "../enums/enum"


export interface Transaction {
    id?: number;
    amount?: number;
    cause_type?: ETransactionCauseType;
    description?: string;
    kind?: ETransactionKind;
    paid_on?: string;
    payment_method_id?: number;
    payment_method_name?: string;
    reference_type?: EReferenceType;
    refernce_id?: number;
    status?: ETransactionStatus;
    created_at?: string;
    updated_at?: string;
}