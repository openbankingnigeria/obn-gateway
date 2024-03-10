'use client'

import { EmptyState, TableElement } from '@/app/(webapp)/(components)'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import * as API from '@/config/endpoints';
import React, { useEffect, useState } from 'react'
import { findPermissionSlug } from '@/utils/findPermissionSlug'

const CollectionsTable = ({
  tableHeaders,
  rawData,
  altData,
  filters,
  message,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages,
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
        href={`/app/api-management/collections/${row.original.id}`}
        id={row.original.id} 
        className='text-f14 !text-[#5277C7] cursor-pointer capitalize'
      >
        View
      </Link>
    )
  })

  const handleRedirect = (id: string) => {
    return `/app/api-management/collections/${id}`;
  }

  return (
    <div className='w-full h-full'>
      {
        (rawData && rawData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={rawData}
            actionColumn={
              findPermissionSlug(userPermissions, 'list-api-endpoints, view-api-collection') ?
                actionColumn : undefined
            }
            removePagination
            filters={filters}
            redirect={
              findPermissionSlug(userPermissions, 'list-api-endpoints, view-api-collection') ?
              (value: string) => handleRedirect(value)
              : null
            }
            module='collections'
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
            parentStyle='h-[calc(100vh-388px)]'
            body={message || 'There’s no information to show for this query. Please try another query or clear your filters.'}
          />
      }
    </div>
  )
}

export default CollectionsTable