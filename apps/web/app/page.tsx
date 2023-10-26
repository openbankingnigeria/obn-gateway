'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const WebAppIndexPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    pathname == '/' &&
      router.push('/signin');
  }, [pathname, router]);

  return (
    null
  )
}

export default WebAppIndexPage
