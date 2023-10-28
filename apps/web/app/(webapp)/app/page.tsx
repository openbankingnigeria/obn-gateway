'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const AppIndexPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    (pathname == '/app' || pathname == '/app/') &&
      router.push('/app/home/dashboard');
  }, [pathname, router]);

  return (
    null
  )
}

export default AppIndexPage
