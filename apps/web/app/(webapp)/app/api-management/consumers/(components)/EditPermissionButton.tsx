'use client'

import { Button } from '@/components/globalComponents'
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import React, { FormEvent, useEffect, useState } from 'react'
import * as API from '@/config/endpoints';
import { AppCenterModal, AppRightModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { useRouter } from 'next/navigation';
import { EditAPIPermissionProps, PermissionValue } from '@/types/webappTypes/appTypes';
import { AddAPIPermissions } from '.';

const EditPermissionButton = ({
  rawData,
  searchQuery
}: EditAPIPermissionProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const [apiList, setApiList] = useState([]);
  const [apiIds, setApiIds] = useState<PermissionValue[]>([]);
  const environment = 'development';

  const fetchAPIs = async () => {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPIs({
        page: `1`,
        limit: `1000`,
        environment
      }),
      method: 'GET',
      data: null,
      noToast: true
    });
    setApiList(result?.data);
  }

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
    fetchAPIs();
  }, []);

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal(false);
  };

  const refreshData = () => {
    setApiIds([]);
  }

  const handleEdit = async (code: string, e?: FormEvent<HTMLFormElement>) => {
    e && e.preventDefault();

    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      
      let sanitizedApiIds = apiIds?.map((item: any) => item.id);

      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: API.postAssignAPIs({
          environment,
          id: rawData?.id
        }),
        method: 'POST',
        data: { apiIds: sanitizedApiIds }
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
            title='Confirm Action'
            effect={() => setOpenModal(false)}
            childrenStyle='!px-0'
          >
            <AddAPIPermissions 
              close={() => setOpenModal(false)}
              data={apiList}
              next={handleEdit}
              searchQuery={searchQuery}
              loading={loading}
              api_ids={apiIds}
              setApiIds={setApiIds}
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
              next={(value: string) => handleEdit(value, undefined)}
            />
          </AppCenterModal>
      }

      <div className='w-fit'>
        <Button 
          title='Edit permissions'
          small
          effect={() => setOpenModal(true)}
        />
      </div>
    </>
  )
}

export default EditPermissionButton