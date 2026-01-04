// Suppress warnings early
import '@/lib/suppress-warnings'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OCM',
  icons: {
    icon: "/icon/logo.png",
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
