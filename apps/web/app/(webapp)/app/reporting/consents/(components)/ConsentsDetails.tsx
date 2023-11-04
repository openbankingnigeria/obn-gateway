'use client'

import { StatusBox, ViewData } from '@/app/(webapp)/(components)';
import { updateSearchParams } from '@/utils/searchParams'
import { timestampFormatter } from '@/utils/timestampFormatter';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ConsentsDetails = ( ) => {

  const router = useRouter();
  const consumerStatus = 'approved';

  useEffect(() => {
    const slug = updateSearchParams('slug', '#128902983GH');
    router.push(slug);
  }, [router]);

  return (
    <>
      <section className='flex flex-col gap-[20px] w-full'>
        <header className='w-full flex items-start justify-between gap-5'>
          <div className='w-full flex flex-col gap-[4px]'>
            <h2 className='w-full text-f18 text-o-text-dark font-[500]'>
              #128902983GH
            </h2>

            <StatusBox status={consumerStatus} />
          </div>
        </header>

        <div className='w-full overflow-hidden bg-white border border-o-border rounded-[10px] h-fit'>
          <h3 className='px-[20px] py-[16px] w-full border-b border-o-border bg-o-bg2'>
            <div className='text-f16 font-[600] text-o-text-dark'>
              Details
            </div>
          </h3>

          <div className='w-full p-[20px] grid grid-cols-2 ms:grid-cols-3 lgg:grid-cols-4 gap-[16px] bg-white'>
            <ViewData 
              label='Consent ID'
              value='#128902983GH'
            />

            <ViewData 
              label='Consumer Name'
              value='Dare Bashir'
            />

            <ViewData 
              label='Customer Name'
              value='Lendsqr'
            />

            <ViewData 
              label='Customer Email Address'
              value='john.ajayi@lendsqr.com'
            />

            <ViewData 
              label='Status'
              value={
                <div className='w-fit flex items-center gap-[4px]'>
                  <StatusBox status={consumerStatus} />
                </div>
              }
            />

            <ViewData 
              label='Date Sent'
              value={`${timestampFormatter('2023-09-25T08:15:00')}`}
            />

            <ViewData 
              label='Velocity'
              value='20s'
            />

            <ViewData 
              label='Amount'
              value='10'
            />

            <ViewData 
              label='Valid From'
              value={`${moment('2023-09-25').format('ll')}`}
            />
            <ViewData 
              label='Valid Until'
              value={`${moment('2023-09-25').format('ll')}`}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default ConsentsDetails