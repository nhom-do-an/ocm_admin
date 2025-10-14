'use client';

import { SCREEN } from '@/constants/constant';
import { useGlobalContext } from '@/hooks/useGlobalContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loader from '@/components/Loader';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedLoginRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading, existingStore } = useGlobalContext();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            if (existingStore) {
                return;
            }

            const domain = process.env.NEXT_PUBLIC_REGISTER_DOMAIN;
            const currentHost = window.location.host;
            const parts = currentHost.split('.');

            const registerUrl =
                domain
                    ? `https://${domain}${SCREEN.REGISTER.PATH}`
                    : parts.length === 1
                        ? `http://${currentHost}${SCREEN.REGISTER.PATH}`
                        : `http://${parts.join('.')}${SCREEN.REGISTER.PATH}`;

            window.location.href = registerUrl;
            return;
        }

        if (user) {
            if (existingStore) {
                router.replace(SCREEN.HOME.PATH);
                return;
            } else {
                const domain = process.env.NEXT_PUBLIC_DOMAIN;
                const domainStore = user.domain_store;
                const currentHost = window.location.host;
                const parts = currentHost.split('.');

                const targetUrl =
                    domain
                        ? `https://${domainStore}.${domain}${SCREEN.LOGIN.PATH}`
                        : parts.length === 1
                            ? `http://${domainStore}.${currentHost}${SCREEN.LOGIN.PATH}`
                            : `http://${domainStore}.${parts.join('.')}${SCREEN.LOGIN.PATH}`;

                window.location.href = targetUrl;
                return;
            }
        }
    }, [loading, user, existingStore, router]);


    if (loading) {
        return (
            <Loader />
        );
    }

    if (!user && existingStore) {
        return <>{children}</>;
    }
    return null;
};

export default ProtectedLoginRoute;
