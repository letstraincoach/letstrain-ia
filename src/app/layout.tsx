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
    default: 'Lets Train — Treino personalizado por IA',
    template: '%s | Lets Train',
  },
  description: 'Metodologia real, resultados de verdade! Treinos diários personalizados por IA para academia, condomínio ou hotel. Progressão automática, 59 conquistas e muito mais. 3 dias grátis.',
  keywords: ['treino personalizado', 'personal trainer IA', 'academia', 'treino em casa', 'fitness', 'progressão automática', 'lets train'],
  manifest: '/manifest.json',
  metadataBase: new URL('https://letstrain.com.br'),
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lets Train',
  },
  openGraph: {
    type: 'website',
    siteName: 'Lets Train',
    title: 'Lets Train — Treino personalizado por IA',
    description: 'Metodologia real, resultados de verdade! Treinos diários personalizados por IA. 3 dias grátis, sem cobranças durante o trial.',
    locale: 'pt_BR',
    url: 'https://letstrain.com.br',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lets Train — Treino personalizado por IA',
    description: 'Metodologia real, resultados de verdade! Treinos diários personalizados por IA. 3 dias grátis.',
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
