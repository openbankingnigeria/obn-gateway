'use client'

import { AppRightModal } from '@/app/(webapp)/(components)';
import { Button } from '@/components/globalComponents'
import React, { useState } from 'react'
import InviteMemberPage from './InviteMemberPage';
import { InviteMembersButtonProps } from '@/types/webappTypes/appTypes';

const InviteMembersButton = ({
  roles
}: InviteMembersButtonProps) => {
  const [openModal, setOpenModal] = useState(false);

  const handleInvite = () => {
    setOpenModal(true);
  };

  return (
    <>
      {
        openModal && 
          <AppRightModal
            title='Invite Member'
            effect={() => setOpenModal(false)}
            childrenStyle='!px-0'
          >
            <InviteMemberPage 
              roles={roles} 
              close={() => setOpenModal(false)}
            />
          </AppRightModal>
      }

      <div className='w-fit'>
        <Button 
          title='Invite member'
          small
          effect={handleInvite}
          leftIcon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.99996 4.16602V15.8327M4.16663 9.99935H15.8333" stroke="#9FF5B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill='transparent'/>
          </svg>
          }
        />
      </div>
    </>
  )
}

export default InviteMembersButton