// @ts-nocheck
'use client'

import { getJsCookies, removeJsCookies } from "@/config/jsCookie";
import { applyAxiosRequest } from ".";
import { HttpRequestProps } from "@/types/configTypes";
import { toast } from "react-toastify";

const clientAxiosRequest = async ({
  headers,
  apiEndpoint,
  method,
  data,
  noToast,
}: HttpRequestProps) => {
  const token = getJsCookies('aperta-user-accessToken')

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
    } else if (res.status == 403 || res.status == 401) {
      !noToast && toast.error(res?.message);
      removeJsCookies('aperta-user-accessToken');
      window.location.href = '/';
    } else {
      !noToast && toast.error(res?.message);
    }

    return res;
  } catch(err) {
    !noToast && toast.error(err?.message || err);
    return ({
      message: err?.message || err,
      status: null,
      data: [],
      meta_data: {}
    });
  };
}

export default clientAxiosRequest