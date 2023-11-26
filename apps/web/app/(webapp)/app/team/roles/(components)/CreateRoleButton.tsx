'use client'

import { AppCenterModal, AppRightModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { Button } from '@/components/globalComponents'
import React, { useState } from 'react'
import CreateRolePage from './CreateRolePage';
import { toast } from 'react-toastify';
import { CreateRoleButtonProps } from '@/types/webappTypes/appTypes';

const CreateRoleButton = ({
  permissions_list
}: CreateRoleButtonProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setOpen2FA(true);
  };

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal(false);
  };

  const handle2FA = () => {
    close2FAModal();
    toast.success('[role_name] has been created successfully.')
  };

  return (
    <>
      {
        openModal && 
          <AppRightModal
            title='Create Role'
            effect={() => setOpenModal(false)}
            childrenStyle='!px-0'
          >
            <CreateRolePage 
              close={() => setOpenModal(false)}
              data={permissions_list}
              next={handleCreate}
            />
          </AppRightModal>
      }

      {
        open2FA &&
          <AppCenterModal
            title={'Two-Factor Authentication'}
            effect={close2FAModal}
          >
            <TwoFactorAuthModal
              close={close2FAModal}
              loading={loading}
              next={handle2FA}
            />
          </AppCenterModal>
      }

      <div className='w-fit'>
        <Button 
          title='Create Role'
          small
          effect={() => setOpenModal(true)}
          leftIcon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.99996 4.16602V15.8327M4.16663 9.99935H15.8333" stroke="#9FF5B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill='transparent'/>
          </svg>
          }
        />
      </div>
    </>
  )
}

export default CreateRoleButton