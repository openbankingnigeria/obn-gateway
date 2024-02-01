'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TopPanelContainerProps } from '@/types/webappTypes/componentsTypes'
import { deleteSearchParams, updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';
import * as API from '@/config/endpoints';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';

const TopPanel = ({
  name,
  panel,
  currentValue,
  containerStyle
}: TopPanelContainerProps) => {
  const router = useRouter();
  const [details, setDetails] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  async function fetchDetails() {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyDetails(),
      method: 'GET',
      data: null,
      noToast: true
    });

    setDetails(result?.data);
  }

  async function fetchprofile() {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getProfile(),
      method: 'GET',
      data: null,
      noToast: true
    });

    setProfile(result?.data);
  }

  useEffect(() => {
    fetchprofile();
    fetchDetails();
  }, []);

  let showBanner = Boolean(
    (details?.type == 'licensed-entity' || details?.type == 'business') && 
    profile?.user?.role?.parent?.slug == 'api-consumer' && 
    !details?.isVerified
  )
  
  const handleClick = (value: string) => {
    if (value) {
      const url = updateSearchParams(name, value);
      router.push(url)
    } else {
      const url = deleteSearchParams(name);
      router.push(url)
    }
  };

  return (
    <div className={`overflow-x-auto px-[32px] z-[100] pt-[16px] bg-white border-b border-o-border 
      flex items-center gap-[24px] h-[56px] w-full fixed ${showBanner ? 'top-[136px]' : 'top-[80px]'}
      left-[280px] ${containerStyle}`}
    >
      {
        panel?.map((data) => (
          <div 
            key={data?.id} 
            className='whitespace-nowrap cursor-pointer relative w-fit flex flex-col pt-[9px] pb-[11px]'
            onClick={() => handleClick(data?.value)}
          >
            <div className={`${currentValue == data?.value ? 'text-o-blue font-[500]' : 'text-o-text-medium3'} 
              capitalize text-f14 hover:text-o-blue`}
            >
              {data?.label} {data?.amount && `(${data?.amount})`}
            </div>

            {
              currentValue == data?.value &&
              <motion.div
                className='pane-underline'
                layoutId='top-pane-underline'
              ></motion.div>
            }
          </div>
        ))
      }
    </div>
  )
}

export default TopPanel