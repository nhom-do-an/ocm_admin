'use client';

import { Button, Form, Input } from 'antd';
import useLogin from './hooks/use-login';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LockKeyhole, User } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import ProtectedLoginRoute from '../protected/login-protected';

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'auth' });

    return {
        title: t('login_title'),
    };
}

const LoginView = () => {
    const { loading, form, formik } = useLogin();
    const t = useTranslations('auth');

    return <ProtectedLoginRoute>
        <div className="w-screen h-screen center">
            <div className="w-full max-sm:w-[500px]  rounded-lg px-8 py-3 max-w-[600px] bg-white shadow-lg">
                <Image src="/admin/icon/full_logo.png" alt="Logo" width={200} height={80} className=" mx-auto" />
                <h1 className="text-center text-[26px] font-semibold! mb-[30px]! max-sm:text[18px]! max-sm:text-start max-sm:mb-[20px]">{t('login')}</h1>
                <Form form={form} layout="vertical" onFinish={formik.handleSubmit} className='max-w-[500px] mx-auto!'>

                    <Form.Item
                        label={<label htmlFor="phone" className=''>{t('phone_label')}<span className='text-red-500'>*</span></label>}
                        name="phone"
                        validateStatus={formik.errors.phone ? 'error' : ''}
                        help={formik.errors.phone}
                        className='mb-5!'
                    >
                        <Input
                            id="phone"
                            placeholder={t('phone_placeholder')}
                            prefix={<User size={18} />}
                            className='pl-1 h-10 text-[16px]! rounded-[8px]!'
                            {...formik.getFieldProps('phone')}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<label htmlFor="password" className=''>{t('password_label')}<span className='text-red-500'>*</span></label>}
                        name="password"
                        validateStatus={formik.touched.password && formik.errors.password ? 'error' : ''}
                        help={formik.touched.password && formik.errors.password ? formik.errors.password : ''}
                        className='mb-3!'
                    >
                        <Input.Password
                            id="password"
                            placeholder={t('password_placeholder')}
                            prefix={<LockKeyhole size={18} />}
                            className='pl-1 h-10 text-[16px]! rounded-[8px]!'
                            {...formik.getFieldProps('password')}
                        />
                    </Form.Item>

                    <div className="flex justify-end text-right">
                        <span className="mb-4 cursor-pointer text-blue-500">{t('forgot_password')}</span>
                    </div>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="  bg-[#006663] text-white w-[220px] h-[50px]! rounded-full! max-w-[300px]! block! mx-auto! text-[20px]!"
                        >
                            {t('login_button')}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    </ProtectedLoginRoute>

};

export default LoginView;