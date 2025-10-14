'use client';

import { notification } from 'antd';
import { createContext, useContext, useMemo } from 'react';

type NotificationContextType = ReturnType<typeof notification.useNotification>;

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const api = notification.useNotification();
    const value = useMemo(() => api, [api]);
    const [apiInstance, contextHolder] = value;

    return (
        <NotificationContext.Provider value={value}>
            {contextHolder}
            {children}
        </NotificationContext.Provider>
    );
};

export const useGlobalNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useGlobalNotification must be used inside NotificationProvider');
    }
    return ctx[0];
};
