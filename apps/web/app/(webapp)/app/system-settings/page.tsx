import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { ToastMessage, TopPanel } from '../../(components)';
import { SYSTEM_SETTINGS_PATHS } from '@/data/systemSettingsData';
import { BusinessInformationPage, EmailServicePage, EmailTemplatePage, ExternalServicesPage, GeneralSettingsPage, LiveModeConfigurationPage, MockServicesPage, OnboardingSettingsPage, TestModeConfigurationPage, UserAgreementsPage } from './(components)';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';

const SystemSettingsPage = async ({ searchParams }: UrlParamsProps) => {
  const path = searchParams?.path || ''
  const environment = (
    path == 'test_mode_configuration' ? 
    'development' : 'production'
  );
;

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  if (fetchedProfile?.status == 401) {
    return <Logout />
  }

  let profile = fetchedProfile?.data;

  const apiProvider = profile?.user?.role?.parent?.slug == 'api-provider'

  const fetchedDetails : any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyDetails(),
    method: 'GET',
    data: null
  });

  const fetchedSettings : any = apiProvider ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getSettings({
      type: path || 'general'
    }),
    method: 'GET',
    data: null
  }) : null;

  const fetchedIps: any = !apiProvider ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getIPWhitelist({
      environment
    }),
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

  let details = fetchedDetails?.data;
  let ips = fetchedIps?.data;
  let apiKey = fetchedAPI?.data;
  let settings = fetchedSettings?.data;

  const panel = SYSTEM_SETTINGS_PATHS?.filter((path: any) => 
    path?.type?.includes(profile?.user?.role?.parent?.slug) && (
      profile?.user?.role?.parent?.slug == 'api-provider' ? 
        true : 
        path?.subType?.includes(details?.type)
    )
  );

  // console.log(profile?.user?.role?.parent?.slug, details?.type)

  const configData = {
    ips: ips?.ips,
    key: apiKey?.key
  }

  const notIndividual = (
    details?.type == 'licensed-entity' ||
    details?.type == 'business'
  );

  // console.log(profile?.user?.role?.parent?.slug, details?.type);

  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
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
                    rawData={settings}
                    profileData={profile} 
                  /> :
                  path == 'user_agreements' ?
                    <UserAgreementsPage 
                      rawData={settings}
                      profileData={profile}/
                    > :
                    path == 'email_settings' ?
                      <EmailServicePage 
                        rawData={settings}
                        profileData={profile} 
                      /> :
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
                notIndividual ? 
                  path == 'test_mode_configuration' : 
                  path == ''
              ) ? 
                <TestModeConfigurationPage 
                  rawData={configData}
                  profileData={profile}
                /> :
                  path == 'live_mode_configuration' ? 
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