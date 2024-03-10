'use client'

import { AppCenterModal, EmptyState, TableElement, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { MEMBERS_ACTIONS_DATA } from '@/data/membersData'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as API from '@/config/endpoints';
import { ActivateDeactivateMember } from '.'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { Loader } from '@/components/globalComponents'
import { findPermissionSlug } from '@/utils/findPermissionSlug'

const MembersTable = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages,
  path
}: TableProps) => {
  const columnHelper = createColumnHelper<any>();
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const [openModal, setOpenModal] = useState('');
  const [id, setId] = useState('');
  const [member, setMember] = useState<any>(null);
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingReinvitation, setLoadingReinvitation] = useState(false);
  const actions = MEMBERS_ACTIONS_DATA;
  let userPermissions = profile?.user?.role?.permissions


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

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal('');
  }

  const handleReInvite: any = async (id: string, code: string) => {
    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoadingReinvitation(true);
      setLoading(true);
      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: API.postReinviteMember({ id: id || member?.id }),
        method: 'POST',
        data: null
      });

      if (result?.status == 201) {
        setLoadingReinvitation(false);
        setLoading(false);
        close2FAModal();
        router.refresh();
      } else {
        setLoadingReinvitation(false);
        setLoading(false);
      }
    } 
  };

  const getAction = (status: string) => {
    return actions.filter(action => {
      if(status == 'invited') { 
        return action?.type == status?.toLowerCase()
      } else {
        return (
          findPermissionSlug(userPermissions, action?.permit) &&
          (
            action?.type == status?.toLowerCase() ||
            action?.type == 'all'
          )
        );
      }
    });
  }

  const closeModal = () => {
    setOpenModal('');
  }

  const handleActivateDeactivateMember = async () => {
    setLoading(true);
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.updateTeam({ id: member?.id }),
      method: 'PATCH',
      data: {
        email: member?.email,
        firstName: member?.profile?.firstName,
        lastName: member?.profile?.lastName,
        roleId: member?.roleId,
        status: openModal == 'deactivate' ? 'inactive' : 'active'
      }
    });

    if (result?.message) {
      setOpenModal('');
      setLoading(false);
      router.refresh();
      // setOpen2FA(true);
    }
  }

  const handle2FA = () => {
    close2FAModal();
    toast.success(
      openModal == 'deactivate' ?
        '[member_name] has been deactivated and access revoked.' :
        openModal == 'activate' ?
          '[member_name] has been activated and access restored.' :
          null
    )
  };

  const actionColumn = columnHelper.accessor('actions', {
    header: () => '',
    cell: ({ row }) => (
      path == 'pending' ?
        <button 
          id={row.original.id} 
          onClick={() => {
            handleReInvite(row.original.id, '');
            setMember(rawData?.find(data => data?.id == row.original.id));
          }}
          className='text-f14 whitespace-nowrap !text-[#5277C7] cursor-pointer capitalize'
        >
          { loadingReinvitation ? <Loader /> : 'Reinvite' }
        </button>
        :
        <div id={row.original.id} className='relative block'>
          <button className='peer' id={row.original.id} onClick={(e) => e.stopPropagation()}>
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5001 10.8335C10.9603 10.8335 11.3334 10.4604 11.3334 10.0002C11.3334 9.53993 10.9603 9.16683 10.5001 9.16683C10.0398 9.16683 9.66675 9.53993 9.66675 10.0002C9.66675 10.4604 10.0398 10.8335 10.5001 10.8335Z" fill='transparent' stroke="#666D80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5001 5.00016C10.9603 5.00016 11.3334 4.62707 11.3334 4.16683C11.3334 3.70659 10.9603 3.3335 10.5001 3.3335C10.0398 3.3335 9.66675 3.70659 9.66675 4.16683C9.66675 4.62707 10.0398 5.00016 10.5001 5.00016Z" fill='transparent' stroke="#666D80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5001 16.6668C10.9603 16.6668 11.3334 16.2937 11.3334 15.8335C11.3334 15.3733 10.9603 15.0002 10.5001 15.0002C10.0398 15.0002 9.66675 15.3733 9.66675 15.8335C9.66675 16.2937 10.0398 16.6668 10.5001 16.6668Z" fill='transparent' stroke="#666D80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className='hidden peer-focus:flex hover:flex absolute bg-white rounded-lg flex-col z-10 border border-o-border right-0 top-[30px] py-[4px] w-[158px] items-start justify-start tablemenu-boxshadow'>
            {
              getAction(row.original.status)?.map((action) => (
                <button
                  key={action.id}
                  className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                  onClick={() => {
                    if (action?.name == 'reinvite' ) {
                      handleReInvite(row.original.id, '');
                      setMember(rawData?.find(data => data?.id == row.original.id));
                    } else {
                      setId(row.original.id);
                      setMember(rawData?.find(data => data?.id == row.original.id));
                      action.name == 'view' ?
                        router.push(`/app/team/members/${row.original.id}`) :
                        setOpenModal(action.name);
                    }
                  }}
                >
                  {action.icon}
                  
                  <span className='whitespace-nowrap'>
                    {action.label}
                  </span>
                </button>
              ))
            }
          </div>
        </div>
    )
  });

  return (
    <>
      {
        (openModal == 'activate' || openModal == 'deactivate') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <ActivateDeactivateMember 
              close={closeModal}
              type={openModal}
              loading={loading}
              next={handleActivateDeactivateMember}
            />
          </AppCenterModal>
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
              next={(value: string) => handleReInvite('', value)}
            />
          </AppCenterModal>
      }

      {
        (rawData && rawData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={rawData}
            actionColumn={actionColumn}
            filters={filters}
            totalElementsInPage={totalElementsInPage}
            rows={rows}
            page={page}
            totalElements={totalElements}
            totalPages={totalPages}
          />
          :
          <EmptyState 
            title='Nothing to show'
            type='DEFAULT'
            parentStyle='h-[calc(100vh-288px)]'
            body='There’s no information to show yet. Members invited will appear here.'
          />
      }
    </>
  )
}

export default MembersTable