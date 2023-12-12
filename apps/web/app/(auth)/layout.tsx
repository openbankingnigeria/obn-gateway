import { getCookies } from '@/config/cookies'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthContainer } from './(components)'

export const metadata: Metadata = {
  title: 'Aperta - Auth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (getCookies('aperta-user-accessToken')) {
    redirect('/app/home/dashboard')
  } else {
    return (
      <AuthContainer>
        {children}
      </AuthContainer>
    )
  }
}
