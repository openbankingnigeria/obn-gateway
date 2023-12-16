import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { TopPanel } from '../../(components)';
import { SYSTEM_SETTINGS_PATHS } from '@/data/systemSettingsData';
import { BusinessInformationPage, EmailServicePage, EmailTemplatePage, ExternalServicesPage, GeneralSettingsPage, LiveModeConfigurationPage, MockServicesPage, TestModeConfigurationPage } from './(components)';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';

const SystemSettingsPage = async ({ searchParams }: UrlParamsProps) => {
  const path = searchParams?.path || ''

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
  const panel = SYSTEM_SETTINGS_PATHS?.filter((path: any) => path?.type == profile?.user?.role?.parent?.slug || path?.type == 'all');

  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
      <TopPanel 
        name='path'
        panel={panel}
        currentValue={path}
      />
      
      <div className='w-full flex flex-col'>
        {
          path == '' ? <GeneralSettingsPage /> :
          profile?.user?.role?.parent?.slug == 'api-provider' ?
            (
              path == 'email_service' ?
                <EmailServicePage /> :
                path == 'email_template' ? 
                  <EmailTemplatePage /> :
                  path == 'external_services' ? 
                    <ExternalServicesPage /> :
                    path == 'mock_services' ? 
                      <MockServicesPage /> :
                      null
            ) : (
              path == 'test_mode_configuration' ? 
                <TestModeConfigurationPage /> :
                  path == 'live_mode_configuration' ? 
                  <LiveModeConfigurationPage /> :
                  path == 'business_information' ? 
                    <BusinessInformationPage /> :
                    null
            )
        }
      </div>
    </section>
  )
}

export default SystemSettingsPage