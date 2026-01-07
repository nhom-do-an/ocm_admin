// Suppress warnings early
import '@/lib/suppress-warnings'
import './globals.css'
import type { Metadata } from 'next'

// Note: With basePath='/admin', icons in metadata need manual prefix
const basePath = process.env.NODE_ENV === 'production' ? '/admin' : '/admin';

export const metadata: Metadata = {
  title: 'OCM',
  icons: {
    icon: `${basePath}/icon/logo.png`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html >
      <body>
        {children}
      </body>
    </html>
  )
}
