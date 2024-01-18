import type { Metadata } from 'next'
import { AppLeftSideBar, AppNavBar, KybBanner } from '../(components)'
import { redirect } from 'next/navigation'
import { getCookies } from '@/config/cookies'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'

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
  
    if (fetchedDetails?.status == 401) {
      return <Logout />
    }
  
    let details = fetchedDetails?.data;
    let profile = fetchedProfile?.data;
    let showBanner = Boolean(
      details?.type == 'licensed-entity' && 
      profile?.user?.role?.parent?.slug == 'api-consumer' && 
      !details?.isVerified
    );

    // console.log('details type >>>', details?.type);

    return (
      <section className='max-w-full min-h-screen relative bg-[#FCFDFD]'>
        { 
          profile?.user?.role?.parent?.slug == 'api-consumer' && 
          showBanner && 
          <KybBanner rawData={details} /> 
        }
        <AppNavBar bannerExist={showBanner} />
        <AppLeftSideBar bannerExist={showBanner} />

        <main className={`w-full min-h-screen flex flex-col ${showBanner ? 'pt-[168px]' : 'pt-[112px]'} pb-[25px] wide:pl-[360px] pl-[330px] wide:pr-[80px] pr-[25px] overflow-auto`}>
          <section className='w-full h-full flex flex-col'>
            {children}
          </section>
        </main>
      </section>
    )
  }
}
