import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCookies } from '@/config/cookies'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'
import { RefreshStoredToken } from '@/components/globalComponents'
import AppLayoutClient from './AppLayoutClient'

export const metadata: Metadata = {
  title: 'Aperta - App',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!await getCookies('aperta-user-accessToken')) {
    redirect('/signin')
  } else {
    const fetchedDetails : any = await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyDetails(),
      method: 'GET',
      data: null
    });

    const fetchedProfile: any = await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getProfile(),
      method: 'GET',
      data: null
    });

    const fetchSettings : any = await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getSettings({
        type: 'general'
      }),
      method: 'GET',
      data: null
    });

    /** REFRESH TOKEN CHECK */
    let refreshTokenRes = null; 
  
    if (fetchedDetails?.status == 401) {
      refreshTokenRes = await applyAxiosRequest({
        headers: { },
        apiEndpoint: API?.refreshToken(),
        method: 'POST',
        data: {
          refreshToken: `${await getCookies('aperta-user-refreshToken')}`
        }
      });

      if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
        return <Logout />
      }
    }
  
    let details = fetchedDetails?.data;
    let profile = fetchedProfile?.data;
    let settings = fetchSettings?.data;
    let showBanner = Boolean(
      profile?.user?.role?.parent?.slug == 'api-consumer' && 
      !details?.isVerified
    );

    const canToggleMode = ((
        details?.isVerified && 
        profile?.user?.role?.parent?.slug === 'api-consumer'
      ) 
      || profile?.user?.role?.parent?.slug === 'api-provider');

    return (
      <>
        {/* REFRESH TOKEN SECTION */}
        {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

        <AppLayoutClient
          profile={profile}
          companyDetails={details}
          settings={settings}
          showBanner={showBanner}
          canToggleMode={canToggleMode}
          refreshTokenData={refreshTokenRes?.data}
        >
          {children}
        </AppLayoutClient>
      </>
    )
  }
}
