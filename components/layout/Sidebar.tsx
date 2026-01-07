'use client';

import { Layout, Menu } from 'antd';
import { useState, useEffect } from 'react';
import { AppMenuItem } from '@/constants/menu';
import { useTranslations } from 'next-intl';
import type { MenuProps, MenuTheme } from 'antd';
import { useAppRouter } from '@/app/hooks/useAppReouter';
import { SCREEN } from '@/constants/constant';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useGlobalContext } from '@/hooks/useGlobalContext';
import SalesChannelSection from '../SaleChannelSection';

const { Sider } = Layout;

export function mapMenuItems(
    items: AppMenuItem[],
    t: (key: string) => string
): MenuProps['items'] {
    return items.map((item) => ({
        key: item.key,
        icon: item.icon ? (
            <div className="flex items-center justify-center">{item.icon}</div>
        ) : undefined,
        label: t(item.label),
        children: item.children ? mapMenuItems(item.children, t) : undefined,
    }));
}

function normalizePath(pathname: string) {
    const parts = pathname.split('/');
    if (parts.length > 1 && ['en', 'vi'].includes(parts[1])) {
        return '/' + parts.slice(2).join('/');
    }
    return pathname;
}

interface Props {
    collapsed?: boolean;
    setCollapsed?: (value: boolean) => void;
    menuItems: AppMenuItem[];
    theme?: MenuTheme;
    menuClass: string;
    sidebarClass?: string;
}

export default function Sidebar(props: Props) {
    const { sidebarClass, collapsed, setCollapsed, theme, menuItems, menuClass } = props;
    const { openSidebar, setOpenSidebar, setSettingOpen } = useGlobalContext()
    const router = useAppRouter();
    const t = useTranslations();
    const pathname = usePathname();

    const [openKeys, setOpenKeys] = useState<string[]>([]);

    const normalizedPath = normalizePath(pathname || SCREEN.HOME.PATH);

    const [current, setCurrent] = useState(normalizedPath);

    useEffect(() => {
        setCurrent(normalizedPath);
    }, [normalizedPath]);

    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        router.push(e.key);
        setSettingOpen(false)
    };

    const onSettingOpen: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        router.push(e.key);
        setOpenSidebar(false)
    };

    const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
        const latestOpenKey = keys.find((key) => !openKeys.includes(key));
        setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    };

    return (
        <Sider
            trigger={null}
            collapsible={setCollapsed !== undefined}
            collapsed={collapsed ?? false}
            width={256}
            collapsedWidth={80}
            className={`max-h-screen h-screen bg-black flex flex-col relative ${sidebarClass}`}
        >
            {/* Header */}
            {setCollapsed && (
                <div
                    className={`flex items-center justify-between bg-[#001529] text-white border-b border-white/5 ${collapsed && 'justify-center py-2 mb-2'
                        } px-5 absolute left-0 top-0 w-full z-50 h-[55px]`}
                >
                    {!collapsed && <Image src="/admin/icon/full_logo.png" width={100} height={30} alt="logo" />}
                    {!openSidebar && <span onClick={() => setCollapsed(!collapsed)} className="cursor-pointer">
                        {collapsed ? <ChevronLeft /> : <ChevronRight />}
                    </span>}
                </div>
            )}

            {/* Scrollable content wrapper */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
                {/* Menu chính */}
                <div className={menuClass}>
                    <Menu
                        className="rounded-[8px]"
                        theme={theme || 'dark'}
                        mode="inline"
                        selectedKeys={[current]}
                        openKeys={openKeys}
                        onOpenChange={onOpenChange}
                        onClick={onClick}
                        items={mapMenuItems(menuItems, t)}
                    />
                </div>

                {/* Kênh bán hàng Section */}
                {setCollapsed && <SalesChannelSection collapsed={collapsed} />}
            </div>

            {/* Settings Menu - Fixed at bottom */}
            {setCollapsed && (
                <div className="border-t border-white/10 w-full bg-black absolute bottom-0">
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[current]}
                        onClick={onSettingOpen}
                        items={[
                            {
                                key: '/admin/settings',
                                icon: <Settings size={20} />,
                                label: t('settings.label'),
                            },
                        ]}
                    />
                </div>
            )}
        </Sider>
    );
}