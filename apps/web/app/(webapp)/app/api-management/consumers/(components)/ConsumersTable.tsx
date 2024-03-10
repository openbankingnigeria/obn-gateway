'use client'

import { AppCenterModal, AppRightModal, EmptyState, TableElement, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { CONSUMER_ACTIONS_DATA } from '@/data/consumerData'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ActivateDeactivateConsumer, ApproveConsumer, DeclineConsumer } from '.'
import { toast } from 'react-toastify'
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';
import { findPermissionSlug } from '@/utils/findPermissionSlug'

const ConsumersTable = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  searchQuery,
  totalElements,
  totalElementsInPage,
  totalPages,
  dataList,
}: TableProps) => {
  const columnHelper = createColumnHelper<any>();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [openModal, setOpenModal] = useState('');
  const [reason, setReason] = useState('');
  const [id, setId] = useState('');
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consumer, setConsumer] = useState<any>(null);
  const actions = CONSUMER_ACTIONS_DATA;
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

  const getAction = (kyb_status: string, status: string) => {
    return actions.filter(action => {
      if (kyb_status?.includes('approved')) {
        return (
          findPermissionSlug(userPermissions, action?.permit) &&
          (
            action?.type?.includes(status?.toLowerCase()) ||
            action?.type?.includes('all')
          )
        );
      } else {
        return (
          findPermissionSlug(userPermissions, action?.permit) &&
          (
            action?.type?.includes(kyb_status?.toLowerCase()) ||
            action?.type?.includes('all')
          )
        );
      }
    });
  }

  const closeModal = () => {
    setOpenModal('');
  }

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal('');
  }

  const handleActivateDeactivateConsumer = async (action: string, id: string, code: string) => {
    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);

      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: action == 'activate' ? 
          API.activateCompany({ id: id || consumer?.id }) :
          API.deactivateCompany({ id: id || consumer?.id }),
        method: 'PATCH',
        data: null
      });

      if (result?.status == 200) {
        setLoading(false);
        close2FAModal();
        router.refresh();
      } else {
        setLoading(false);
      }
    }
  }

  const handleApproveDeclineConsumer = async (action: string, id: string, code: string) => {
    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      const data = action == 'approve' ? 
        { action } :
        { action, reason }

      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: API.updateCompanyStatus({ id: id || consumer?.id }),
        method: 'PATCH',
        data
      });

      if (result?.status == 200) {
        setLoading(false);
        close2FAModal();
        router.refresh();
      } else {
        setLoading(false);
      }
    }
  };

  const handle2FA = () => {
    close2FAModal();
    toast.success(
      openModal == 'deactivate' ?
        'You have successfully deactivated [api_consumer_name]’s access.' :
        openModal == 'activate' ?
          'You have successfully activated [api_consumer_name]’s access.' :
          openModal == 'approve' ?
            'You have successfully approved [api_consumer_name] access request.' :
            openModal == 'deny' ?
            'You have successfully declined [api_consumer_name] access request.' :
            null
    )
  };

  const actionColumn = columnHelper.accessor('actions', {
    header: () => 'Actions',
    cell: ({ row }) => (
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
            getAction(row.original.kyb_status, row.original.status)?.map((action) => (
              <button
                key={action.id}
                className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                onClick={() => {
                  setId(row.original.id);
                  setConsumer(rawData?.find(data => data?.id == row.original.id))
                  action.name == 'view' ?
                    router.push(`/app/api-management/consumers/${row.original.id}`) :
                    setOpenModal(action?.name == 'decline' ? 'deny' : action?.name);
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
  })
  
  return (
    <>
      {
        (openModal == 'activate' || openModal == 'deactivate') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <ActivateDeactivateConsumer 
              close={closeModal}
              type={openModal}
              loading={loading}
              next={() => handleActivateDeactivateConsumer(
                openModal,
                consumer?.id,
                ''
              )}
            />
          </AppCenterModal>
      }

      {
        (openModal == 'approve' || openModal == 'deny') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            {
              openModal == 'approve' ?
                <ApproveConsumer 
                  close={closeModal}
                  loading={loading}
                  next={() => handleApproveDeclineConsumer(
                    'approve',
                    consumer?.id, 
                    ''
                  )}
                />
                :
                <DeclineConsumer 
                  close={closeModal}
                  reason={reason}
                  setReason={setReason}
                  loading={loading}
                  next={() => handleApproveDeclineConsumer(
                    'deny',
                    consumer?.id, 
                    ''
                  )}
                />
            }
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
              next={(value: string) => 
                openModal == 'activate' || openModal == 'deactivate' ?
                  handleActivateDeactivateConsumer(openModal, '', value) :
                  handleApproveDeclineConsumer(openModal, '', value)
              }
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
            body='There’s no information to show for this query. Please try another query or clear your filters.'
          />
      }
    </>
  )
}

export default ConsumersTable