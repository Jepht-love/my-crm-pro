import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'MyCRMPro Admin',
  description: 'Super Admin — My CRM Pro',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CRM Admin',
  },
}

export const viewport: Viewport = {
  themeColor: '#7C5CFC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function MobileAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
