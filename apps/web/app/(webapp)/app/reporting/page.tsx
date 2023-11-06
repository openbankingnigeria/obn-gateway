'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const ReportingIndexPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    (pathname == '/app/reporting' || pathname == '/app/reporting/') &&
      router.push('/app/reporting/reports');
  }, [pathname, router]);

  return (
    null
  )
}

export default ReportingIndexPage
