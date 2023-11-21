import { getFirstValueOfObject } from '@/utils/getFistValueOfObject';
import axios from 'axios';

// INTERCEPT ALL REQUEST
axios.interceptors.request.use(
  async (request) => {
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
      console.log(response);
      return ({
        // @ts-ignore
        message: response?.data?.message || response?.message,
        status: response?.status,
        data: response?.data?.data,
        request_date: new Date()
      });
    } else {
      return Promise.reject(new Error('Response is undefined or missing status'));
    }
  },

  async (error) => {
    console.warn(error?.response?.data);
    if (!(error?.response?.status)) {
      error.message = 'No internet connection';
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