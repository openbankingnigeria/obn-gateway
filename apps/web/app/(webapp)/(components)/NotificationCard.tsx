import { NotificationCardProps } from '@/types/webappTypes/componentsTypes'
import { timeAgo } from '@/utils/timeAgo'
import React from 'react'

const NotificationCard = ({
  title,
  body,
  created_on
}: NotificationCardProps) => {
  return (
    <section className='w-full flex items-center gap-[12px] pb-[16px] border-b border-o-border'>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#EEF7F3"/>
        <path 
          d="M14.236 21.9999C14.7061 22.4148 15.3236 22.6666 15.9999 22.6666C16.6761 22.6666 17.2936 22.4148 17.7637 21.9999M19.9999 13.3333C19.9999 12.2724 19.5784 11.255 18.8283 10.5048C18.0781 9.75468 17.0607 9.33325 15.9999 9.33325C14.939 9.33325 13.9216 9.75468 13.1714 10.5048C12.4213 11.255 11.9998 12.2724 11.9998 13.3333C11.9998 15.3934 11.4802 16.8039 10.8996 17.7369C10.4099 18.5238 10.1651 18.9173 10.1741 19.0271C10.184 19.1486 10.2098 19.195 10.3077 19.2676C10.3962 19.3333 10.7949 19.3333 11.5924 19.3333H20.4073C21.2048 19.3333 21.6035 19.3333 21.692 19.2676C21.7899 19.195 21.8157 19.1486 21.8256 19.0271C21.8346 18.9173 21.5898 18.5238 21.1001 17.7369C20.5195 16.8039 19.9999 15.3934 19.9999 13.3333Z" 
          stroke="#459572" 
          strokeWidth="1.33333" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill='transparent'
        />
      </svg>

      <div className='flex flex-col w-full'>
        <div className='truncate w-full flex items-center gap-[8px]'>
          <h3 className='truncate text-f14 font-[500] text-[#344054]'>
            {title}
          </h3>

          <div className='whitespace-nowrap text-f12 text-o-text-medium'>
            {timeAgo(created_on)}
          </div>
        </div>

        <div className='text-f14 text-o-text-medium'>
          {body}
        </div>
      </div>
    </section>
  )
}

export default NotificationCard