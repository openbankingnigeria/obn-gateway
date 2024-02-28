import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { TopPanel } from '../../(components)';
import { SYSTEM_SETTINGS_PATHS } from '@/data/systemSettingsData';
import { BusinessInformationPage, EmailServicePage, EmailTemplatePage, ExternalServicesPage, GeneralSettingsPage, LiveModeConfigurationPage, MockServicesPage, OnboardingSettingsPage, TestModeConfigurationPage } from './(components)';
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
  const emailAndGeneralPath = (
    path == 'email_templates' || 
    path == 'email_settings' || 
    path == ''
  );

  const modeConfigurationPath = (
    path == 'test_mode_configuration' || 
    path == 'live_mode_configuration'
  );

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  const fetchedDetails : any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyDetails(),
    method: 'GET',
    data: null
  });

  const fetchedSettings : any = emailAndGeneralPath ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getSettings({
      type: path || 'general'
    }),
    method: 'GET',
    data: null
  }) : null;

  const fetchedIps: any = modeConfigurationPath ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getIPWhitelist({
      environment
    }),
    method: 'GET',
    data: null
  }) : null;

  const fetchedAPI: any = modeConfigurationPath ? await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPIKey({
      environment
    }),
    method: 'GET',
    data: null
  }) : null;

  if (fetchedProfile?.status == 401) {
    return <Logout />
  }

  let profile = fetchedProfile?.data;
  let details = fetchedDetails?.data;
  let ips = fetchedIps?.data;
  let apiKey = fetchedAPI?.data;
  let settings = fetchedSettings?.data;

  const panel = SYSTEM_SETTINGS_PATHS?.filter((path: any) => 
    path?.type?.includes(profile?.user?.role?.parent?.slug) &&
    path?.subType?.includes(details?.type)
  );

  const configData = {
    ips: ips?.ips,
    key: apiKey?.key
  }

  const notIndividual = (
    details?.type == 'licensed-entity' ||
    details?.type == 'business'
  );

  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
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
                <GeneralSettingsPage rawData={settings} /> :
                path == 'onboarding_settings' ?
                  <OnboardingSettingsPage /> :
                  path == 'email_settings' ?
                    <EmailServicePage rawData={settings} /> :
                    path == 'email_templates' ? 
                      <EmailTemplatePage rawData={settings} /> :
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
                    <BusinessInformationPage /> :
                    null
            ) 
        }
      </div>
    </section>
  )
}

export default SystemSettingsPage