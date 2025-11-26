'use client';

import { SCREEN } from '@/constants/constant';
import { useGlobalContext } from '@/hooks/useGlobalContext';
import { useGlobalNotification } from '@/hooks/useNotification';
import authService from '@/services/auth';
import regionService from '@/services/region';
import storage from '@/storages/storage';
import { STORAGE_KEYS } from '@/storages/storage-key';
import { ERegionType } from '@/types/request/region';
import { TRegionResponse } from '@/types/response/region';

import { Form } from 'antd';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as Yup from 'yup';

const useRegister = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [form] = Form.useForm();
    const { setUser } = useGlobalContext();
    const [provinces, setProvinces] = useState<TRegionResponse[]>([]);
    const t = useTranslations('auth');
    const notification = useGlobalNotification();

    const registerSchema = Yup.object({
        phone: Yup.string()
            .matches(/^0\d{9}$/, t('phone_validate'))
            .required(t('phone_required')),
        password: Yup.string().matches(/^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,20}$/, t('password_validate'))
            .required(t('password_required')),
        confirm_password: Yup.string()
            .oneOf([Yup.ref('password')], t('confirm_password_validate'))
            .required(t('confirm_password_required')),
        name: Yup.string().required(t('name_required')),
        store_name: Yup.string().required(t('store_name_required')),
        province_code: Yup.string().required(t('province_code_required')),
    });

    const formik = useFormik({
        initialValues: {
            phone: '',
            password: '',
            name: '',
            store_name: '',
            province_code: '',
            confirm_password: '',
        },

        validationSchema: registerSchema,
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: async () => {
            const { phone, password, name, store_name, province_code } = formik.values;
            setLoading(true);
            try {
                const response = await authService.register({ phone, password, name, store_name, province_code });
                storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
                storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
                setUser(response);
                router.push(SCREEN.LOGIN.PATH);
                notification.success({ message: t('register_success') });

                const organization = response.domain_store;
                const domain = process.env.NEXT_PUBLIC_DOMAIN;

                if (domain) {
                    window.location.href = `https://${organization}.${domain}${SCREEN.LOGIN.PATH}`;
                } else {
                    const currentHost = window.location.host; // ví dụ: localhost:5173
                    const parts = currentHost.split(".");
                    if (parts.length === 1) {
                        window.location.href = `http://${organization}.${currentHost}${SCREEN.LOGIN.PATH}`;
                    } else {
                        parts[0] = organization;
                        window.location.href = `http://${parts.join(".")}${SCREEN.LOGIN.PATH}`;
                    }
                }
            } catch (error: unknown) {
                const axiosError = error as AxiosError<{ message?: string }>;
                const message = axiosError.response?.data?.message || axiosError.message || t('error');
                notification.error({ message });
            } finally {
                setLoading(false);
            }


        },
    });

    const getProvinces = async () => {
        setFetchLoading(true);
        try {
            const response = await regionService.getListRegions({ type: ERegionType.PROVINCE, parent_code: "VN" });
            setProvinces(response);
        } catch (error) {
            setProvinces([]);
            console.log("Error fetching provinces:", error);
        } finally {
            setFetchLoading(false);
        }
    }

    useState(() => {
        getProvinces();
    }, []);

    return {
        form,
        formik,
        loading,
        provinces,
        fetchLoading,
    };
};

export default useRegister;