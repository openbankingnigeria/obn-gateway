'use client'

import { setJsCookies } from '@/config/jsCookie';

const RefreshStoredToken = ({ data }: { data: any }) => {
  setJsCookies('aperta-user-accessToken', data?.accessToken);
  setJsCookies('aperta-user-refreshToken', data?.refreshToken);
  return null
}

export default RefreshStoredToken