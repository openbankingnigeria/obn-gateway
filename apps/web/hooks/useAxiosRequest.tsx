// @ts-nocheck
import { axiosRequest } from '@/config/axiosRequest';
import { getStorage, removeStorage } from '@/config/webStorage';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

interface AxiosRequestProps {
  apiEndpoint: string;
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE' | 'PUT';
  headers: any;
  data: any;
  redirectTo?: string
};

const useAxiosRequest = async ({
  headers,
  apiEndpoint,
  method,
  data,
  redirectTo
}: AxiosRequestProps) => {

  const token = getStorage('aperta-user-accessToken');
  const initial_state = {
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers
    },
  }

  let response = await axiosRequest({
    apiEndpoint: apiEndpoint,
    method: method,
    headers: { ...initial_state?.headers },
    data
  });

  if (response?.status == 200 || response?.status == 201) {
    toast.success(response?.message);
    redirectTo && redirect(redirectTo);
  } else if ([403, 401]?.includes(response?.status)) {
    toast.error(response?.message);
    removeStorage('aperta-user-accessToken');
    redirect('/');
  } else {
    toast.error(response?.message);
  }

  return response?.data;
}

export default useAxiosRequest