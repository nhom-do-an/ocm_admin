
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OCM',
  icons: {
    icon: "/icon/logo.png",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return (
    <html >
      <body>
        {children}
      </body>
    </html>
  )
}
