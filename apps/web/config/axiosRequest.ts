import axios from './axios';

interface AxiosRequestProps {
  apiEndpoint: string;
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE' | 'PUT';
  headers: any;
  data: any;
};

export const axiosRequest = async ({
  apiEndpoint,
  method,
  headers,
  data
}: AxiosRequestProps) => {
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
      status: null
    });
  }
}