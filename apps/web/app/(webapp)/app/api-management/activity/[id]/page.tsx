import React from 'react'
import { ActivityDetails, ActivitySections } from '../(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes';
import { ACTIVITY_REQUEST_PARAMS_DATA, ACTIVITY_RESPONSE_DATA } from '@/data/activityData';

const ActivityPage = ({ params, searchParams }: UrlParamsProps) => {
  const activityId = params?.id;
  const path = searchParams?.path || '';

  const request_params = ACTIVITY_REQUEST_PARAMS_DATA;
  const response = ACTIVITY_RESPONSE_DATA;

  let raw_data = path == 'response' ? 
    response : request_params;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <ActivityDetails />

      <ActivitySections 
        path={path}
        rawData={raw_data}
      />
    </section>
  )
}

export default ActivityPage