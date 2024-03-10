'use client'

import { EmptyState, TableElement } from '@/app/(webapp)/(components)'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import * as API from '@/config/endpoints';
import React, { useEffect, useState } from 'react'
import { findPermissionSlug } from '@/utils/findPermissionSlug'

const ActivityTable = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages
}: TableProps) => {
  const columnHelper = createColumnHelper<any>();
  const [profile, setProfile] = useState<any>(null);
  let userPermissions = profile?.user?.role?.permissions
  // console.log(rawData);

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

  const actionColumn = columnHelper.accessor('actions', {
    header: () => '',
    cell: ({ row }) => (
      <Link 
        href={`/app/api-management/activity/${row.original.id}`}
        id={row.original.id} 
        className='text-f14 !text-[#5277C7] cursor-pointer capitalize'
      >
        View
      </Link>
    )
  })

  const handleRedirect = (id: string) => {
    return `/app/api-management/activity/${id}`;
  }
  
  return (
    <>
      {
        (rawData && rawData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={rawData}
            actionColumn={
              findPermissionSlug(userPermissions, 'view-api-call') ? 
              actionColumn : undefined
            }
            filters={filters}
            totalElementsInPage={totalElementsInPage}
            redirect={
              findPermissionSlug(userPermissions, 'view-api-call') ?
              (value: string) => handleRedirect(value)
            : null
            }
            module='activity'
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

export default ActivityTable