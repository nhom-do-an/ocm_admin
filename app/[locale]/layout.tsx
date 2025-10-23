import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Providers from '../providers'
import { Locale, locales } from '@/lib/i18n'
import { notFound } from 'next/navigation'

import NextTopLoader from 'nextjs-toploader'

{/* <Layout style={{ minHeight: '100vh' }}>
                            <Sidebar />
                            <Layout>
                                <Header />
                                <Content style={{ margin: '16px' }}>
                                    {children}
                                </Content>
                            </Layout>
                        </Layout> */}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const messages = await getMessages({ locale });
    if (!locales.includes(locale as Locale)) notFound()
    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <NextTopLoader
                color="#29d"
                initialPosition={0.3}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={500}
            />
            <Providers>
                {children}
            </Providers>
        </NextIntlClientProvider>
    )
}
