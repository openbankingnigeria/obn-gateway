'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const ApiManagementIndexPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    (pathname == '/app/api-management' || pathname == '/app/api-management/') &&
      router.push('/app/api-management/consumers');
  }, [pathname, router]);

  return (
    null
  )
}

export default ApiManagementIndexPage
