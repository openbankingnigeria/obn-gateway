'use client'

import { getJsCookies } from "@/config/jsCookie";
import { applyAxiosRequest } from ".";
import { HttpRequestProps } from "@/types/configTypes";
import { toast } from "react-toastify";
import * as API from '@/config/endpoints';
import { useAuthStore } from '@/stores';

const clientAxiosRequest = async ({
  headers,
  apiEndpoint,
  method,
  data,
  noToast,
}: HttpRequestProps) => {
  const authState = useAuthStore.getState();
  let token = authState.accessToken || getJsCookies('aperta-user-accessToken');
  let refreshToken = authState.refreshToken || getJsCookies('aperta-user-refreshToken');

  try {
    let res: any = await applyAxiosRequest({
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
        let refreshTokenRes: any = await applyAxiosRequest({
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
          token = refreshTokenRes?.data?.accessToken;
          refreshToken = refreshTokenRes?.data?.refreshToken;

          useAuthStore.getState().setTokens({
            accessToken: token,
            refreshToken,
          });

          res = await applyAxiosRequest({
            headers: {
              Authorization: `Bearer ${token}`,
              ...headers
            },
            apiEndpoint,
            method,
            data
          });

          if (!noToast && (res.status === 200 || res.status === 201)) {
            toast.success(res.message);
          }
        } else {
          !noToast && toast.error(
            typeof refreshTokenRes?.message == 'string' ?
            refreshTokenRes?.message : JSON.stringify(refreshTokenRes?.message)
          );
          useAuthStore.getState().clearTokens();
          window.location.href = '/';
        }
    } else {
      !noToast && toast.error(
        typeof res?.message == 'string' ?
        res?.message : JSON.stringify(res?.message)
      );
    }

    return res;
  } catch(err: any) {
    !noToast && toast.error(
      typeof err?.message == 'string' ?
      err?.message : JSON.stringify(err?.message)
    );
    useAuthStore.getState().clearTokens(false);
    return ({
      message: err?.message || err,
      status: null,
      data: [],
      meta_data: {}
    });
  };
}

export default clientAxiosRequest