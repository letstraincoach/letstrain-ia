import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
}

export const metadata: Metadata = {
  title: {
    default: 'Lets Train',
    template: '%s | Lets Train',
  },
  description: 'Metodologia real. Resultado de verdade. Treinos diários personalizados, progressão automática e conquistas.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lets Train',
  },
  openGraph: {
    type: 'website',
    siteName: 'Lets Train',
    title: 'Lets Train — Personal Trainer IA',
    description: 'Treinos diários personalizados por IA. Progressão automática. R$29,90/mês.',
    locale: 'pt_BR',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
