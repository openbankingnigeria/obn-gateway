'use client'

import { useEffect } from 'react';
import { useUserStore } from '@/stores';
import { AppLeftSideBar, AppNavBar, KybBanner } from '../(components)';
import LogoutTimer from '@/components/globalComponents/LogoutTimer';

interface AppLayoutClientProps {
  profile: any;
  companyDetails: any;
  settings: any;
  showBanner: boolean;
  canToggleMode: boolean;
  refreshTokenData?: any;
  children: React.ReactNode;
}

export default function AppLayoutClient({
  profile,
  companyDetails,
  settings,
  showBanner,
  canToggleMode,
  refreshTokenData,
  children,
}: AppLayoutClientProps) {
  const setProfile = useUserStore((state) => state.setProfile);
  const setCompanyDetails = useUserStore((state) => state.setCompanyDetails);
  const setSettings = useUserStore((state) => state.setSettings);

  // Hydrate the store with server-fetched data on mount
  useEffect(() => {
    if (profile) setProfile(profile);
    if (companyDetails) setCompanyDetails(companyDetails);
    if (settings) setSettings(settings);
  }, [profile, companyDetails, settings, setProfile, setCompanyDetails, setSettings]);

  return (
    <section className='max-w-full min-h-screen relative bg-[#FCFDFD]'>
      {
        profile?.user?.role?.parent?.slug == 'api-consumer' && 
        showBanner && 
        <KybBanner rawData={companyDetails} /> 
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
  );
}
