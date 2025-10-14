"use client"
import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/store'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, } from 'antd'
import { GlobalProvider } from '@/hooks/useGlobalContext'
import { NotificationProvider } from '@/hooks/useNotification'

const store = makeStore()

export default function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const antdTheme = {
    token: {
      colorPrimary: theme === 'light' ? '#0070f3' : '#1e90ff',
      colorBgContainer: theme === 'light' ? '#ffffff' : '#171717',
      colorText: theme === 'light' ? '#000000' : '#fafafa',
    },
  };
  return (
    <Provider store={store}>
      <GlobalProvider>
        <AntdRegistry>
          <ConfigProvider
            theme={antdTheme}
          >
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </ConfigProvider>
        </AntdRegistry>
      </GlobalProvider>
    </Provider>
  )
}