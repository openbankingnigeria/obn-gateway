"use client";

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';
import { useUserStore } from '@/stores';
import {
  profileQueryKey,
  companyDetailsQueryKey,
  settingsQueryKey,
} from './userQueryKeys';

async function fetchProfile(): Promise<any> {
  const response = await clientAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null,
    noToast: true,
  });

  return response?.data ?? null;
}

async function fetchCompanyDetails(): Promise<any> {
  const response = await clientAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyDetails(),
    method: 'GET',
    data: null,
    noToast: true,
  });

  return response?.data ?? null;
}

async function fetchSettings(type: string = 'general'): Promise<any> {
  const response = await clientAxiosRequest({
    headers: {},
    apiEndpoint: API.getSettings({ type }),
    method: 'GET',
    data: null,
    noToast: true,
  });

  return response?.data ?? null;
}

export function useProfileQuery() {
  const initialProfile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);

  const query = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
    initialData: initialProfile ?? undefined,
    initialDataUpdatedAt: initialProfile ? Date.now() : undefined,
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setProfile(query.data ?? null);
    }
  }, [query.data, setProfile]);

  return query;
}

export function useCompanyDetailsQuery() {
  const initialCompanyDetails = useUserStore((state) => state.companyDetails);
  const setCompanyDetails = useUserStore((state) => state.setCompanyDetails);

  const query = useQuery({
    queryKey: companyDetailsQueryKey,
    queryFn: fetchCompanyDetails,
    initialData: initialCompanyDetails ?? undefined,
    initialDataUpdatedAt: initialCompanyDetails ? Date.now() : undefined,
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setCompanyDetails(query.data ?? null);
    }
  }, [query.data, setCompanyDetails]);

  return query;
}

export function useSettingsQuery(type: string = 'general') {
  const initialSettings = useUserStore((state) =>
    type === 'general' ? state.settings : undefined
  );
  const setSettings = useUserStore((state) => state.setSettings);

  const query = useQuery({
    queryKey: settingsQueryKey(type),
    queryFn: () => fetchSettings(type),
    initialData: initialSettings ?? undefined,
    initialDataUpdatedAt: initialSettings ? Date.now() : undefined,
  });

  useEffect(() => {
    if (type === 'general' && query.data !== undefined) {
      setSettings(query.data ?? null);
    }
  }, [query.data, setSettings, type]);

  return query;
}
