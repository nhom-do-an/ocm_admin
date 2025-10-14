export type TApiResponse<T> = {
    success: boolean;
    message: string;
    code: number;
    data: T | null;
};