import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { ToastMessage, TopPanel } from '../../(components)';
import { SYSTEM_SETTINGS_PATHS } from '@/data/systemSettingsData';
import { BusinessInformationPage, EmailTemplatePage, ExternalServicesPage, GeneralSettingsPage, LiveModeConfigurationPage, MockServicesPage, OnboardingSettingsPage, TestModeConfigurationPage, UserAgreementsPage } from './(components)';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { RefreshStoredToken } from '@/components/globalComponents';
import { getCookies } from '@/config/cookies';
import { findPermissionSlug } from '@/utils/findPermissionSlug';

const SystemSettingsPage = async ({ searchParams }: UrlParamsProps) => {
  const getMode = getCookies('environment');
  const path = searchParams?.path || '';

  const fetchedDetails : any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyDetails(),
    method: 'GET',
    data: null
  });

  let details = fetchedDetails?.data;

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  const environment = getMode || '';

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedProfile?.status == 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: { },
      apiEndpoint: API?.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${getCookies('aperta-user-refreshToken')}`
      }
    });

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  let profile = fetchedProfile?.data;

  const apiProvider = profile?.user?.role?.parent?.slug == 'api-provider'
  let userPermissions = profile?.user?.role?.permissions;
  let viewRestriction = findPermissionSlug(userPermissions, 'view-api-restrictions')

  const fetchedSettings : any = apiProvider ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getSettings({
      type: path || 'general'
    }),
    method: 'GET',
    data: null
  }) : null;

  const fetchedIps: any = (!apiProvider && viewRestriction) ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getIPWhitelist({
      environment
    }),
    method: 'GET',
    data: null
  }) : null;

  const fetchedTypes: any = apiProvider ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyTypes(),
    method: 'GET',
    data: null
  }) : null;

  const fetchedAPI: any = !apiProvider ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPIKey({
      environment
    }),
    method: 'GET',
    data: null
  }) : null;

  const fetchedClientId: any = !apiProvider ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getClientId({
      environment
    }),
    method: 'GET',
    data: null
  }) : null;

  let companyTypes = fetchedTypes?.data?.companySubtypes;
  let ips = fetchedIps?.data;
  let apiKey = fetchedAPI?.data;
  let settings = fetchedSettings?.data;
  let clientId = fetchedClientId?.data

  const rawPanel = SYSTEM_SETTINGS_PATHS?.filter((path: any) => 
    path?.type?.includes(profile?.user?.role?.parent?.slug) && (
      profile?.user?.role?.parent?.slug == 'api-provider' ? 
        true : 
        path?.subType?.includes(details?.type)
    ) && (
      path?.environment == getMode ||
      path?.environment == 'all'
    )
  );

  const panel = rawPanel?.filter((panel: any) => (
    details?.isVerified || panel?.name != 'live_mode_configuration'
  ))

  // console.log(profile?.user?.role?.parent?.slug, details?.type)

  const configData = {
    ips: ips?.ips,
    key: apiKey?.key,
    clientId: clientId?.clientId
  }

  const notIndividual = (
    details?.type == 'licensed-entity' ||
    details?.type == 'business'
  );
  // console.log(profile?.user?.role?.parent?.slug, details?.type);

  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      {
        /* SSR TOAST ERROR */
        (fetchedSettings?.status != 200 && fetchedSettings?.status != 201) && 
        <ToastMessage 
          message={fetchedSettings?.message} 
        />
      }
      {
        /* SSR TOAST ERROR */
        (fetchedIps?.status != 200 && fetchedIps?.status != 201) && 
        <ToastMessage 
          message={fetchedIps?.message} 
        />
      }
      {
        /* SSR TOAST ERROR */
        (fetchedAPI?.status != 200 && fetchedAPI?.status != 201) && 
        <ToastMessage 
          message={fetchedAPI?.message} 
        />
      }
      <TopPanel 
        name='path'
        panel={panel}
        currentValue={path}
      />
      
      <div className='w-full flex flex-col'>
        {
          profile?.user?.role?.parent?.slug == 'api-provider' ?
            (
              path == '' ? 
                <GeneralSettingsPage 
                  rawData={settings}
                  profileData={profile} 
                /> :
                path == 'onboarding_custom_fields' ?
                  <OnboardingSettingsPage 
                    rawData={companyTypes}
                    profileData={profile} 
                  /> :
                  path == 'user_agreements' ?
                    <UserAgreementsPage 
                      rawData={settings}
                      profileData={profile}/
                    > :
                      path == 'email_templates' ? 
                        <EmailTemplatePage 
                          rawData={settings}
                          profileData={profile} 
                        /> :
                        path == 'external_services' ? 
                          <ExternalServicesPage /> :
                          path == 'mock_services' ? 
                            <MockServicesPage /> :
                            null
            ) : (
              (
                (notIndividual ? 
                  path == 'test_mode_configuration' : 
                  path == '') &&
                  (getMode == 'development')
              ) ? 
                <TestModeConfigurationPage 
                  rawData={configData}
                  profileData={profile}
                /> :
                  (
                    (notIndividual ? 
                    path == 'live_mode_configuration' : 
                    path == '') &&
                    details?.isVerified &&
                    (getMode == 'production')
                  ) ? 
                  <LiveModeConfigurationPage 
                    rawData={configData}
                    profileData={profile}
                  /> :
                  notIndividual && path == '' ? 
                    <BusinessInformationPage 
                      rawData={null}
                      profileData={profile}
                    /> :
                    null
            ) 
        }
      </div>
    </section>
  )
}

export default SystemSettingsPage