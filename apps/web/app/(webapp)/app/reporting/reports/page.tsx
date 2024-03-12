import React from 'react'
import { Report, ReportForms } from './(components)'
import { ReportingSection } from '@/app/(webapp)/(components)'
import Logout from '@/components/globalComponents/Logout';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import { getCookies } from '@/config/cookies';
import { RefreshStoredToken } from '@/components/globalComponents';

const ReportsPage = async () => {
  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  const fetchedDetails: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyDetails(),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedProfile?.status == 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: { },
      apiEndpoint: API?.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${getCookies('aperta-user-refreshToken')}`
      }
    });

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  let profile = fetchedProfile?.data;
  let companyDetails = fetchedDetails?.data;

  return (
    <div className='w-full flex flex-col gap-[20px]'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      <h3 className='text-o-text-dark text-f18 font-[500]'>
        Reports
      </h3>

      <div className='w-full flex flex-col items-start gap-[20px]'>
        {/* <ReportForms />
        <Report /> */}

        <ReportingSection 
          profile_data={profile}
          alt_data={companyDetails}
        />
      </div>
    </div>
  )
}

export default ReportsPage