import './globals.css'
import Header from '../components/Header'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Findify',
  description: 'Internship scraper dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Header />
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}
