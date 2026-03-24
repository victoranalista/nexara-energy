import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: 'Nexara Energy | Solar AI Technology - Painéis Solares em Brasília',
  description: 'Painéis solares com inteligência artificial em Brasília e região. Transforme sua casa em uma fonte de energia limpa com máxima eficiência e economia garantida.',
  keywords: ['painéis solares Brasília', 'energia solar DF', 'sustentabilidade', 'energia limpa', 'economia de energia', 'Nexara Energy', 'Solar AI'],
  authors: [{ name: 'Nexara Energy' }],
  openGraph: {
    title: 'Nexara Energy | Solar AI Technology - Brasília',
    description: 'Painéis solares com inteligência artificial em Brasília. Máxima eficiência e economia garantida.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
