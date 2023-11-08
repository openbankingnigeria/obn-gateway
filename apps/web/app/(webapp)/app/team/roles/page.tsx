import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { SearchBar, SelectElement } from '@/components/forms'
import { ROLES_2FA_DATA, ROLES_STATUS_DATA, ROLES_TABLE_DATA, ROLES_TABLE_HEADERS } from '@/data/rolesData'
import { CreateRoleButton, RolesTable } from './(components)'

const RolesPage = ({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const two_fa = searchParams?.two_fa || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const role = searchParams?.role || ''

  const filters = [search_query, status, role];

  const panel = ROLES_STATUS_DATA;

  const headers = ROLES_TABLE_HEADERS;
  const roles = ROLES_TABLE_DATA;
  const total_pages = roles?.length;
  const total_elements_in_page = roles?.length;
  const total_elements = roles?.length;

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

              <SelectElement 
                name='two_fa'
                options={two_fa_list}
                value={two_fa}
                innerLabel='2FA:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />
            </div>

            <CreateRoleButton />
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <RolesTable
              tableHeaders={headers}
              rawData={roles}
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