'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const TeamIndexPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    (pathname == '/app/team' || pathname == '/app/team/') &&
      router.push('/app/team/members');
  }, [pathname, router]);

  return (
    null
  )
}

export default TeamIndexPage
