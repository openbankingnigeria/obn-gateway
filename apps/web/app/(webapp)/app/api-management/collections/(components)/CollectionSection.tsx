'use client'

import { AppCenterModal, ConfigurationBox, EmptyState, TableElement, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { SearchBar, SelectElement } from '@/components/forms'
import { COLLECTION_ACTIONS_CONSUMER_DATA, COLLECTION_ACTIONS_DATA } from '@/data/collectionDatas'
import { HeadersProps, HostsProps, SectionsProps, SnisProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useEffect, useState } from 'react'
import { updateSearchParams } from '@/utils/searchParams'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import * as API from '@/config/endpoints';
import { ActivateDeactivateDeleteApi } from '.'
import { getJsCookies } from '@/config/jsCookie'
import { findPermissionSlug } from '@/utils/findPermissionSlug'
import { Loader } from '@/components/globalComponents'
import { toast } from 'react-toastify'

const CollectionSection = ({
  rawData,
  tableHeaders,
  filters,
  rows,
  page,
  details,
  altData,
  totalElements,
  totalElementsInPage,
  totalPages,
  requestMethodList,
  tierList
}: SectionsProps) => {
  
// console.log(rawData);

  const columnHelper = createColumnHelper<any>();
  const router = useRouter();
  const [openModal, setOpenModal] = useState('');
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [api, setApi] = useState<any>(null);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const profile = altData;
  let userPermissions = profile?.user?.role?.permissions;
  const userType = profile?.user?.role?.parent?.slug;
  // const [api_endpoint, setApiEndpoint] = useState<any>(null);
  const environment = getJsCookies('environment');
  const actions = userType == 'api-consumer' ? 
    COLLECTION_ACTIONS_CONSUMER_DATA : 
    COLLECTION_ACTIONS_DATA;

  // console.log(rawData);

  // const [endpoint_url, setEndpointUrl] = useState('');
  // const [parameters, setParameters] = useState('');
  // const [snis, setSnis] = useState<SnisProps[]>([]);
  // const [hosts, setHost] = useState<HostsProps[]>([]);
  // const [headers, setHeaders] = useState<HeadersProps[]>([]);

  // const getUserProfile = getJsCookies('aperta-user-profile');
  // const userProfile = getUserProfile ? JSON.parse(getUserProfile) : null;
  // const userType = userProfile?.userType;
  // const refreshData = () => {
  //   setEndpointUrl('');
  //   setParameters('');
  //   setSnis([]);
  //   setHost([]);
  //   setHeaders([]);
  // }

  // const updateFields = (value: any) => {
  //   setEndpointUrl(value?.endpoint_url);
  //   setParameters(value?.parameters);
  // }

  // async function FetchData() {
  //   const result = await clientAxiosRequest({
  //     headers: {},
  //     apiEndpoint: API.getAPI({ 
  //       environment: environment || 'development', 
  //       id: api?.id
  //     }),
  //     method: 'GET',
  //     data: null,
  //     noToast: true,
  //   });
  //   setApiEndpoint(result?.data);
  // }

  // useEffect(() => {
  //   api?.id && FetchData();
  // }, [api?.id]);

  useEffect(() => {
    const slug = updateSearchParams('slug', details?.name);
    router.push(slug);
  }, [details?.name]);

  const getAction = (enabled: boolean) => {
    return actions.filter(action => {
      return (
        findPermissionSlug(userPermissions, action?.permit) &&
        (
          action?.type == (enabled ? 'enabled' : 'disabled') ||
          action?.type == 'all'
        )
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

  const handleActivateDeactivateDeleteApi = async (code: string,) => {
    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      const result: any = openModal == 'delete' ?
        await clientAxiosRequest({
          headers: code ? { 'X-TwoFA-Code' : code, } : {},
          apiEndpoint: API.deleteAPI({ 
            environment: environment || 'development', 
            id: api?.id
          }),
          method: 'DELETE',
          data: null
        })
        :
        await clientAxiosRequest({
          headers: code ? { 'X-TwoFA-Code' : code, } : {},
          apiEndpoint: API.updateAPI({ 
            environment: environment || 'development', 
            id: api?.id
          }),
          method: 'PATCH',
          data: {
            "name": api?.name,
            "enabled": Boolean(openModal == 'activate'),
            "tiers": api?.tiers,
            "upstream": api?.upstream,
            "downstream": api?.downstream
          }
        });

      if (result?.message) {
        close2FAModal();
        setLoading(false);
        router.refresh();
      }
    }
  }

  const handleNIBBSCheck = (name: string, api: any) => {
    toast.info('Enabling NIBBS check')
    setLoadingCheck(true);
    enableNIBBSCheck('', api);
    setOpenModal(name);
  }

  const enableNIBBSCheck = async (code: string , data: any) => {
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
            ...data,
            introspectAuthorization: true
          }
        });

      if (result?.message) {
        close2FAModal();
        setLoading(false);
        setLoadingCheck(false);
        router.refresh();
      }
    }
  }

  const handleCreateAPI = async (code: string, data: any) => {
    if (profile?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      const result: any = await clientAxiosRequest({
          headers: code ? { 'X-TwoFA-Code' : code, } : {},
          apiEndpoint: API.postAPIs({ 
            environment: 'production'
          }),
          method: 'POST',
          data: data || api
        });

      if (result?.message) {
        close2FAModal();
        setLoading(false);
        setLoadingPublish(false);
        router.refresh();
      }
    }
  }

  // const handleApiConfiguration = (code: string, e?: FormEvent<HTMLFormElement>) => {
  //   e && e.preventDefault();

  //   if (profile?.user?.twofaEnabled && !code) {
  //     setOpen2FA(true);
  //   } else {
  //     setLoading(true);
  //     // TODO: GET CONFIGURATION ENDPOINT
  //   }
  // }

  // const handleApiModification = async (code: string, e?: FormEvent<HTMLFormElement>) => {
  //   e && e.preventDefault();

  //   if (profile?.user?.twofaEnabled && !code) {
  //     setOpen2FA(true);
  //   } else {
  //     setLoading(true);
  //     const result: any = await clientAxiosRequest({
  //       headers: code ? { 'X-TwoFA-Code' : code, } : {},
  //       apiEndpoint: API.updateAPI({ 
  //         environment: environment || 'development', 
  //         id: api?.id
  //       }),
  //       method: 'PATCH',
  //       data: {
  //         "name": api?.name,
  //         "enabled": true,
            // "tiers": api?.tiers,
  //         "url": endpoint_url,
  //         "route": {
  //             "paths": [
  //                 parameters
  //             ],
  //             "methods": api?.route?.methods
  //         }
  //       }
  //     });

  //     setLoading(false);
  //       if (result?.status == 200) {
  //         close2FAModal();
  //         refreshData();
  //         router.refresh();
  //       }
  //   }
  // }

  const handle2FA = (value: string) => {
    // openModal == 'configure' ?
    //   handleApiConfiguration(value, undefined) :
    //   openModal == 'modify' ?
    //     handleApiModification(value, undefined) :
    openModal == 'publish' ?
      handleCreateAPI('', api) :
      handleActivateDeactivateDeleteApi(value);
  };

  const handlePublish = (name: string, api: any) => {
    toast.info('Publishing in progress')
    setLoadingPublish(true);
    handleCreateAPI('', api);
    setOpenModal(name);
  }

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

        <div className='hidden peer-focus:flex hover:flex absolute bg-white rounded-lg flex-col z-10 border border-o-border right-0 top-[30px] py-[4px] w-[200px] items-start justify-start tablemenu-boxshadow'>
          {
            getAction(row.original.enabled)?.map((action) => (
              <button
                key={action.id}
                className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                onClick={() => {
                  const api = rawData?.find(data => data?.id == row.original.id);
                  setApi(api)
                  // updateFields({
                  //   endpoint_url: api?.url,
                  //   parameters: api?.route?.paths
                  // })
                  action.name == 'configure' ?
                    router.push(`/app/api-management/collections/${details?.id}/api-configuration?api_id=${row.original.id}`) :
                    action.name == 'preview' ?
                    router.push(`/app/api-management/collections/${details?.id}/api-configuration?api_id=${row.original.id}&preview=true`) :
                      action.name == 'publish' ?
                        handlePublish(action.name, api) :
                        action.name == 'enable_check' ?
                          handleNIBBSCheck(action.name, api)
                          :
                          setOpenModal(action.name)
                }}
              >
                {action.icon}
                
                <span className='whitespace-nowrap'>
                  {
                    (
                      (loadingPublish && action.name == 'publish') || 
                      (loadingCheck && action.name == 'enable_check')
                    ) ?
                      <Loader /> :
                      action.label
                  }
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
      {/* {
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
                  data={api_endpoint}
                  next={handleApiConfiguration}
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
                :
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
            }
          </AppRightModal>
      } */}

      {
        (
          openModal == 'delete' || 
          openModal == 'activate' || 
          openModal == 'deactivate'
        ) &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <ActivateDeactivateDeleteApi 
              close={closeModal}
              type={openModal}
              loading={loading}
              next={() => handleActivateDeactivateDeleteApi('')}
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
              next={(value: string) => handle2FA(value)}
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
              {
                userType == 'api-consumer' ?
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
                      value={rawData?.filter((data: any) => data?.enabled)?.length}
                    />
                  </div>
                  :
                  <div className='text-f14 text-o-text-medium3 w-fit flex items-center gap-[8px]'>
                    Configured: 
                    <ConfigurationBox 
                      value={rawData?.filter((data: any) => data?.enabled)?.length}
                      noOfApis={rawData?.length}
                    />
                  </div>
              }
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
                innerLabel='Method:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />

              {/* {
                userType == 'api-consumer' &&
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
              } */}
            </div>

            {
              (rawData && rawData?.length >= 1) ?
                <TableElement 
                  tableHeaders={tableHeaders}
                  rawData={rawData}
                  filters={filters}
                  actionColumn={actionColumn}
                  // actionColumn={userType == 'api-consumer' ? undefined : actionColumn}
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