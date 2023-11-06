import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { TopPanel } from '../../(components)';
import { SYSTEM_SETTINGS_PATHS } from '@/data/systemSettingsData';
import { EmailServicePage, EmailTemplatePage, ExternalServicesPage, GeneralSettingsPage, MockServicesPage } from './(components)';

const SystemSettingsPage = ({ searchParams }: UrlParamsProps) => {
  const path = searchParams?.path || ''
  const panel = SYSTEM_SETTINGS_PATHS;

  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
      <TopPanel 
        name='path'
        panel={panel}
        currentValue={path}
      />
      
      <div className='w-full flex flex-col'>
        {
          path == 'email_service' ?
            <EmailServicePage /> :
            path == 'email_template' ? 
              <EmailTemplatePage /> :
              path == 'external_services' ? 
                <ExternalServicesPage /> :
                path == 'mock_services' ? 
                  <MockServicesPage /> :
                  <GeneralSettingsPage />
        }
      </div>
    </section>
  )
}

export default SystemSettingsPage