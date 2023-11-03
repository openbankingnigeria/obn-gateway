'use client'

import { ExportButton, StatusBox, ViewData } from '@/app/(webapp)/(components)';
import { ACTIVITY_DETAILS } from '@/data/activityData';
import { updateSearchParams } from '@/utils/searchParams';
import { timestampFormatter } from '@/utils/timestampFormatter';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ActivityDetails = () => {
  const router = useRouter();
  const activity_details = ACTIVITY_DETAILS;

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
              {activity_details?.reference_id}
            </h2>

            <StatusBox status={activity_details?.status} />
          </div>

          <ExportButton 
            module='activity_details'
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
              value={activity_details?.consumer_name}
            />

            <ViewData 
              label='Email Address'
              value={activity_details?.email_address}
            />

            <ViewData 
              label='API Name'
              value={activity_details?.api_name}
            />

            <ViewData 
              label='Status'
              value={
                <div className='w-fit flex items-center gap-[4px]'>
                  <StatusBox status={activity_details?.status} />
                </div>
              }
            />

            <ViewData 
              label='Endpoint URL'
              value={activity_details?.endpoint_url}
            />

            <ViewData 
              label='Timestamp'
              value={timestampFormatter(activity_details?.timestamp)}
            />

            <ViewData 
              label='Status Code'
              value={activity_details?.status_code}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default ActivityDetails