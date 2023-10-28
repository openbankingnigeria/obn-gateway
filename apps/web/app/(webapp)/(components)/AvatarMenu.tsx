'use client'

import Link from 'next/link'
import React from 'react'
import { Loader } from '../../../components/globalComponents'
import { AvartarMenuProps } from '@/types/webappTypes/componentsTypes'

const AvatarMenu = ({
  loadingLogout,
  handleLogout
}: AvartarMenuProps) => {
  return (
    <div className='border border-o-border hidden group-hover:flex group-active:flex absolute top-[38px] right-0 profile-menu-boxshadow py-[4px] px-[6px] w-[184px] flex-col bg-white rounded-[8px]'>
      <Link 
        href='/app/profile'
        className='border-b border-o-border flex items-center gap-[12px] p-[8px] w-full rounded-[4px] bg-white text-o-text-medium2 text-f14 hover:bg-o-bg'
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M10 12.5C7.35831 12.5 5.00904 13.7755 3.51337 15.755C3.19146 16.181 3.0305 16.394 3.03577 16.6819C3.03984 16.9043 3.17951 17.1849 3.35451 17.3222C3.58103 17.5 3.89493 17.5 4.52273 17.5H15.4773C16.1051 17.5 16.4191 17.5 16.6456 17.3222C16.8206 17.1849 16.9602 16.9043 16.9643 16.6819C16.9696 16.394 16.8086 16.181 16.4867 15.755C14.991 13.7755 12.6418 12.5 10 12.5Z" 
            stroke="#666D80" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill='transparent'
          />
          <path 
            d="M10 10C12.0711 10 13.75 8.32107 13.75 6.25C13.75 4.17893 12.0711 2.5 10 2.5C7.92897 2.5 6.25004 4.17893 6.25004 6.25C6.25004 8.32107 7.92897 10 10 10Z" 
            stroke="#666D80" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill='transparent'
          />
        </svg>

        <div>
          Profile
        </div>
      </Link>

      <div 
        onClick={handleLogout}
        className='flex items-center gap-[12px] p-[8px] w-full rounded-[4px] bg-white text-o-text-medium2 text-f14 hover:bg-o-bg'
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5M7.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H7.5" 
            stroke="#666D80" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill='transparent'
          />
        </svg>

        <div>
          {
            loadingLogout ? <Loader /> : 
              'Log out'
          }
        </div>
      </div>
    </div>
  )
}

export default AvatarMenu