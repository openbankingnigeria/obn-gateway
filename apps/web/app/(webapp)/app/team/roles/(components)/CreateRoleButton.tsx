'use client'

import { AppCenterModal, AppRightModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { Button } from '@/components/globalComponents'
import React, { FormEvent, useEffect, useState } from 'react'
import CreateRolePage from './CreateRolePage';
import { CreateRoleButtonProps, PermissionValue } from '@/types/webappTypes/appTypes';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { useRouter } from 'next/navigation';
import * as API from '@/config/endpoints';

const CreateRoleButton = ({
  permissions_list
}: CreateRoleButtonProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [role_name, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<PermissionValue[]>([]);
  const router = useRouter();

  console.log(permissions_list);

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
    setDescription('');
    setPermissions([]);
    setRoleName('');
  }

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal(false);
  };

  const handleCreate = async (code: string, e?: FormEvent<HTMLFormElement>) => {
    e && e.preventDefault();

    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      // @ts-ignore
      let sanitizedPermissions = permissions?.flatMap(item => item.options.map(option => option.id));

      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: API.postRole(),
        method: 'POST',
        data: {
          name: role_name, 
          description,
          permissions: sanitizedPermissions,
          status: "active",
        }
      });

      setLoading(false);
      if (result?.status == 201) {
        close2FAModal();
        refreshData();
        router.refresh();
      } 
    }
  }

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
              loading={loading}
              role_name={role_name}
              description={description}
              permissions={permissions}
              setRoleName={setRoleName}
              setDescription={setDescription}
              setPermissions={setPermissions}
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
              next={(value: string) => handleCreate(value, undefined)}
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