"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dropdown } from 'antd'


const locales = [
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'en', label: 'English' }
]


export default function Header() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)
    const currentLocale = locales.find(l => l.code === segments[0])?.code || 'vi'
    console.log("Cur::", currentLocale)

    const rest = segments.slice(1).join('/')


    const items = locales.map(l => ({
        key: l.code,
        label: <Link href={`/${l.code}/${rest}`}>{l.label}</Link>
    }))


    return (
        <header className="border-b">
            <div className="container py-4 flex items-center justify-between">
                <Link href={`/${currentLocale}`} className="font-semibold">Next Base</Link>
                <Dropdown menu={{ items }} trigger={['click']}>
                    <button className="px-3 py-2 rounded-2xl border">{currentLocale.toUpperCase()}</button>
                </Dropdown>
            </div>
        </header>
    )
}