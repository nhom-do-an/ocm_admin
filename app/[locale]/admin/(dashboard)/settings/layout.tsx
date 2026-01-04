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
        <div className='w-full h-full flex flex-row md:px-2 pt-2 bg-accent'>
            <div className={`h-screen transition w-fit max-md:hidden `}>
                <Sidebar menuItems={settingMenuItems} theme='light' menuClass='!rounded-[8px] w-[50]' sidebarClass='rounded !bg-transparent ' />
            </div>

            <div className={`flex-1 h-full overflow-y-scroll transition-all max-sm:hidden`}>
                {children}
            </div>

            {settingOpen && <div className={`fixed top-0 left-0 h-screen w-screen md:hidden z-50 bg-gray-100`}>
                <div className='h-[55px] border-b drop-shadow-sm w-full bg-[var(--header)] border-[var(--header-border)] flex items-center px-5 font-medium text-lg justify-between'>
                    <span className='font-semibold'>Cấu hình</span>
                    <button onClick={() => router.push(SCREEN.HOME.PATH)}><X /></button>
                </div>
                <div className="h-full overflow-y-scroll mt-2 w-screen ">
                    <Sidebar menuItems={settingMenuItems} theme='light' menuClass='max-w-[300px] mx-auto' sidebarClass='rounded !bg-transparent' />
                </div>

            </div>}

            <div className={`fixed top-0 left-0 h-screen w-screen transition-all md:hidden`}>
                <div className='mb-2 h-[55px] border-b drop-shadow-sm w-full bg-[var(--header)] border-[var(--header-border)] flex items-center px-5 font-medium justify-between'>
                    <div className="flex gap-1 items-center text-[var(--primary)] hover:cursor-pointer" onClick={() => setSettingOpen(true)}>
                        <button>
                            <ArrowLeft />
                        </button>
                        <span className='font-medium'>Quay lại</span>
                    </div>

                    <button onClick={() => router.push(SCREEN.HOME.PATH)}><X /></button>
                </div>
                <div className='pt-2  h-full overflow-y-scroll'>{children}</div>
            </div>
        </div>
    )
}

export default SettingLayout