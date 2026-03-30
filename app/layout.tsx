import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { BinaryBackground } from '@/components/ui/BinaryBackground'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Littafin Fasaha',
  description: 'Learn computing and technology through Hausa — interactive courses by Hajara-Yasmin Isa.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BinaryBackground />
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
