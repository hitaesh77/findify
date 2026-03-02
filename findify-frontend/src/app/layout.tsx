import './globals.css'
import Header from '../components/Header'
import ProtectedRoute from '../components/ProtectedRoute'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Findify',
  description: 'Internship scraper dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ProtectedRoute>
          <Header />
          <main className="p-6">{children}</main>
        </ProtectedRoute>
      </body>
    </html>
  )
}
