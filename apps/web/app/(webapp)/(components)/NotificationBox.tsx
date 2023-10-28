'use client'

import { NotificationBoxProps } from '@/types/webappTypes/componentsTypes';
import React from 'react'
import { EmptyState, NotificationCard } from '.';

const NotificationBox = ({
  notifications,
  close
}: NotificationBoxProps) => {
  const handleMarkAllAsRead = () => {};

  return (
    <section className='flex flex-col w-[571px] h-[424px] p-[20px] gap-[24px] rounded-[12px] bg-white border border-o-border notification-boxshadow'>
      <header className='w-full flex items-end justify-between gap-5'>
        <h3 className='text-o-text-dark text-f20 font-[500]'>
          Notifications
        </h3>

        <div 
          onClick={handleMarkAllAsRead}
          className='w-fit text-o-light-blue hover:text-o-dark-blue text-f14 font-[500] cursor-pointer'
        >
          Mark all as read
        </div>
      </header>

      <section className='w-full h-full flex flex-col gap-[16px]'>
        {
          notifications && notifications?.length >= 1 ?
            notifications.map((notification) => (
              <NotificationCard 
                key={notification?.id}
                title={notification?.title}
                body={notification?.body}
                created_on={notification?.created_on}
              />
            ))
            :
            <EmptyState
              type='NOTIFICATIONS'
              title='You’re all caught up'
              body='There are no notifications to show.'
            />
        }
      </section>
    </section>
  )
}

export default NotificationBox