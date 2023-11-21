'use client'

import { AppCenterModal, EmptyState, TableElement } from '@/app/(webapp)/(components)'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { RevokeConsent } from '.'
import { CONSENT_ACTIONS_DATA } from '@/data/consentData'

const ConsentsTable = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages,
}: TableProps) => {
  const columnHelper = createColumnHelper<any>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState('');
  const actions = CONSENT_ACTIONS_DATA;
  const USER_TYPE = 'API_CONSUMER';

  const getAction = (status: string) => {
    return actions.filter(action => {
      return (
        action?.type == status?.toLowerCase() ||
        action?.type == 'all'
      );
    });
  }

  const handleResent = () => {
    toast.success('The consent has been resent successfully.');
  }

  const apActionColumn = columnHelper.accessor('actions', {
    header: () => '',
    cell: ({ row }) => (
      <Link 
        href={`/app/reporting/consents/${row.original.id}`}
        id={row.original.id} 
        className='text-f14 !text-[#5277C7] cursor-pointer capitalize'
      >
        View
      </Link>
    )
  })

  const acActionColumn = columnHelper.accessor('actions', {
    header: () => '',
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
            getAction(row.original.status)?.map((action) => (
              <button
                key={action.id}
                className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                onClick={() => {
                  return (
                  action.name == 'view' ?
                    router.push(`/app/reporting/consents/${row.original.id}`) :
                    action.name == 'resend' ?
                      handleResent() :
                      setOpenModal(action.name)
                  );
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

  const handleRedirect = (id: string) => {
    return `/app/reporting/consents/${id}`;
  }

  const closeModal = () => {
    setOpenModal('');
  }

  const handleRevoke = () => {
    toast.success('Access to [customer-name] has been revoked');
    closeModal();
  }

  return (
    <>
      {
        (openModal == 'revoke') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <RevokeConsent
              close={closeModal}
              type={openModal}
              loading={loading}
              next={handleRevoke}
            />
          </AppCenterModal>
      }

      {
        (rawData && rawData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={rawData}
            actionColumn={USER_TYPE == 'API_CONSUMER' ? acActionColumn : apActionColumn}
            filters={filters}
            redirect={
              USER_TYPE == 'API_CONSUMER' ?
                null :
                (value: string) => handleRedirect(value)
            }
            module='consents'
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
            body='There’s no information to show yet. Consents made will appear here.'
          />
      }
    </>
  )
}

export default ConsentsTable