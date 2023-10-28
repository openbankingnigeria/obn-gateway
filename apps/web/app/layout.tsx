import './globals.css'
import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'Aperta',
  description: 'Aperta By Open Banking Nigeria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastContainer autoClose={5000} position='top-right' closeOnClick />
        {children}
      </body>
    </html>
  )
}
