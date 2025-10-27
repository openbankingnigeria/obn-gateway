import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCookies } from '@/config/cookies'
import Logout from '@/components/globalComponents/Logout'
import { RefreshStoredToken } from '@/components/globalComponents'
import AppLayoutClient from './AppLayoutClient'
import { getUserBootstrapData } from '@/server/getUserBootstrapData'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import {
  primeCompanyDetailsQuery,
  primeProfileQuery,
  primeSettingsQuery,
} from '@/hooks/queries/userQueryKeys'

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
    const bootstrap = await getUserBootstrapData();

    if (bootstrap.shouldLogout) {
      return <Logout />
    }

    const queryClient = new QueryClient();
    primeCompanyDetailsQuery(queryClient, bootstrap.companyDetails);
    primeProfileQuery(queryClient, bootstrap.profile);
    primeSettingsQuery(queryClient, bootstrap.settings);

    const dehydratedState = dehydrate(queryClient);

    const details = bootstrap.companyDetails;
    const profile = bootstrap.profile;
    const settings = bootstrap.settings;
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
          bootstrap.refreshTokenData &&
          <RefreshStoredToken 
            data={bootstrap.refreshTokenData} 
          />
        }

        <AppLayoutClient
          profile={profile}
          companyDetails={details}
          settings={settings}
          showBanner={showBanner}
          canToggleMode={canToggleMode}
          dehydratedState={dehydratedState}
        >
          {children}
        </AppLayoutClient>
      </>
    )
  }
}
