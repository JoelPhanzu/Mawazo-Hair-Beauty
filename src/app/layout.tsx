import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'

// Deux familles maximum, sous-ensemble latin, auto-hébergées par next/font.
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Mawazo Hair & Beauty | Salon de coiffure à Kinshasa',
    template: '%s | Mawazo Hair & Beauty',
  },
  description:
    'Salon de coiffure et de beauté à Lingwala, Kinshasa : wings, perruques, tissages, tresses, make-up et ongles. Réservation sur WhatsApp.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4ece3' },
    { media: '(prefers-color-scheme: dark)', color: '#1d1512' },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh font-sans text-base leading-relaxed">{children}</body>
    </html>
  )
}
