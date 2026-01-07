import type { Metadata } from 'next'
import Dashboard from '@/components/Dashboard'
import DashboardProtected from '@/containers/protected/dashboard-protected'

{/* <Layout style={{ minHeight: '100vh' }}>
                            <Sidebar />
                            <Layout>
                                <Header />
                                <Content style={{ margin: '16px' }}>
                                    {children}
                                </Content>
                            </Layout>
                        </Layout> */}

export const metadata: Metadata = {
    title: 'Hệ thống quản lý bán hàng đa kênh Omni',
}

export default async function LocaleLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardProtected>
            <Dashboard>{children}</Dashboard>
        </DashboardProtected>
    )
}
