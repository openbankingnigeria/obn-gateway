'use client'

import { AppCenterModal, AppRightModal, EmptyState, TableElement, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { ROLES_ACTIONS_DATA } from '@/data/rolesData'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useEffect, useState } from 'react'
import * as API from '@/config/endpoints';
import { ActivateDeactivateRole, EditRolePage, ViewRolePage } from '.'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { dataToPermissions } from '@/utils/dataToPermissions'
import { findPermissionSlug } from '@/utils/findPermissionSlug'

const RolesTable = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  altData,
  totalElements,
  totalElementsInPage,
  totalPages,
}: TableProps) => {
  const columnHelper = createColumnHelper<any>();
  const router = useRouter();
  const [openModal, setOpenModal] = useState('');
  const [id, setId] = useState('');
  const [role, setRole] = useState<any>(null);
  // const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role_name, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [refresh, setRefresh] = useState(false);
  let userPermissions = profile?.user?.role?.permissions

  const actions = ROLES_ACTIONS_DATA;

  useEffect(() => {
    setRoleName(role?.name);
    setDescription(role?.description);
  }, [role])

  const refreshData = () => {
    setRoleName('');
    setDescription('');
    setPermissions([]);
  };

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

  async function FetchData() {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getRolePermission({ id: role?.id }),
      method: 'GET',
      data: null,
      noToast: true,
    });

    let permits = dataToPermissions(result?.data?.map((data: any) => data), 'answer');
    setPermissions(permits);
  }

  useEffect(() => {
    role?.id && FetchData();
  }, [role, refresh]);

  const getAction = (status: string) => {
    return actions.filter(action => {
      return (
        findPermissionSlug(userPermissions, action?.permit) &&
        (
          action?.type == status?.toLowerCase() ||
          action?.type == 'all'
        )
      );
    });
  }

  const closeModal = () => {
    setOpenModal('');
    refreshData();
  }

  // const close2FAModal = () => {
  //   setOpen2FA(false);
  //   setOpenModal('');
  // }

  const handleActivateDeactivateRole = async (/*code: string,*/) => {
    // if (profile?.user?.twofaEnabled && !code) {
    //   setOpen2FA(true);
    // } else {
      setLoading(true);
      const result: any = await clientAxiosRequest({
        // headers: code ? { 'X-TwoFA-Code' : code, } : {},
        headers: {},
        apiEndpoint: API.updateRole({ id: role?.id }),
        method: 'PATCH',
        data: {
          description: role?.description,
          status: openModal == 'deactivate' ? 'inactive' : 'active'
        }
      });

      if (result?.message) {
        // close2FAModal();
        setLoading(false);
        router.refresh();
      }
    /* } */
  }

  const handleEdit = async (/* code: string, */e?: FormEvent<HTMLFormElement>) => {
    e && e.preventDefault();

    // if (profile?.user?.twofaEnabled && !code) {
    //   setOpen2FA(true);
    // } else {
      setLoading(true);
      const result: any = await clientAxiosRequest({
        // headers: code ? { 'X-TwoFA-Code' : code, } : {},
        headers: {},
        apiEndpoint: API.updateRole({
          id: role?.id
        }),
        noToast: true,
        method: 'PATCH',
        data: {
          description,
          status: "active",
        }
      });

      if (result?.status == 200) {
        // @ts-ignore
        let sanitizedPermissions = permissions?.flatMap(item => item.options.map(option => option.id));
        const result2: any = await clientAxiosRequest({
          // headers: code ? { 'X-TwoFA-Code' : code, } : {},
          headers: {},
          apiEndpoint: API.putRolePermission({
            id: role?.id
          }),
          method: 'PUT',
          data: {
            permissions: sanitizedPermissions
          }
        });

        setLoading(false);
        if (result2?.status == 200) {
          // close2FAModal();
          refreshData();
          router.refresh();
        }
      } else {
        setLoading(false);
        if (result?.status == 200) {
          // close2FAModal();
          refreshData();
          router.refresh();
        }
      }
    /* } */
  }

  // const handle2FA = (value: string) => {
  //   openModal == 'edit' ?
  //     handleEdit(value, undefined) :
  //     handleActivateDeactivateRole(value)
  // };

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
            getAction(row.original.status)?.map((action) => (
              <button
                key={action.id}
                className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                onClick={() => {
                  action.name == 'edit' && setRefresh(prev => !prev);
                  setId(row.original.id);
                  setRole(rawData?.find(data => data?.id == row.original.id));
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
  });

  return (
    <>
      {
        (openModal == 'view' || openModal == 'edit') && 
          <AppRightModal
            title={
              openModal == 'view' ? 
                'Role Details' :
                'Edit Role'
            }
            effect={closeModal}
            childrenStyle='!px-0'
          >
            {
              openModal == 'view' ?
                <ViewRolePage 
                  close={closeModal}
                  data={role}
                  next={() => setOpenModal('edit')}
                /> 
                :
                <EditRolePage 
                  close={closeModal}
                  data={role}
                  list={altData}
                  next={handleEdit}
                  loading={loading}
                  role_name={role_name}
                  description={description}
                  permissions={permissions}
                  setRoleName={setRoleName}
                  setDescription={setDescription}
                  setPermissions={setPermissions}
                /> 
            }
          </AppRightModal>
      }

      {
        (openModal == 'activate' || openModal == 'deactivate') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <ActivateDeactivateRole 
              close={closeModal}
              type={openModal}
              loading={loading}
              next={() => handleActivateDeactivateRole()}
            />
          </AppCenterModal>
      }

      {/* {
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
      } */}

      {
        (rawData && rawData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={rawData}
            actionColumn={actionColumn}
            filters={filters}
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
            body='There’s no information to show yet. Roles added will appear here.'
          />
      }
    </>
  )
}

export default RolesTable