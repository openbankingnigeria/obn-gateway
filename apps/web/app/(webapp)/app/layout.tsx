import type { Metadata } from 'next'
import { AppLeftSideBar, AppNavBar } from '../(components)'
import { redirect } from 'next/navigation'
import { getCookies } from '@/config/cookies'

export const metadata: Metadata = {
  title: 'Aperta - App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!getCookies('aperta-user-accessToken')) {
    redirect('/signin')
  } else {
    return (
      <section className='max-w-full min-h-screen relative bg-[#FCFDFD]'>
        <AppNavBar />
        <AppLeftSideBar />

        <main className='w-full min-h-screen flex flex-col pt-[112px] pb-[25px] wide:pl-[360px] pl-[330px] wide:pr-[80px] pr-[25px] overflow-auto'>
          <section className='w-full h-full flex flex-col'>
            {children}
          </section>
        </main>
      </section>
    )
  }
}
