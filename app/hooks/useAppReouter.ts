
'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export function useAppRouter() {
    const router = useRouter()
    const locale = useLocale()

    return {
        push: (path: string) => router.push(`/${locale}${path}`),
        replace: (path: string) => router.replace(`/${locale}${path}`),
        prefetch: (path: string) => router.prefetch(`/${locale}${path}`),
        back: () => router.back(),
    }
}
