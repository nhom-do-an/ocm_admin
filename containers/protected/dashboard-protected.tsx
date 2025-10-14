'use client'

import Loader from '@/components/Loader'
import { SCREEN } from '@/constants/constant'
import { useGlobalContext } from '@/hooks/useGlobalContext'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

interface DashboardProtectedProps {
    children: ReactNode
}

const DashboardProtected = ({ children }: DashboardProtectedProps) => {
    const { user, loading, existingStore } = useGlobalContext()
    const router = useRouter()

    useEffect(() => {
        if (loading) return

        if (user) {
            if (!existingStore) {
                const domain = process.env.NEXT_PUBLIC_DOMAIN
                const domainStore = user.domain_store
                if (domain) {
                    window.location.href = `https://${domainStore}.${domain}${SCREEN.LOGIN.PATH}`
                } else {
                    const currentHost = window.location.host
                    const parts = currentHost.split('.')
                    if (parts.length === 1) {
                        window.location.href = `http://${domainStore}.${currentHost}${SCREEN.LOGIN.PATH}`
                    } else {
                        window.location.href = `http://${domainStore}.${parts.join('.')}${SCREEN.LOGIN.PATH}`
                    }
                }
            }
        } else {
            if (existingStore) {
                router.push(SCREEN.LOGIN.PATH)
            } else {
                const domain = process.env.NEXT_PUBLIC_DOMAIN
                if (domain) {
                    window.location.href = `https://${domain}${SCREEN.REGISTER.PATH}`
                } else {
                    const currentHost = window.location.host
                    const parts = currentHost.split('.')
                    if (parts.length === 1) {
                        window.location.href = `http://${currentHost}${SCREEN.REGISTER.PATH}`
                    } else {
                        window.location.href = `http://${parts.join('.')}${SCREEN.REGISTER.PATH}`
                    }
                }
            }
        }
    }, [user, existingStore, loading, router])


    if (loading) {
        return (
            <Loader />
        )
    }

    if (user && existingStore) {
        return <>{children}</>
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
            <p className="text-gray-500">Đang chuyển hướng...</p>
        </div>
    )
}

export default DashboardProtected
