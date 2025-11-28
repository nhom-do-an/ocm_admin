import Axios from "./axios";
import { TApiResponse } from "@/types/response/response";
import { API } from "@/constants/api";
import { CreateBeneficiaryAccountRequest, UpdateBeneficiaryAccountRequest } from "@/types/request/payment-method";
import { BeneficiaryAccount, BeneficiaryAccountDetail, Bank } from "@/types/response/payment-method";

const beneficiaryAccountService = {
    async getListBeneficiaryAccounts(): Promise<BeneficiaryAccount[]> {
        const res = await Axios.get<TApiResponse<BeneficiaryAccount[]>>(API.BENEFICIARY_ACCOUNT.GET_LIST);
        return res.data.data as BeneficiaryAccount[];
    },

    async getBeneficiaryAccountDetail(id: number): Promise<BeneficiaryAccountDetail> {
        const res = await Axios.get<TApiResponse<BeneficiaryAccountDetail>>(API.BENEFICIARY_ACCOUNT.GET_DETAIL(id));
        return res.data.data as BeneficiaryAccountDetail;
    },

    async createBeneficiaryAccount(data: CreateBeneficiaryAccountRequest): Promise<BeneficiaryAccount> {
        const res = await Axios.post<TApiResponse<BeneficiaryAccount>>(API.BENEFICIARY_ACCOUNT.CREATE, data);
        return res.data.data as BeneficiaryAccount;
    },

    async updateBeneficiaryAccount(data: UpdateBeneficiaryAccountRequest): Promise<BeneficiaryAccount> {
        const res = await Axios.put<TApiResponse<BeneficiaryAccount>>(API.BENEFICIARY_ACCOUNT.UPDATE, data);
        return res.data.data as BeneficiaryAccount;
    },

    async getListBanks(): Promise<Bank[]> {
        const res = await Axios.get<TApiResponse<Bank[]>>(API.BENEFICIARY_ACCOUNT.GET_BANKS);
        return res.data.data as Bank[];
    },
}

export default beneficiaryAccountService;

