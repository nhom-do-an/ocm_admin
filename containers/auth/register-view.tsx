'use client';

import { Button, Form, Input, Select, } from 'antd';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { LockKeyhole, User, Phone, Store } from 'lucide-react';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import useRegister from './hooks/use-register';
import ProtectedRegisterRoute from '../protected/register-protected';
import Loader from '@/components/Loader';

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

const RegisterView = () => {
    const { loading, form, formik, fetchLoading, provinces } = useRegister();
    const t = useTranslations('auth');
    return <ProtectedRegisterRoute>
        {fetchLoading ? <Loader /> : <div className="w-screen h-screen center overflow-y-scroll px-4">
            <div className="w-full max-sm:w-[500px] rounded-lg px-8 py-3 max-w-[600px] bg-white shadow-lg h-fit overflow-y-scroll">
                <Image src="/icon/full_logo.png" alt="Logo" width={200} height={80} className=" mx-auto" />
                <h1 className="text-start text-[26px] font-semibold text-gray-900">{t('register')}</h1>
                <p className="text-start text-[14px] text-gray-500 !mb-[28px]">{t('register_description')}</p>
                <Form form={form} layout="vertical" onFinish={formik.handleSubmit} className='max-w-[500px] !mx-auto'>
                    <div className="flex items-center justify-between gap-4 mb-3 max-sm:flex-col">
                        <Form.Item
                            label={<label htmlFor="name" className=''>{t('name_label')}<span className='text-red-500'>*</span></label>}
                            name="name"
                            validateStatus={formik.errors.name ? 'error' : ''}
                            help={formik.errors.name}
                            className='!mb-2 flex-1 max-sm:w-full'
                        >
                            <Input
                                id="name"
                                placeholder={t('name_placeholder')}
                                prefix={<User size={18} />}
                                className='pl-1 h-10 !text-[16px] !rounded[8px]'
                                {...formik.getFieldProps('name')}
                            />
                        </Form.Item>


                        <Form.Item
                            label={<label htmlFor="phone" className=''>{t('phone_label')}<span className='text-red-500'>*</span></label>}
                            name="phone"
                            validateStatus={formik.errors.phone ? 'error' : ''}
                            help={formik.errors.phone}
                            className='!mb-2 flex-1 max-sm:w-full'
                        >
                            <Input
                                id="phone"
                                placeholder={t('phone_placeholder')}
                                prefix={<Phone size={18} />}
                                className='pl-1 h-10 !text-[16px] !rounded-[8px]'
                                {...formik.getFieldProps('phone')}
                            />
                        </Form.Item>
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-3 max-sm:flex-col">
                        <Form.Item
                            label={<label htmlFor="store_name" className=''>{t('store_name_label')}<span className='text-red-500'>*</span></label>}
                            name="store_name"
                            validateStatus={formik.touched.store_name && formik.errors.store_name ? 'error' : ''}
                            help={formik.touched.store_name && formik.errors.store_name ? formik.errors.store_name : ''}
                            className='!mb-2 flex-1 max-sm:w-full'
                        >
                            <Input
                                id="store_name"
                                placeholder={t('store_name_placeholder')}
                                prefix={<Store size={18} />}
                                className='pl-1 h-10 !text-[16px] !rounded-[8px]'
                                {...formik.getFieldProps('store_name')}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<label htmlFor="province_code" className='mt-3 max-sm:mt-0'>
                                {t('province_code_label')}<span className='text-red-500'>*</span>
                            </label>}
                            name="province_code"
                            validateStatus={formik.touched.province_code && formik.errors.province_code ? 'error' : ''}
                            help={formik.touched.province_code && formik.errors.province_code ? formik.errors.province_code : ''}
                            className='flex-1 max-sm:w-full'
                        >
                            <Select
                                id="province_code"
                                className="!h-10 "
                                placeholder={t('province_code_placeholder')}

                                showSearch
                                optionFilterProp="children"
                                getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                {...formik.getFieldProps('province_code')}
                                onChange={(value) => formik.setFieldValue('province_code', value)}
                            >
                                {provinces.map((p) => (
                                    <Select.Option key={p.code} value={p.code}>
                                        {p.name}
                                    </Select.Option>
                                ))}
                            </Select>

                        </Form.Item>

                    </div>

                    <div className="flex justify-end text-right gap-4 mb-3 max-sm:flex-col ">
                        <Form.Item
                            label={<label htmlFor="password" className=''>{t('password_label')}<span className='text-red-500'>*</span></label>}
                            name="password"
                            validateStatus={formik.touched.password && formik.errors.password ? 'error' : ''}
                            help={formik.touched.password && formik.errors.password ? formik.errors.password : ''}
                            className='!mb-2 flex-1 max-sm:w-full'
                        >
                            <Input.Password
                                id="password"
                                placeholder={t('password_placeholder')}
                                prefix={<LockKeyhole size={18} />}
                                className='pl-1 h-10 !text-[16px] !rounded-[8px]'
                                {...formik.getFieldProps('password')}
                            />
                        </Form.Item>
                        <Form.Item
                            label={<label htmlFor="confirm_password" className=''>{t('confirm_password_label')}<span className='text-red-500'>*</span></label>}
                            name="confirm_password"
                            validateStatus={formik.touched.confirm_password && formik.errors.confirm_password ? 'error' : ''}
                            help={formik.touched.confirm_password && formik.errors.confirm_password ? formik.errors.confirm_password : ''}
                            className='!mb-2 flex-1 max-sm:w-full'
                        >
                            <Input.Password
                                id="confirm_password"
                                placeholder={t('confirm_password_placeholder')}
                                prefix={<LockKeyhole size={18} />}
                                className='pl-1 h-10 !text-[16px] !rounded-[8px]'
                                {...formik.getFieldProps('confirm_password')}
                            />
                        </Form.Item>
                    </div>

                    {/* <div className='mb-3'>
                        <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                            <span className='text-[14px] text-gray-700'>
                                {t('i_agree_prefix')}{' '}
                                <a href="#" className='text-blue-600 hover:underline'>{t('privacy_policy')}</a>{' '}
                                &{' '}
                                <a href="#" className='text-blue-600 hover:underline'>{t('terms_of_use')}</a>
                            </span>
                        </Checkbox>
                    </div> */}


                    <Form.Item>
                        {(() => {
                            const isDisabled = loading || !formik.isValid || !formik.dirty;
                            return (
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={isDisabled}
                            className={`${isDisabled ? 'bg-gray-300 text-white !border-gray-300' : 'bg-[#006663] text-white hover:opacity-90'} w-[220px] max-sm:w-full !h-[50px] !rounded-full !max-w-[300px] !block !mx-auto !text-[18px] !mt-4`}
                        >
                            {t('register_button')}
                        </Button>
                            );
                        })()}
                    </Form.Item>
                </Form>
            </div >
        </div >}

    </ProtectedRegisterRoute>
};
export default RegisterView;