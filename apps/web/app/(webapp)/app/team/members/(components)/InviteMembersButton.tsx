'use client'

import { AppCenterModal, AppRightModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { Button } from '@/components/globalComponents'
import React, { FormEvent, useEffect, useState } from 'react'
import InviteMemberPage from './InviteMemberPage';
import { InviteMembersButtonProps } from '@/types/webappTypes/appTypes';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';
import { useRouter } from 'next/navigation';

const InviteMembersButton = ({
  roles
}: InviteMembersButtonProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  // const [open2FA, setOpen2FA] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
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
    fetchProfile();
  }, []);

  const refreshData = () => {
    setRole('');
    setEmail('');
  }

  // const close2FAModal = () => {
  //   setOpen2FA(false);
  //   setOpenModal(false);
  // };

  const handleInvite = async(/* code: string, */e?: FormEvent<HTMLFormElement>) => {
    e && e.preventDefault();

    // if (profile?.user?.twofaEnabled && !code) {
    //   setOpen2FA(true);
    // } else {
      setLoading(true);
      
      const result: any = await clientAxiosRequest({
        // headers: code ? { 'X-TwoFA-Code' : code, } : {},
        headers: {},
        apiEndpoint: API.postTeam(),
        method: 'POST',
        data: {
          email, 
          roleId: role,
        }
      });

      setLoading(false);
      if (result?.status == 201) {
        // close2FAModal();
        refreshData();
        router.refresh();
      } 
    /* } */
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
              email={email}
              role={role}
              setEmail={setEmail}
              setRole={setRole}
              next={handleInvite}
              loading={loading}
            />
          </AppRightModal>
      }

      {/* {
        open2FA &&
          <AppCenterModal
            title={'Two-Factor Authentication'}
            effect={close2FAModal}
          >
            <TwoFactorAuthModal
              close={close2FAModal}
              loading={loading}
              next={(value: string) => handleInvite(value, undefined)}
            />
          </AppCenterModal>
      } */}

      <div className='w-fit'>
        <Button 
          title='Invite member'
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

export default InviteMembersButton