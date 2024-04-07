import Logout from '@/components/globalComponents/Logout';
import { searchParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import * as API from '@/config/endpoints';
import { applyAxiosRequest } from '@/hooks';
import { DashboardBanner, DashboardMetricCard } from '.';
import { greetByTime } from '@/utils/greetByTime';
import { API_COLLECTIONS_STATS, USERS_STATS } from '@/data/dashboardData';
import { ReportingSection, ToastMessage } from '@/app/(webapp)/(components)';
import { StatDataProps } from '@/types/dataTypes';
import { getCookies } from '@/config/cookies';
import { findPermissionSlug } from '@/utils/findPermissionSlug';
import { RefreshStoredToken } from '@/components/globalComponents';

const APIConsumerDashboardPage = async ({ alt_data, profile_data }: searchParamsProps) => {
  const environment = getCookies('environment');
  let userPermissions = profile_data?.user?.role?.permissions;

  const canToggleMode = ((
    alt_data?.isVerified && 
    profile_data?.user?.role?.parent?.slug === 'api-consumer'
  ) 
  || profile_data?.user?.role?.parent?.slug === 'api-provider');

  const fetchedAPIs: any = canToggleMode && await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPIsForCompany({
      environment: environment || 'development'
    }),
    method: 'GET',
    data: null
  });

  const fetchedCollections: any = canToggleMode && await applyAxiosRequest({
    headers: {},
    apiEndpoint: API?.getCompanyCollections({
      page: '1',
      limit: '20',
      environment: environment || 'development'
    }),
    method: 'GET',
    data: null
  })

  const fetchedTeamStat: any = canToggleMode && await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getTeamStats(),
    method: 'GET',
    data: null
  })

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedTeamStat?.status == 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: { },
      apiEndpoint: API?.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${getCookies('aperta-user-refreshToken')}`
      }
    });

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  let collectionMeta = fetchedCollections?.meta_data;
  let  apisMeta = fetchedAPIs?.meta_data;
  let team = fetchedTeamStat?.data

  // console.log(collectionMeta,apisMeta );

  return (
    <section className='flex flex-col gap-[24px] w-full'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      {
        /* SSR TOAST ERROR */
        (fetchedAPIs?.status != 200 && fetchedAPIs?.status != 201) && 
        <ToastMessage 
          message={fetchedAPIs?.message} 
        />
      }
      {
        /* SSR TOAST ERROR */
        (fetchedCollections?.status != 200 && fetchedCollections?.status != 201) && 
        <ToastMessage 
          message={fetchedCollections?.message} 
        />
      }
      {
        /* SSR TOAST ERROR */
        (fetchedTeamStat?.status != 200 && fetchedTeamStat?.status != 201) && 
        <ToastMessage 
          message={fetchedTeamStat?.message} 
        />
      }

      <h2 className='text-o-text-dark capitalize text-f24 font-[500]'>
        {`${greetByTime()}, ${((profile_data?.firstName || '') + ' ' + (profile_data?.lastName || '')).trim()}!`}
      </h2>

      <section className='w-full flex'>
        <DashboardBanner 
          rawData={alt_data}
        />
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

          API Collections
        </h3>

        <div className='w-full flex flex-wrap gap-[20px]'>
          {
            API_COLLECTIONS_STATS({
              collections: { value: 'collections', count: collectionMeta?.totalNumberOfRecords },
              apis: { value: 'apis', count: apisMeta?.totalNumberOfRecords }
            })?.map(data => (
              <DashboardMetricCard 
                key={data?.id}
                title={data?.title}
                titleStyle='!normal-case'
                amount={data?.amount}
                containerStyle='!h-fit'
              />
            ))
          }
        </div>
      </section>

      <section className='w-full flex-col flex gap-[12px]'>
        <h3 className='text-o-text-dark flex items-center gap-[8px] text-f18 font-[500]'>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.333333" y="0.333333" width="31.3333" height="31.3333" rx="3.66667" fill="#F6F8FA" stroke="#F1F2F4" strokeWidth="0.666667"/>
            <path 
              d="M20 18.5579C20.9706 19.0455 21.8028 19.828 22.4102 20.8064C22.5305 21.0002 22.5906 21.0971 22.6114 21.2312C22.6537 21.5038 22.4672 21.839 22.2133 21.9469C22.0884 22 21.9478 22 21.6667 22M18.6667 15.6882C19.6545 15.1973 20.3333 14.1779 20.3333 13C20.3333 11.8221 19.6545 10.8027 18.6667 10.3118M17.3333 13C17.3333 14.6569 15.9902 16 14.3333 16C12.6765 16 11.3333 14.6569 11.3333 13C11.3333 11.3431 12.6765 10 14.3333 10C15.9902 10 17.3333 11.3431 17.3333 13ZM9.70617 20.6256C10.769 19.0297 12.4463 18 14.3333 18C16.2204 18 17.8977 19.0297 18.9605 20.6256C19.1934 20.9752 19.3098 21.15 19.2964 21.3733C19.286 21.5471 19.172 21.76 19.0331 21.8651C18.8546 22 18.6092 22 18.1184 22H10.5483C10.0575 22 9.81207 22 9.63364 21.8651C9.49471 21.76 9.38074 21.5471 9.3703 21.3733C9.3569 21.15 9.47332 20.9752 9.70617 20.6256Z" 
              stroke="#666D80" 
              strokeWidth="1.33333" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill='transparent'
            />
          </svg>

          Users
        </h3>

        <div className='w-full flex flex-wrap gap-[20px]'>
          {
            team?.map((data: StatDataProps) => (
              <DashboardMetricCard 
                key={data?.value}
                title={data?.value}
                amount={data?.count}
                containerStyle='!h-fit'
              />
            ))
          }
        </div>
      </section>

      {
        findPermissionSlug(userPermissions, 'list-reports') &&
        <section className='w-full flex-col flex gap-[12px]'>
          <h3 className='text-o-text-dark flex items-center gap-[8px] text-f18 font-[500]'>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.333333" y="0.333333" width="31.3333" height="31.3333" rx="3.66667" fill="#F6F8FA" stroke="#F1F2F4" strokeWidth="0.666667"/>
              <path 
                d="M17.3333 9.51318V12.2669C17.3333 12.6402 17.3333 12.8269 17.406 12.9695C17.4699 13.095 17.5719 13.197 17.6973 13.2609C17.8399 13.3335 18.0266 13.3335 18.4 13.3335H21.1537M13.3333 18.0002V20.0002M18.6667 16.6668V20.0002M16 15.0002V20.0002M21.3333 14.659V19.4668C21.3333 20.5869 21.3333 21.147 21.1153 21.5748C20.9236 21.9511 20.6176 22.2571 20.2413 22.4488C19.8135 22.6668 19.2534 22.6668 18.1333 22.6668H13.8667C12.7466 22.6668 12.1865 22.6668 11.7587 22.4488C11.3824 22.2571 11.0764 21.9511 10.8846 21.5748C10.6667 21.147 10.6667 20.5869 10.6667 19.4668V12.5335C10.6667 11.4134 10.6667 10.8533 10.8846 10.4255C11.0764 10.0492 11.3824 9.74323 11.7587 9.55148C12.1865 9.3335 12.7466 9.3335 13.8667 9.3335H16.0078C16.497 9.3335 16.7416 9.3335 16.9718 9.38876C17.1759 9.43775 17.3709 9.51856 17.5499 9.62822C17.7517 9.7519 17.9247 9.92485 18.2706 10.2708L20.3961 12.3962C20.742 12.7421 20.9149 12.9151 21.0386 13.1169C21.1483 13.2959 21.2291 13.491 21.2781 13.695C21.3333 13.9252 21.3333 14.1698 21.3333 14.659Z" 
                stroke="#666D80" 
                strokeWidth="1.33333" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill='transparent'
              />
            </svg>

            Reporting
          </h3>

          <ReportingSection 
            profile_data={profile_data}
            alt_data={alt_data}
          />
        </section>
      }
    </section>
  )
}

export default APIConsumerDashboardPage