import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { TopPanel } from '@/app/(webapp)/(components)'
import { MEMBERS_TABLE_DATA, MEMBERS_TABLE_HEADERS, MEMBERS_STATUS_DATA, MEMBERS_ROLES, INVITED_MEMBERS_TABLE_HEADERS, INVITED_MEMBERS_TABLE_DATA } from '@/data/membersData'
import { SearchBar, SelectElement } from '@/components/forms'
import { InviteMembersButton, MembersTable } from './(components)'

const MembersPage = ({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const role = searchParams?.role || ''

  const filters = [search_query, status, role];

  const panel = MEMBERS_STATUS_DATA({
    active: 29,
    invited: 5
  });

  const headers = status == 'invited' ? INVITED_MEMBERS_TABLE_HEADERS : MEMBERS_TABLE_HEADERS;
  const members = status == 'invited' ? INVITED_MEMBERS_TABLE_DATA : MEMBERS_TABLE_DATA;
  const total_pages = members?.length;
  const total_elements_in_page = members?.length;
  const total_elements = members?.length;

  const status_list = MEMBERS_STATUS_DATA({})?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  });

  const roles = MEMBERS_ROLES;

  const role_list = roles?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  });


  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
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

            <InviteMembersButton roles={roles} />
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