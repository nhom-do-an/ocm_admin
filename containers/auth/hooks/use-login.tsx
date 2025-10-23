'use client';

import { SCREEN } from '@/constants/constant';
import { useGlobalContext } from '@/hooks/useGlobalContext';
import { useGlobalNotification } from '@/hooks/useNotification';
import authService from '@/services/auth';
import channelService from '@/services/channel';
import storage from '@/storages/storage';
import { STORAGE_KEYS } from '@/storages/storage-key';

import { Form } from 'antd';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as Yup from 'yup';

const useLogin = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { setUser, setPublications } = useGlobalContext();
    const t = useTranslations('auth');
    const notification = useGlobalNotification();

    const loginSchema = Yup.object({
        phone: Yup.string()
            .matches(/^0\d{9}$/, t('phone_validate'))
            .required(t('phone_required')),
        password: Yup.string().matches(/^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,20}$/, t('password_validate'))
            .required(t('password_required')),
    });

    const formik = useFormik({
        initialValues: { phone: '', password: '' },
        validationSchema: loginSchema,
        onSubmit: async () => {
            const { phone, password } = formik.values;
            setLoading(true);
            try {
                const [response, publications] = await Promise.all([authService.login({ phone, password }), channelService.getPublications()]);

                storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
                storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
                setUser(response);
                setPublications(publications || []);
                router.push(SCREEN.HOME.PATH);
                notification.success({ message: t('login_success') });
            } catch (error) {
                const axiosError = error as AxiosError<{ message?: string }>;
                const message = axiosError.response?.data?.message || axiosError.message || t('error');
                notification.error({ message });
            } finally {
                setLoading(false);
            }
        },
    });

    return {
        form,
        formik,
        loading,
    };
};

export default useLogin;