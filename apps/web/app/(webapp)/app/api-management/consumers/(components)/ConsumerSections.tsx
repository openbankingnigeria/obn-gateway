'use client'

import { AppCenterModal, AppRightModal, DatePicker, EmptyState, TableElement, TransparentPanel, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { SearchBar, SelectElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import { CONSUMER_DETAILS_PANEL } from '@/data/consumerData'
import { ConsumerSectionsProps, HeadersProps, HostsProps, SnisProps } from '@/types/webappTypes/appTypes';
import React, { FormEvent, useEffect, useState } from 'react'
import { EditPermissionButton } from '.';
import { createColumnHelper } from '@tanstack/react-table';
import { COLLECTION_ACTIONS_DATA } from '@/data/collectionDatas';
import { ModifyApiConfiguration } from '../../collections/(components)';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { useRouter } from 'next/navigation';
import * as API from '@/config/endpoints';
import { getJsCookies } from '@/config/jsCookie';

const ConsumerSections = ({
  path,
  rawData,
  tableHeaders,
  filters,
  altData,
  profileData,
  rows,
  page,
  statusList,
  totalElements,
  totalElementsInPage,
  totalPages,
}: ConsumerSectionsProps) => {
  const columnHelper = createColumnHelper<any>();
  const router = useRouter();
  const [openModal, setOpenModal] = useState('');
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const actions = COLLECTION_ACTIONS_DATA;
  const [api, setApi] = useState<any>(null);
  const profile = profileData;
  const [api_endpoint, setApiEndpoint] = useState<any>(null);
  const environment = getJsCookies('environment');

  const enabledConsumer = altData?.status == 'active' && altData?.kybStatus == 'approved';

  // console.log(altData);

  const [endpoint_url, setEndpointUrl] = useState('');
  const [parameters, setParameters] = useState('');
  const [snis, setSnis] = useState<SnisProps[]>([]);
  const [hosts, setHost] = useState<HostsProps[]>([]);
  const [headers, setHeaders] = useState<HeadersProps[]>([]);

  const refreshData = () => {
    setEndpointUrl('');
    setParameters('');
    setSnis([]);
    setHost([]);
    setHeaders([]);
  }

  const updateFields = (value: any) => {
    setEndpointUrl(value?.endpoint_url);
    setParameters(value?.parameters);
  }

  async function FetchData() {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPI({ 
        environment: environment || 'development', 
        id: api?.id
      }),
      method: 'GET',
      data: null,
      noToast: true,
    });
    setApiEndpoint(result?.data);
  }

  useEffect(() => {
    api?.id && FetchData();
  }, [api?.id]);

  const getAction = () => {
    return actions.filter(action => {
      return (
        action?.type == 'all' && 
        action?.name != 'delete'
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

  const handleApiModification = async (code: string, e?: FormEvent<HTMLFormElement>) => {
    e && e.preventDefault();

    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: API.updateAPI({ 
          environment: environment || 'development', 
          id: api?.id
        }),
        method: 'PATCH',
        data: {
          "name": api?.name,
          "enabled": true,
          "url": endpoint_url,
          "route": {
              "paths": [
                  parameters
              ],
              "methods": api?.route?.methods
          }
        }
      });

      setLoading(false);
        if (result?.status == 200) {
          close2FAModal();
          refreshData();
          router.refresh();
        }
    }
  }

  const handle2FA = (value: string) => {
    handleApiModification(value, undefined)
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
            getAction()?.map((action) => (
              <button
                key={action.id}
                className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                onClick={() => {
                  const api = rawData?.find(data => data?.id == row.original.id);
                  setApi(api)
                  updateFields({
                    endpoint_url: api?.url,
                    parameters: api?.route?.paths
                  })
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
        (openModal == 'modify') &&
          <AppRightModal
            title={'Modify API Configuration'}
            effect={closeModal}
            childrenStyle='!px-0'
          >
            <ModifyApiConfiguration 
              close={closeModal}
              loading={loading}
              next={handleApiModification}
              data={api_endpoint}
              endpoint_url={endpoint_url}
              parameters={parameters}
              snis={snis}
              hosts={hosts}
              headers={headers}
              setEndpointUrl={setEndpointUrl}
              setParameters={setParameters}
              setSnis={setSnis}
              setHost={setHost}
              setHeaders={setHeaders}
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
              next={(value: string) => handle2FA(value)}
            />
          </AppCenterModal>
      }

      <section className='w-full h-full flex flex-col gap-[20px]'>
        <TransparentPanel
          panel={CONSUMER_DETAILS_PANEL}
          status={altData?.type}
          currentValue={path}
          removeSearchParam='date_sent'
        />

        <div className='w-full flex flex-col h-full'>
          {
            (rawData && rawData?.length >= 1) ?
              <div className='w-full bg-white border border-o-border rounded-[10px] h-fit'>
                <h3 className='px-[20px] py-[16px] w-full border-b rounded-tr-[10px] rounded-tl-[10px] border-o-border bg-o-bg2'>
                  <div className='text-f16 font-[600] text-o-text-dark'>
                    {
                      path == 'consents' ?
                        'Consents' :
                        path == 'api_activities' ?
                          'API Activities' :
                          'Collections'
                    }
                  </div>
                </h3>

                <div className='w-full p-[20px] rounded-br-[10px] rounded-bl-[10px] flex flex-col gap-[12px] bg-white'>
                  <div className='w-full flex-wrap flex items-center justify-between gap-[12px]'>
                    <div className='w-fit flex-wrap flex items-center gap-[12px]'>
                      <SearchBar 
                        placeholder={`Search ${path == 'api_activities' ? 'APIs' : path}`}
                        searchQuery={filters[0]}
                      />

                      {
                        !(path == '') &&
                        <SelectElement 
                          name='status'
                          options={statusList}
                          value={filters[1]}
                          innerLabel='Status:'
                          containerStyle='!w-fit cursor-pointer'
                          small
                          removeSearch
                          optionStyle='!top-[38px]'
                          forFilter
                        />
                      }

                      {
                        path == 'consents' &&
                        <DatePicker
                          showShortcuts={true}
                          dateFilter={filters[2]}
                          name='date_sent'
                          innerLabel='Date Sent:'
                          asSingle
                          popoverDirection='up'
                        />
                      }
                    </div>

                    {
                      enabledConsumer && (path == '') &&
                      <EditPermissionButton 
                        rawData={altData}
                        searchQuery={filters[0]}
                      />
                    }
                  </div>

                  <TableElement 
                    tableHeaders={tableHeaders}
                    rawData={rawData}
                    filters={filters}
                    // actionColumn={actionColumn}
                    totalElementsInPage={totalElementsInPage}
                    rows={rows}
                    page={page}
                    totalElements={totalElements}
                    totalPages={totalPages}
                  />
                </div>
              </div>
              :
              <EmptyState 
                title='Nothing to show'
                type='DEFAULT'
                parentStyle='!h-[calc(100vh-600px)]'
                altData={altData}
                body='There’s no information to show for this user yet.'
                button={path == ''}
                searchQuery={filters[0]}
                buttonType='ADD_PERMISSIONS'
              />
          }
        </div>
      </section>
    </>
  )
}

export default ConsumerSections