import { cache } from 'react';
import * as API from '@/config/endpoints';
import { applyAxiosRequest } from '@/hooks';
import { getCookies } from '@/config/cookies';

interface UserBootstrapData {
  profile: any;
  companyDetails: any;
  settings: any;
  refreshTokenData: any;
  shouldLogout: boolean;
}

export const getUserBootstrapData = cache(async (): Promise<UserBootstrapData> => {
  const [fetchedDetails, fetchedProfile, fetchedSettings] = await Promise.all([
    applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyDetails(),
      method: 'GET',
      data: null,
    }),
    applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getProfile(),
      method: 'GET',
      data: null,
    }),
    applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getSettings({
        type: 'general',
      }),
      method: 'GET',
      data: null,
    }),
  ]);

  let refreshTokenRes: any = null;

  if (fetchedDetails?.status === 401 || fetchedProfile?.status === 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${await getCookies('aperta-user-refreshToken')}`,
      },
    });

    if (!(refreshTokenRes?.status === 200 || refreshTokenRes?.status === 201)) {
      return {
        profile: null,
        companyDetails: null,
        settings: null,
        refreshTokenData: null,
        shouldLogout: true,
      };
    }
  }

  return {
    profile: fetchedProfile?.data ?? null,
    companyDetails: fetchedDetails?.data ?? null,
    settings: fetchedSettings?.data ?? null,
    refreshTokenData: refreshTokenRes?.data ?? null,
    shouldLogout: false,
  };
});
