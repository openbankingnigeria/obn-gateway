'use server'

import { axiosRequest } from "@/config/axiosRequest";
import * as API from '../config/endpoints';

/* INVITE MEMBER */
export async function postInviteMember(prevState: any, formData: FormData) {
  const fullData = {
    email: formData.get('email'),
    role: formData.get('role')
  }

  return { message: 'You sent an invite to [email_address]' };
}

/* CREATE ROLE */
export async function postCreateRole(prevState: any, formData: FormData) {
  const fullData = {
    name: formData.get('role_name'),
    description: formData.get('description'),
    permissions: formData.get('permissions')
  }

  let response = await axiosRequest({
    apiEndpoint: API.postRoles(),
    method: 'POST',
    headers: { ...prevState?.headers },
    data: { 
      name: fullData?.name, 
      description: fullData?.description
    }
  });

  if (response?.status == 201 || response?.status == 200) {
    let role_id = response?.data?.id;
    await axiosRequest({
      apiEndpoint: API.putRolePermission({ role_id }),
      method: 'PUT',
      headers: { ...prevState?.headers },
      data: {
        permissions: fullData?.permissions
      }
    });
    return { response }
  } else {
    return { response }
  }
}

/* UPDATE ROLE */
export async function updateRole(prevState: any, formData: FormData) {
  const fullData = {
    role_name: formData.get('role_name'),
    description: formData.get('description')
  }

  return { message: 'success' };
}