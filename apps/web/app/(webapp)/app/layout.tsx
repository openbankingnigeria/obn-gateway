import type { Metadata } from 'next'
import { AppLeftSideBar, AppNavBar, KybBanner } from '../(components)'
import { redirect } from 'next/navigation'
import { getCookies } from '@/config/cookies'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'
import { RefreshStoredToken } from '@/components/globalComponents'
import LogoutTimer from '@/components/globalComponents/LogoutTimer'

export const metadata: Metadata = {
  title: 'Aperta - App',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!getCookies('aperta-user-accessToken')) {
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
          refreshToken: `${getCookies('aperta-user-refreshToken')}`
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
      <section className='max-w-full min-h-screen relative bg-[#FCFDFD]'>
        {/* REFRESH TOKEN SECTION */}
        {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

        { 
          profile?.user?.role?.parent?.slug == 'api-consumer' && 
          showBanner && 
          <KybBanner rawData={details} /> 
        }
        <AppNavBar 
          bannerExist={showBanner} 
          canToggleMode={canToggleMode}
        />
        <AppLeftSideBar bannerExist={showBanner} />

        {/* INACTIVITY LOGOUT TIMER */}
        {
          settings?.inactivityTimeout?.value && 
          <LogoutTimer 
            timeout={1000 * 60 * Number(settings?.inactivityTimeout?.value)} 
          />
        }

        <main className={`w-full min-h-screen flex flex-col ${showBanner ? 'pt-[168px]' : 'pt-[112px]'} pb-[25px] wide:pl-[360px] pl-[330px] wide:pr-[80px] pr-[25px] overflow-auto`}>
          <section className='w-full h-full flex flex-col'>
            {children}
          </section>
        </main>
      </section>
    )
  }
}
