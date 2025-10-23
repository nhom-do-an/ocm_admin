'use client'
import React, { useEffect, useState } from 'react'
import Sidebar from './layout/Sidebar'
import { menuItems } from '@/constants/menu'
import Header from './layout/Header'
import { useGlobalContext } from '@/hooks/useGlobalContext'


function Dashboard({ children }: { children: React.ReactNode }) {
    const { openSidebar, setOpenSidebar, collapsed, setCollapsed } = useGlobalContext()
    const [width, setWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return (
        <div className="min-h-screen flex flex-col w-screen">
            <div className="flex-1 w-full">
                <div className="flex flex-row h-screen ">
                    <div className={`max-sm:hidden h-screen fixed top-0 left-0 ${collapsed ? "w-20" : "w-64"} transition-all !border-r !border-white z-50`}>
                        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} menuItems={menuItems} menuClass='max-h-[calc(100%-80px)] overflow-y-auto scrollbar-hidden mt-[60px]' />
                    </div>
                    {openSidebar &&
                        <div className="w-screen h-screen bg-black/10 fixed top-0 left-0 z-40"
                            onClick={() => setOpenSidebar(false)}>

                            <div
                                className={`h-screen fixed top-0 left-0 w-64 transition-all !border-r !border-white z-50 bg-white`}
                                onClick={(e) => e.stopPropagation()} // Ngăn overlay bị click khi bấm trong sidebar
                            >
                                <Sidebar
                                    collapsed={collapsed}
                                    setCollapsed={setCollapsed}
                                    menuItems={menuItems}
                                    menuClass="max-h-[calc(100%-80px)] overflow-y-auto scrollbar-hidden mt-[60px]"
                                />
                            </div>
                        </div>

                    }

                    <div className={`flex-1 max-h-screen h-screen  ${collapsed ? "ml-20" : "ml-64"} transition-all max-sm:ml-0 relative`}>
                        <div className={`fixed ${collapsed ? "left-20 w-[calc(100%-80px)]" : "left-64 w-[calc(100%-256px)]"}  max-sm:top-0 max-sm:left-0 max-sm:w-full transition-all`}>
                            <Header />
                        </div>

                        <div className={`absolute top-[55px] left-0 w-full px-5 h-[calc(100%-55px)] overflow-y-scroll`}> {children}</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard