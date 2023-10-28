'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const HomeIndexPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    (pathname == '/app/home' || pathname == '/app/home/') &&
      router.push('/app/home/dashboard');
  }, [pathname, router]);

  return (
    null
  )
}

export default HomeIndexPage
