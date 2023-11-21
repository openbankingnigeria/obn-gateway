'use client'

import { AppCenterModal, AppRightModal, ConfigurationBox, EmptyState, TableElement, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { SearchBar, SelectElement } from '@/components/forms'
import { COLLECTION_ACTIONS_DATA } from '@/data/collectionDatas'
import { SectionsProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import ApiConfiguration from './ApiConfiguration'
import ModifyApiConfiguration from './ModifyApiConfiguration'

const CollectionSection = ({
  rawData,
  tableHeaders,
  filters,
  rows,
  page,
  details,
  totalElements,
  totalElementsInPage,
  totalPages,
  requestMethodList,
  tierList
}: SectionsProps) => {
  const columnHelper = createColumnHelper<any>();
  const router = useRouter();
  const [openModal, setOpenModal] = useState('');
  const [id, setId] = useState('');
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const actions = COLLECTION_ACTIONS_DATA;

  const getAction = (status: boolean) => {
    return actions.filter(action => {
      return (
        action?.type == (status ? 'configured' : 'not_configured') ||
        action?.type == 'all'
      );
    });
  }

  const closeModal = () => {
    setOpenModal('');
  }

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal('');
  }

  const handleApiConfiguration = () => {
    // setLoading(true);
    setOpen2FA(true);
  }

  const handleApiModification = () => {
    // setLoading(true);
    setOpen2FA(true);
  }

  const handle2FA = () => {
    close2FAModal();
    toast.success(
      openModal == 'configure' ?
        'You have successfully mapped [API_NAME]' :
        openModal == 'modify' ?
          'Your changes to [API_NAME] have been saved successfully.' :
          null
    )
  };

  const actionColumn = columnHelper.accessor('actions', {
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
            getAction(row.original.configured)?.map((action) => (
              <button
                key={action.id}
                className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                onClick={() => {
                  setId(row.original.id);
                  setOpenModal(action.name);
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
        (openModal == 'configure' || openModal == 'modify') &&
          <AppRightModal
            title={
              openModal == 'configure' ? 
                'API Configuration' : 
                'Modify API Configuration'
            }
            effect={closeModal}
            childrenStyle='!px-0'
          >
            {
              openModal == 'configure' ?
                <ApiConfiguration 
                  close={closeModal}
                  loading={loading}
                  next={handleApiConfiguration}
                />
                :
                <ModifyApiConfiguration 
                  close={closeModal}
                  loading={loading}
                  next={handleApiModification}
                />
            }
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

      <section className='w-full flex flex-col h-full'>
        <div className='w-full bg-white border border-o-border rounded-[10px] h-fit'>
          <header className='px-[20px] py-[16px] w-full border-b rounded-tr-[10px] rounded-tl-[10px] flex items-center justify-between border-o-border bg-o-bg2'>
            <h3 className='text-f16 font-[600] text-o-text-dark'>
              APIs
            </h3>

            <div className='w-fit gap-[8px] flex items-center'>
              <div className='text-f14 text-o-text-medium3 w-fit flex items-center gap-[8px]'>
                <div className='w-fit flex items-center gap-[4px]'>
                  Enabled
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_760_19919)">
                      <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#666D80" strokeLinecap="round" strokeLinejoin="round" fill='transparent' />
                    </g>
                    <defs>
                      <clipPath id="clip0_760_19919">
                        <rect width="12" height="12" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                
                <ConfigurationBox 
                  value={details?.configuration}
                />
              </div>

              <div className='text-f14 text-o-text-medium3 w-fit flex items-center gap-[8px]'>
                Configured: 
                <ConfigurationBox 
                  value={details?.configuration}
                  noOfApis={details?.no_of_apis}
                />
              </div>
            </div>
          </header>

          <div className='w-full p-[20px] rounded-br-[10px] rounded-bl-[10px] flex flex-col gap-[12px] bg-white'>
            <div className='w-full flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder={`Search APIs`}
                searchQuery={filters[0]}
              />

              <SelectElement 
                name='request_method'
                options={requestMethodList || []}
                value={filters[1]}
                innerLabel='Request Method:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />

              <SelectElement 
                name='tier'
                options={tierList || []}
                value={filters[2]}
                innerLabel='Tier:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />
            </div>

            {
              (rawData && rawData?.length >= 1) ?
                <TableElement 
                  tableHeaders={tableHeaders}
                  rawData={rawData}
                  filters={filters}
                  actionColumn={actionColumn}
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
                  parentStyle='!h-[calc(100vh-600px)]'
                  body='There’s no information to show yet.'
                />
            }
          </div>
        </div>
      </section>
    </>
  )
}

export default CollectionSection