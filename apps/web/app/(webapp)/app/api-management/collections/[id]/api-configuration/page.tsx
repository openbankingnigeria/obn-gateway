import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { DownStreamForm, TransformationForm, UpstreamForm } from '../../(components)';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';

const APIConfigurationPage = async({ params, searchParams }: UrlParamsProps) => {
  const api_id = searchParams?.api_id || '';
  const preview = searchParams?.preview || '';
  const environment = 'development';

  const fetchedAPI: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPI({
      environment,
      id: api_id
    }),
    method: 'GET',
    data: null
  })

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  if (fetchedAPI?.status == 401) {
    return <Logout />
  }

  let apiDetails = fetchedAPI?.data;
  let profile = fetchedProfile?.data;

  return (
    <section className='w-full gap-[20px] flex flex-col h-full'>
      <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
        API Configuration
      </h3>

      <DownStreamForm 
        rawData={apiDetails}
      />
      <UpstreamForm 
        rawData={apiDetails}
        profileData={profile}
        preview={preview}
      />
      <TransformationForm 
        rawData={apiDetails}
        profileData={profile}
        preview={preview}
      />
    </section>
  )
}

export default APIConfigurationPage