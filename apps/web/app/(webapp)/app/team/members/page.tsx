import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { ToastMessage, TopPanel } from '@/app/(webapp)/(components)'
import { MEMBERS_TABLE_HEADERS, MEMBERS_STATUS_DATA, INVITED_MEMBERS_TABLE_HEADERS } from '@/data/membersData'
import { SearchBar, SelectElement } from '@/components/forms'
import { InviteMembersButton, MembersTable } from './(components)'
import Logout from '@/components/globalComponents/Logout'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import { findPermissionSlug } from '@/utils/findPermissionSlug'

const MembersPage = async ({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const role = searchParams?.role || ''

  const filters = [search_query, status, role];

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  let profile = fetchedProfile?.data;
  let userPermissions = profile?.user?.role?.permissions

  const fetchedMembers: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getTeams({
      page: `${page}`,
      limit: `${rows}`,
      name: !(search_query?.includes('@')) ? search_query : '',
      status: status,
      email: search_query?.includes('@') ? search_query : '',
      role: role
    }),
    method: 'GET',
    data: null
  });

  const fetchedRoles = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getRoles({
      page: '1',
      limit: '1000',
    }),
    method: 'GET',
    data: null
  });

  const fetchedStats: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getTeamStats(),
    method: 'GET',
    data: null
  });

  if (fetchedMembers?.status == 401 || fetchedRoles?.status == 401) {
    return <Logout />
  }

  let roles = fetchedRoles?.data;
  let meta_data = fetchedMembers?.meta_data;
  let teams = fetchedMembers?.data;
  let stats = fetchedStats?.data;

  const panel = MEMBERS_STATUS_DATA({
    all: stats?.reduce((acc: any, obj: any) => acc + Number(obj.count), 0),
    active: stats?.find((stat: any) => stat?.value == 'active')?.count,
    inactive: stats?.find((stat: any) => stat?.value == 'inactive')?.count,
    invited: stats?.find((stat: any) => stat?.value == 'pending')?.count
  })?.map((pane: any) => {
    if (pane?.panel) { return pane }
  });

  const invited_members = teams?.map((data: any) => {
    if (data?.status == 'pending') {
      return({
        ...data,
        email_address: data?.email,
        date_invited: data?.createdAt,
        status: 'invited',
        role: data?.role?.name,
        invited_by: ''
      });
    }
  });

  const all_memebers = teams?.map((data: any) => {
    return({
      ...data,
      email_address: data?.email,
      member_name: `${data?.profile?.firstName} ${data?.profile?.lastName}`,
      role: data?.role?.name,
      two_fa: data?.twofaEnabled,
      status: data?.status == 'pending' ? 'invited' : data?.status
    });
  });

  const headers = status == 'pending' ? INVITED_MEMBERS_TABLE_HEADERS : MEMBERS_TABLE_HEADERS;
  const members = status == 'pending' ? 
    invited_members?.filter((x: any) => x) : 
    all_memebers?.filter((x: any) => x);
    const total_pages = meta_data?.totalNumberOfPages;
    const total_elements_in_page = members?.length || meta_data?.pageSize;
    const total_elements = meta_data?.totalNumberOfRecords;

  const status_list = MEMBERS_STATUS_DATA({})?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  });

  const roleList = roles ? roles?.map((data: any) => {
    return({
      label: data?.name,
      value: data?.id
    })
  }) : [];

  const role_list = [
    { label: 'All', value: '' },
    ...roleList
  ]


  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
      {
        /* SSR TOAST ERROR */
        (fetchedMembers?.status != 200 && fetchedMembers?.status != 201) && 
        <ToastMessage 
          message={fetchedMembers?.message} 
        />
      }
      <TopPanel 
        name='status'
        panel={panel}
        currentValue={status}
      />

      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Members
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex items-center justify-between gap-[12px]'>
            <div className='w-full flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder='Search members'
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

              <SelectElement 
                name='role'
                options={role_list}
                value={role}
                innerLabel='Role:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />
            </div>

            {
              findPermissionSlug(userPermissions, "add-team-member") &&
              <InviteMembersButton roles={roles} />
            }
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <MembersTable 
              tableHeaders={headers}
              rawData={members}
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

export default MembersPage