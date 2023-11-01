import React from 'react'
import { greetByTime } from '@/utils/greetByTime'
import { SearchParamsProps } from '@/types/webappTypes/appTypes'
import { DashboardMetricCard } from './(components)'
import { API_CALLS_DATA, API_CONSUMERS_TABLE_DATA } from '@/data/dashboardData'
import { DatePicker } from '@/app/(webapp)/(components)'

const DashboardPage = ({ searchParams }: SearchParamsProps) => {
  const dateFilter = searchParams?.date_filter;

  return (
    <section className='flex flex-col gap-[24px] w-full'>
      <h2 className='text-o-text-dark capitalize text-f24 font-[500]'>
        {`${greetByTime()}, John Ajayi!`}
      </h2>

      <DatePicker 
        showShortcuts={true}
      />

      <section className='w-full flex-col flex gap-[12px]'>
        <h3 className='text-o-text-dark flex items-center gap-[8px] text-f18 font-[500]'>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.333333" y="0.333333" width="31.3333" height="31.3333" rx="3.66667" fill="#F6F8FA" stroke="#F1F2F4" strokeWidth="0.666667"/>
            <g clipPath="url(#clip0_479_91995)">
              <path 
                d="M12.0002 11.9999H12.0068M12.0002 19.9999H12.0068M11.4668 14.6666H20.5335C21.2802 14.6666 21.6536 14.6666 21.9388 14.5213C22.1897 14.3934 22.3937 14.1895 22.5215 13.9386C22.6668 13.6534 22.6668 13.28 22.6668 12.5333V11.4666C22.6668 10.7198 22.6668 10.3465 22.5215 10.0613C22.3937 9.81038 22.1897 9.60641 21.9388 9.47858C21.6536 9.33325 21.2802 9.33325 20.5335 9.33325H11.4668C10.7201 9.33325 10.3467 9.33325 10.0615 9.47858C9.81063 9.60641 9.60665 9.81038 9.47882 10.0613C9.3335 10.3465 9.3335 10.7198 9.3335 11.4666V12.5333C9.3335 13.28 9.3335 13.6534 9.47882 13.9386C9.60665 14.1895 9.81063 14.3934 10.0615 14.5213C10.3467 14.6666 10.7201 14.6666 11.4668 14.6666ZM11.4668 22.6666H20.5335C21.2802 22.6666 21.6536 22.6666 21.9388 22.5213C22.1897 22.3934 22.3937 22.1895 22.5215 21.9386C22.6668 21.6534 22.6668 21.28 22.6668 20.5333V19.4666C22.6668 18.7198 22.6668 18.3465 22.5215 18.0613C22.3937 17.8104 22.1897 17.6064 21.9388 17.4786C21.6536 17.3333 21.2802 17.3333 20.5335 17.3333H11.4668C10.7201 17.3333 10.3467 17.3333 10.0615 17.4786C9.81063 17.6064 9.60665 17.8104 9.47882 18.0613C9.3335 18.3465 9.3335 18.7198 9.3335 19.4666V20.5333C9.3335 21.28 9.3335 21.6534 9.47882 21.9386C9.60665 22.1895 9.81063 22.3934 10.0615 22.5213C10.3467 22.6666 10.7201 22.6666 11.4668 22.6666Z" 
                stroke="#666D80" 
                strokeWidth="1.33333" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill='transparent'
              />
            </g>
            <defs>
              <clipPath id="clip0_479_91995">
                <rect x="8" y="8" width="16" height="16" rx="4" fill="white"/>
              </clipPath>
            </defs>
          </svg>

          API Consumers
        </h3>

        <div className='w-full flex flex-wrap gap-[20px]'>
          {
            API_CONSUMERS_TABLE_DATA?.map(data => (
              <DashboardMetricCard 
                key={data?.id}
                title={data?.title}
                amount={data?.amount}
                amountUnit={data?.amountUnit}
                isGreen={data?.isGreen}
                labels={data?.labels}
                data={data?.data}
              />
            ))
          }
        </div>
      </section>

      <section className='w-full flex-col flex gap-[12px]'>
        <h3 className='text-o-text-dark flex items-center gap-[8px] text-f18 font-[500]'>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.333333" y="0.333333" width="31.3333" height="31.3333" rx="3.66667" fill="#F6F8FA" stroke="#F1F2F4" strokeWidth="0.666667"/>
            <g clipPath="url(#clip0_479_91995)">
              <path 
                d="M12.0002 11.9999H12.0068M12.0002 19.9999H12.0068M11.4668 14.6666H20.5335C21.2802 14.6666 21.6536 14.6666 21.9388 14.5213C22.1897 14.3934 22.3937 14.1895 22.5215 13.9386C22.6668 13.6534 22.6668 13.28 22.6668 12.5333V11.4666C22.6668 10.7198 22.6668 10.3465 22.5215 10.0613C22.3937 9.81038 22.1897 9.60641 21.9388 9.47858C21.6536 9.33325 21.2802 9.33325 20.5335 9.33325H11.4668C10.7201 9.33325 10.3467 9.33325 10.0615 9.47858C9.81063 9.60641 9.60665 9.81038 9.47882 10.0613C9.3335 10.3465 9.3335 10.7198 9.3335 11.4666V12.5333C9.3335 13.28 9.3335 13.6534 9.47882 13.9386C9.60665 14.1895 9.81063 14.3934 10.0615 14.5213C10.3467 14.6666 10.7201 14.6666 11.4668 14.6666ZM11.4668 22.6666H20.5335C21.2802 22.6666 21.6536 22.6666 21.9388 22.5213C22.1897 22.3934 22.3937 22.1895 22.5215 21.9386C22.6668 21.6534 22.6668 21.28 22.6668 20.5333V19.4666C22.6668 18.7198 22.6668 18.3465 22.5215 18.0613C22.3937 17.8104 22.1897 17.6064 21.9388 17.4786C21.6536 17.3333 21.2802 17.3333 20.5335 17.3333H11.4668C10.7201 17.3333 10.3467 17.3333 10.0615 17.4786C9.81063 17.6064 9.60665 17.8104 9.47882 18.0613C9.3335 18.3465 9.3335 18.7198 9.3335 19.4666V20.5333C9.3335 21.28 9.3335 21.6534 9.47882 21.9386C9.60665 22.1895 9.81063 22.3934 10.0615 22.5213C10.3467 22.6666 10.7201 22.6666 11.4668 22.6666Z" 
                stroke="#666D80" 
                strokeWidth="1.33333" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill='transparent'
              />
            </g>
            <defs>
              <clipPath id="clip0_479_91995">
                <rect x="8" y="8" width="16" height="16" rx="4" fill="white"/>
              </clipPath>
            </defs>
          </svg>

          API Calls
        </h3>

        <div className='w-full flex flex-wrap gap-[20px]'>
          {
            API_CALLS_DATA?.map(data => (
              <DashboardMetricCard 
                key={data?.id}
                title={data?.title}
                amount={data?.amount}
                amountUnit={data?.amountUnit}
                isGreen={data?.isGreen}
                labels={data?.labels}
                data={data?.data}
                containerStyle='min-w-[320px]'
              />
            ))
          }
        </div>
      </section>
    </section>
  )
}

export default DashboardPage