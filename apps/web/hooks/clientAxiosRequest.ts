// @ts-nocheck
'use client'

import { getJsCookies, setJsCookies, removeJsCookies } from "@/config/jsCookie";
import { applyAxiosRequest } from ".";
import { HttpRequestProps } from "@/types/configTypes";
import { toast } from "react-toastify";
import * as API from '@/config/endpoints';

const clientAxiosRequest = async ({
  headers,
  apiEndpoint,
  method,
  data,
  noToast,
}: HttpRequestProps) => {
  const token = getJsCookies('aperta-user-accessToken');
  const refreshToken = getJsCookies('aperta-user-refreshToken');

  try {
    const res = await applyAxiosRequest({
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers
      },
      apiEndpoint,
      method,
      data
    });

    if (res.status == 200 || res.status == 201) {
      !noToast && toast.success(res.message);
    } else if (res.status == 401) {
        const refreshTokenRes = await applyAxiosRequest({
          headers: {
            Authorization: `Bearer ${token}`,
          },
          apiEndpoint: API?.refreshToken(),
          method: 'POST',
          data: {
            refreshToken: `${refreshToken}`
          }
        });

        if (refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201) {
          setJsCookies('aperta-user-accessToken', refreshTokenRes?.data?.accessToken);
          setJsCookies('aperta-user-refreshToken', refreshTokenRes?.data?.refreshToken);
        } else {
          !noToast && toast.error(
            typeof res?.message == 'string' ?
            res?.message : JSON.stringify(res?.message)
          );
          removeJsCookies('aperta-user-accessToken');
          window.location.href = '/';
        }
    } else {
      !noToast && toast.error(
        typeof res?.message == 'string' ?
        res?.message : JSON.stringify(res?.message)
      );
    }

    return res;
  } catch(err) {
    !noToast && toast.error(
      typeof res?.message == 'string' ?
      res?.message : JSON.stringify(res?.message)
    );
    return ({
      message: err?.message || err,
      status: null,
      data: [],
      meta_data: {}
    });
  };
}

export default clientAxiosRequest