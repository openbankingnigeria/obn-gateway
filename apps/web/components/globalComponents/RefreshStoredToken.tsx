'use client'

import { useEffect } from 'react';
import { useAuthStore } from '@/stores';

interface RefreshStoredTokenProps {
  data: {
    accessToken?: string | null;
    refreshToken?: string | null;
  } | null;
}

const RefreshStoredToken = ({ data }: RefreshStoredTokenProps) => {
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    if (!data?.accessToken && !data?.refreshToken) {
      return;
    }

    setTokens({
      accessToken: data?.accessToken ?? null,
      refreshToken: data?.refreshToken ?? null,
    });
  }, [data, setTokens]);

  return null;
}

export default RefreshStoredToken