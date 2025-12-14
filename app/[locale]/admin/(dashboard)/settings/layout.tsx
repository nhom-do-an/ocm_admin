'use client'
import Sidebar from '@/components/layout/Sidebar'
import { SCREEN } from '@/constants/constant'
import { settingMenuItems } from '@/constants/settingMenu'
import React from 'react'
import { X, ArrowLeft } from "lucide-react"
import { useAppRouter } from '@/app/hooks/useAppReouter'
import { useGlobalContext } from '@/hooks/useGlobalContext'

function SettingLayout({
    children,

}: {
    children: React.ReactNode
}) {
    const router = useAppRouter()
    const { settingOpen, setSettingOpen } = useGlobalContext()
    return (
        <div className='w-full h-full flex flex-row px-5 pt-2 bg-accent'>
            <div className={`h-screen transition w-fit max-sm:hidden `}>
                <Sidebar menuItems={settingMenuItems} theme='light' menuClass='!rounded-[8px] w-[50]' sidebarClass='rounded !bg-transparent ' currentPath={SCREEN.GENERAL_SETTING.PATH} />
            </div>

            <div className={`flex-1 h-full overflow-y-scroll transition-all max-sm:hidden`}>
                {children}
            </div>

            {settingOpen && <div className={`fixed top-0 left-0 h-screen w-screen bg-white sm:hidden z-50`}>
                <div className='h-[55px] border-b drop-shadow-sm w-full bg-[var(--header)] border-[var(--header-border)] flex items-center px-5 font-medium text-lg justify-between'>
                    <span className='font-semibold'>Cấu hình</span>
                    <button onClick={() => router.push(SCREEN.HOME.PATH)}><X /></button>
                </div>
                <div className="h-full overflow-y-scroll">
                    <Sidebar menuItems={settingMenuItems} theme='light' menuClass='w-screen' sidebarClass='rounded !bg-transparent ' currentPath={SCREEN.GENERAL_SETTING.PATH} />
                </div>

            </div>}

            <div className={`fixed top-0 left-0 h-screen w-screen transition-all sm:hidden`}>
                <div className='h-[55px] border-b drop-shadow-sm w-full bg-[var(--header)] border-[var(--header-border)] flex items-center px-5 font-medium text-lg justify-between'>
                    <div className="flex gap-1 items-center text-[var(--primary)] hover:cursor-pointer" onClick={() => setSettingOpen(true)}>
                        <button>
                            <ArrowLeft />
                        </button>
                        <span className='font-medium'>Quay lại</span>
                    </div>

                    <button onClick={() => router.push(SCREEN.HOME.PATH)}><X /></button>
                </div>
                <div className='pt-2 px-5  h-full overflow-y-scroll'>{children}</div>
            </div>
        </div>
    )
}

export default SettingLayout