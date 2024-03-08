import React from 'react'
import { ActivityDetails, ActivitySections } from '../(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes';
import { ACTIVITY_REQUEST_PARAMS_DATA, ACTIVITY_RESPONSE_DATA } from '@/data/activityData';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { getCookies } from '@/config/cookies';
import { ToastMessage } from '@/app/(webapp)/(components)';

const ActivityPage = async ({ params, searchParams }: UrlParamsProps) => {
  const activityId = params?.id;
  const path = searchParams?.path || '';
  const environment = getCookies('environment');

  const fetchedActivity: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPILog({
      environment: environment || 'development',
      id: activityId
    }),
    method: 'GET',
    data: null
  });

  if (fetchedActivity?.status == 401) {
    return <Logout />
  }

  let activity = fetchedActivity?.data

  const request_params = ACTIVITY_REQUEST_PARAMS_DATA;
  const response = ACTIVITY_RESPONSE_DATA;

  // let raw_data = path == 'response' ? 
  //   response : request_params;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      {
        /* SSR TOAST ERROR */
        (fetchedActivity?.status != 200 && fetchedActivity?.status != 201) && 
        <ToastMessage 
          message={fetchedActivity?.message} 
        />
      }

      <ActivityDetails 
        path='details'
        rawData={activity}
      />

      <ActivitySections 
        path={path}
        // rawData={raw_data}
        rawData={activity}
      />
    </section>
  )
}

export default ActivityPage