import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { SearchBar, SelectElement } from '@/components/forms'
import { ROLES_2FA_DATA, ROLES_STATUS_DATA, ROLES_TABLE_HEADERS } from '@/data/rolesData'
import { CreateRoleButton, RolesTable } from './(components)';
import * as API from '@/config/endpoints';
import { applyAxiosRequest } from '@/hooks';
import Logout from '@/components/globalComponents/Logout';
import { ToastMessage } from '@/app/(webapp)/(components)';
import { findPermissionSlug } from '@/utils/findPermissionSlug';
import { RefreshStoredToken } from '@/components/globalComponents';
import { getCookies } from '@/config/cookies';

const RolesPage = async ({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  // const two_fa = searchParams?.two_fa || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const role = searchParams?.role || ''

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  const roles: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getRoles({
      page: `${page}`,
      limit: `${rows}`,
      name: search_query,
      status: status,
    }),
    method: 'GET',
    data: null
  })

  const permissions = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getPermissions(),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (permissions?.status == 401 || roles?.status == 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: { },
      apiEndpoint: API?.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${await getCookies('aperta-user-refreshToken')}`
      }
    });

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  let profile = fetchedProfile?.data;
  let userPermissions = profile?.user?.role?.permissions;
  let createRolePermit = findPermissionSlug(userPermissions, 'create-role')
  let permission_list = permissions?.data;
  let meta_data = roles?.meta_data;
  let role_list = roles?.data?.map((role: any) => {
    return ({
      ...role,
      role_name: role?.name,
      date_created: new Date(role?.createdAt)
    })
  });

  let sorted_list = role_list?.sort((a: any, b: any) => b.date_created - a.date_created );
  const filters = [search_query, status, role];

  const headers = ROLES_TABLE_HEADERS;
  const total_pages = meta_data?.totalNumberOfPages;
  const total_elements_in_page = role_list?.length || meta_data?.pageSize;
  const total_elements = meta_data?.totalNumberOfRecords;

  const status_list = ROLES_STATUS_DATA?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  });

  const two_fa_list = ROLES_2FA_DATA?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  });


  return (
    <section className='flex flex-col h-full w-full'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }
      {
        /* SSR TOAST ERROR */
        (roles?.status != 200 && roles?.status != 201) && 
        <ToastMessage 
          message={roles?.message} 
        />
      }
      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Roles
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex items-center justify-between gap-[12px]'>
            <div className='w-full flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder='Search roles'
                searchQuery={search_query}
              />

              <SelectElement 
                name='status'
                options={status_list}
                value={status}
                innerLabel='Status:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />

              {/* <SelectElement 
                name='two_fa'
                options={two_fa_list}
                value={two_fa}
                innerLabel='2FA:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              /> */}
            </div>

           { 
              createRolePermit &&
              <CreateRoleButton 
                permissions_list={permission_list}
              />
            }
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <RolesTable
              tableHeaders={headers}
              rawData={sorted_list}
              altData={permission_list}
              filters={filters}
              rows={rows}
              totalElementsInPage={total_elements_in_page}
              page={page}
              path={status}
              totalElements={total_elements}
              totalPages={total_pages}
            />
          </section>
        </section>
      </div>
    </section>
  )
}

export default RolesPage