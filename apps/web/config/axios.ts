import { getFirstValueOfObject } from '@/utils/getFistValueOfObject';
import axios from 'axios';
import { getCookies } from './cookies';

// INTERCEPT ALL REQUEST
axios.interceptors.request.use(
  async (request) => {
    const token = await getCookies('aperta-user-accessToken');
  
    if (!request.headers.Authorization) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    console.warn(error?.response?.data);
    return Promise.reject(error);
  }
);
  
// INTERCEPT ALL RESPONSE
axios.interceptors.response.use(
  // @ts-ignore
  async (response) => {
    if (response && response.status) {
      console.log(response?.data);
      return ({
        // @ts-ignore
        message: response?.data?.message || response?.message,
        status: response?.status,
        data: response?.data?.data,
        meta_data: response?.data?.meta || response?.data?._meta,
        request_date: new Date()
      });
    } else {
      return Promise.reject(new Error('Response is undefined or missing status'));
    }
  },

  async (error) => {
    console.warn(error?.response?.data);
    if (!(error?.response?.status)) {
      error.message = 'Network error. Please try again later';
      return ({ 
        message: error.message,
        request_date: new Date(), 
        status: null 
      });
    } else if ([403].includes(error?.response?.status)) {
      error.message = (error?.response?.data?.data && getFirstValueOfObject(error?.response?.data?.data)) || 
        error?.response?.data?.message || 
        error?.response?.message;
      return ({ 
        message: error.message,
        request_date: new Date(),
        status: 403
      });
    } else if ([401].includes(error?.response?.status)) {
      error.message = (error?.response?.data?.data && getFirstValueOfObject(error?.response?.data?.data)) || 
        error?.response?.data?.message || 
        error?.response?.message;
      return ({ 
        message: error.message,
        request_date: new Date(),
        status: 401
      });
    } else if ([500].includes(error?.response?.status)) {
      error.message = (error?.response?.data?.data && getFirstValueOfObject(error?.response?.data?.data)) || 
        error?.response?.data?.message || 
        error?.response?.message ||
        'Server error. Please try again later';
      return ({ 
        message: error.message,
        request_date: new Date(),
        status: 500
      });
    } else if (error?.response?.data) {
      error.message = (error?.response?.data?.data && getFirstValueOfObject(error?.response?.data?.data)) || 
        error?.response?.data?.message || 
        error?.response?.message;
      return ({ 
        message: error.message,
        request_date: new Date(),
        status: error?.response?.status
      });
    }

    return (
      Promise.reject(error)
    );
  }
);
  
export default axios; 