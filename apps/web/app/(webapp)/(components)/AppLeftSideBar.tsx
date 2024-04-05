'use client'

import { LEFT_SIDE_BAR_BOTTOM_DATA, LEFT_SIDE_BAR_TOP_DATA } from '@/data/leftSideBarData'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import * as API from '@/config/endpoints';
import { setJsCookies } from '@/config/jsCookie'
import { findPermissionSlug } from '@/utils/findPermissionSlug'
import { truncateString } from '@/utils/truncateString'

const AppLeftSideBar = ({ bannerExist }: { bannerExist: boolean }) => {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>();
  let userPermissions = profile?.user?.role?.permissions

  async function fetchProfile() {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getProfile(),
      method: 'GET',
      data: null,
      noToast: true
    });

    setProfile(result?.data);
    // setJsCookies('aperta-user-profile', JSON.stringify({
    //   name: `${result?.data?.firstName} ${result?.data?.lastName}`,
    //   companyRole: result?.data?.companyRole?.toLowerCase()?.replace(/_/g, ' '),
    //   userType: result?.data?.user?.role?.parent?.slug
    // }))
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const isActive = (path: string): boolean => {
    return pathname?.includes(path);
  }

  let firstName = profile?.firstName;
  let lastName = profile?.lastName;
  let avatarAlt = `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`

  return (
    <aside className={`fixed w-[280px] z-[100] left-0 bottom-0 ${bannerExist ? 'h-[calc(100vh-56px)]' : 'h-screen'} border-r border-o-border bg-white flex flex-col gap-[24px] py-[24px]`}>
      <div className='w-full px-[16px]'>
        <div className='w-full p-[12px] flex flex-row gap-[8px] items-center rounded-[8px] bg-[#182749]'>
          {/* API CONSUMER */}
          <div className='min-w-[32px] h-[32px] text-[#459572] rounded-full bg-[#EDF8EF] flex items-center justify-center text-f14 font-[500]'>
            {avatarAlt}
          </div>

          <div className='flex flex-col w-full gap-[2px]'>
            <h3 className='capitalize truncate w-full text-white text-f14 font-[500]'>
              {firstName ? truncateString(`${firstName} ${lastName}`, 22) : ''}
            </h3>

            <div className='w-full capitalize text-o-alt-white text-f12'>
              {profile?.companyRole?.toLowerCase()?.replace(/_/g, ' ')}
            </div>
          </div>

          {/* <svg 
            width="18" 
            height="18" 
            viewBox="0 0 18 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M4.5 6.75L9 11.25L13.5 6.75" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill='transparent'
            />
          </svg> */}
        </div>
      </div>

      <div className='w-full h-full overflow-y-auto flex flex-col gap-[40px]'>
        <div className='w-full h-fit flex flex-col gap-[20px]'>
          {
            LEFT_SIDE_BAR_TOP_DATA?.map((data: any) => (
              findPermissionSlug(userPermissions, data?.permit) &&
              <div
                key={data?.id}
                className='w-full flex flex-col gap-[4px]'
              >
                <h3 className='px-[28px] text-o-text-muted2 text-[12px] font-[600] uppercase'>
                  {data?.label}  
                </h3>

                <div className='w-full flex flex-col gap-[4px]'>
                  {
                    data?.links?.map((link: any) => (
                      findPermissionSlug(userPermissions, link?.permit) &&
                      (
                        link?.access == profile?.user?.role?.parent?.slug ||
                        link?.access == 'all'
                      ) &&
                      <div
                        key={link?.id}
                        className='w-full relative h-fit px-[16px]'
                      >
                        {
                          isActive(link?.path) &&
                          <motion.div
                            className='aside-pane-underline'
                            layoutId='aside-pane-underline'
                          ></motion.div>
                        }
                      
                        <Link
                          href={link?.path}
                          className={`${isActive(link?.path) ? 'navlink-left-active bg-[#F3F6FB]' : 'navlink-left bg-white hover:bg-[#F3F6FB]'} cursor-pointer px-[12px] py-[8px] flex items-center gap-[12px] rounded-[6px]`}
                        >
                          {link?.icon}

                          <div className={`${isActive(link?.path) ? 'text-o-blue' : 'text-o-text-medium3'} text-f14 font-[600]`}>
                            {link?.title}
                          </div>
                        </Link>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))
          }
        </div>

        <div className='w-full mt-auto px-[16px] flex flex-col'>
          <div className='w-full flex flex-col pt-[24px] border-t border-o-border'>
            {
              LEFT_SIDE_BAR_BOTTOM_DATA?.map((link) => (
                findPermissionSlug(userPermissions, link?.permit) &&
                <div
                  key={link?.id}
                  className='w-full relative h-fit'
                >
                  {
                    isActive(link?.path) &&
                    <motion.div
                      className='aside-pane-underline'
                      layoutId='aside-pane-underline'
                    ></motion.div>
                  }
                
                  <Link
                    href={link?.path}
                    className={`${isActive(link?.path) ? 'navlink-left-active bg-[#F3F6FB]' : 'navlink-left bg-white hover:bg-[#F3F6FB]'} cursor-pointer px-[12px] py-[8px] flex items-center gap-[12px] rounded-[6px]`}
                  >
                    {link?.icon}

                    <div className={`${isActive(link?.path) ? 'text-o-blue' : 'text-o-text-medium3'} text-f14 font-[600]`}>
                      {link?.title}
                    </div>
                  </Link>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </aside>
  )
}

export default AppLeftSideBar