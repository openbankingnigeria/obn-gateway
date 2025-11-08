import { type QueryClient } from '@tanstack/react-query';

export const profileQueryKey = ['user', 'profile'] as const;
export const companyDetailsQueryKey = ['user', 'company-details'] as const;
export const settingsQueryKey = (type: string = 'general') =>
  ['user', 'settings', type] as const;

export function primeProfileQuery(queryClient: QueryClient, data: any) {
  queryClient.setQueryData(profileQueryKey, data ?? null);
}

export function primeCompanyDetailsQuery(
  queryClient: QueryClient,
  data: any
) {
  queryClient.setQueryData(companyDetailsQueryKey, data ?? null);
}

export function primeSettingsQuery(
  queryClient: QueryClient,
  data: any,
  type: string = 'general'
) {
  queryClient.setQueryData(settingsQueryKey(type), data ?? null);
}
