'use client'

import { ExportButton, StatusBox, ViewData } from '@/app/(webapp)/(components)';
import StatusCodeBox from '@/app/(webapp)/(components)/StatusCodeBox';
import { ACTIVITY_DETAILS } from '@/data/activityData';
import { ActivitySectionsProps } from '@/types/webappTypes/appTypes';
import { updateSearchParams } from '@/utils/searchParams';
import { timestampFormatter } from '@/utils/timestampFormatter';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const ActivityDetails = ({
  rawData,
  path
}: ActivitySectionsProps) => {
  const router = useRouter();
  const activity_details = rawData;
  // console.log(activity_details);

  useEffect(() => {
    const slug = updateSearchParams('slug', 'Activity Details');
    router.push(slug);
  }, [router]);

  return (
    <>
      <section className='flex flex-col gap-[20px] w-full'>
        <header className='w-full flex items-start justify-between gap-5'>
          <div className='w-full flex flex-col gap-[4px]'>
            <h2 className='w-full text-f18 text-o-text-dark font-[500]'>
              {activity_details?.id}
            </h2>

            <StatusCodeBox status={activity_details?.response?.status || 'status'} />
          </div>

          <ExportButton 
            module='activity_details'
            rawData={activity_details}
          />
        </header>

        <div className='w-full overflow-hidden bg-white border border-o-border rounded-[10px] h-fit'>
          <h3 className='px-[20px] py-[16px] w-full border-b border-o-border bg-o-bg2'>
            <div className='text-f16 font-[600] text-o-text-dark'>
              Details
            </div>
          </h3>

          <div className='w-full p-[20px] grid grid-cols-2 ms:grid-cols-3 lgg:grid-cols-4 gap-[16px] bg-white'>
            <ViewData 
              label='Consumer Name'
              value={activity_details?.company?.name}
            />

            {/* <ViewData 
              label='Email Address'
              value={activity_details?.email_address}
            /> */}

            <ViewData 
              label='API Name'
              value={activity_details?.name}
            />

            <ViewData 
              label='Status'
              value={
                <div className='w-fit flex items-center gap-[4px]'>
                  <StatusCodeBox status={activity_details?.response?.status} />
                </div>
              }
            />

            <ViewData 
              label='Endpoint URL'
              value={activity_details?.request?.url}
            />

            <ViewData 
              label='Timestamp'
              value={timestampFormatter(activity_details?.timestamp)}
            />

            <ViewData 
              label='Status Code'
              value={activity_details?.response?.status}
            />

            <ViewData 
              label='Response Time'
              value={
                // activity_details?.response_time + 'ms'
                activity_details?.response_time
              }
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default ActivityDetails