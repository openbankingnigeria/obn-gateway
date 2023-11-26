// @ts-nocheck
import { axiosRequest } from '@/config/axiosRequest';
import { HttpRequestProps } from '@/types/configTypes';

const applyAxiosRequest = async ({
  headers,
  apiEndpoint,
  method,
  data,
}: HttpRequestProps) => {

  const initial_state = {
    headers: {
      ...headers
    },
  }

  /**NB: response = { data, status, message, request_date }**/
  let response = await axiosRequest({
    apiEndpoint: apiEndpoint,
    method: method,
    headers: { ...initial_state?.headers },
    data
  });

  // console.log(response?.message);
  return response;
}

export default applyAxiosRequest