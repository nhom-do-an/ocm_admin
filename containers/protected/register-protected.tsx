'use client';

import { SCREEN } from '@/constants/constant';
import { useGlobalContext } from '@/hooks/useGlobalContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Spin } from 'antd';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRegisterRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading, existingStore } = useGlobalContext();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace(SCREEN.HOME.PATH);
                return;
            }

            if (!user && existingStore) {
                router.replace(SCREEN.LOGIN.PATH);
                return;
            }
        }
    }, [loading, user, existingStore, router]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                <Spin size="large" />
            </div>
        );
    }

    if (user || (!user && existingStore)) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRegisterRoute;
