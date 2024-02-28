'use client'

import { Button } from '@/components/globalComponents'
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useEffect, useState } from 'react';
import * as API from '@/config/endpoints';
import { AppCenterModal, AppRightModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { AddAPIPermissions } from '.';
import { getJsCookies } from '@/config/jsCookie';

const AddPermissionButton = ({ 
  searchQuery,
  companyId 
}: {
  searchQuery: string,
  companyId: string
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [apiIds, setApiIds] = useState<string[]>([]);
  const environment = getJsCookies('environment');
  const [refresh, setRefresh] = useState(false);

  const fetchConsumerAPIs = async () => {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyAPIs({
        page: '1',
        limit: '1000',
        environment: environment || 'development',
        companyId: companyId,
      }),
      method: 'GET',
      data: null,
      noToast: true
    });
    const sanitizedAPIs = result?.data ? result?.data?.map((api: any) => {
        return api?.id;
      }) : [];
    setApiIds([...sanitizedAPIs]);
  }

  const fetchAPICollections = async () => {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCollections(),
      method: 'GET',
      data: null,
      noToast: true
    });
    setCollections(result?.data);
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
    fetchAPICollections();
  }, []);

  useEffect(() => {
    fetchConsumerAPIs();
  }, [refresh])

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal(false);
  };

  const refreshData = () => {
    setApiIds([]);
  }

  const handleAddPermission = async (code: string, e?: FormEvent<HTMLFormElement>) => {
    e && e.preventDefault();

    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      
      // let sanitizedApiIds = apiIds?.map((item: any) => item.id);

      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: API.updateConsumerAPIAccess({
          environment: environment || 'development',
          id: companyId
        }),
        method: 'PUT',
        data: { apiIds: apiIds }
      });

      setLoading(false);
      if (result?.status == 200) {
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
            childrenStyle='!px-0 !py-0 !pt-[20px]'
          >
            <AddAPIPermissions 
              close={() => setOpenModal(false)}
              data={collections}
              next={handleAddPermission}
              searchQuery={searchQuery}
              setRefresh={setRefresh}
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
              next={(value: string) => handleAddPermission(value, undefined)}
            />
          </AppCenterModal>
      }

      <div className='w-full flex justify-center mb-14 items-center'>
        <Button 
          title='Add collections'
          small
          effect={() => {
            setOpenModal(true);
            setRefresh(prev => !prev);
          }}
          containerStyle='w-fit'
        />
      </div>
    </>
  )
}

export default AddPermissionButton