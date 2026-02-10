import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedLayout from '@/components/layout/ProtectedLayout'

export const metadata: Metadata = {
  title: 'Dromeas Operations System',
  description: 'AI-native operations platform for Dromeas Yachts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <ProtectedLayout>
            {children}
          </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
