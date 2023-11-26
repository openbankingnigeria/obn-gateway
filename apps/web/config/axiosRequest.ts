import { HttpRequestProps } from '@/types/configTypes';
import axios from './axios';

export const axiosRequest = async ({
  apiEndpoint,
  method,
  headers,
  data
}: HttpRequestProps) => {
  const config = {
    method,
    url: apiEndpoint,
    headers: {
      ...headers,
    },
    data,
  };
  try {
    const response = await axios(config);
    return response;
  } catch (err) {
    console.error('error here', err);
    return ({
      // @ts-ignore
      message: err?.message,
      status: null,
      data: [],
      meta_data: {}
    });
  }
}