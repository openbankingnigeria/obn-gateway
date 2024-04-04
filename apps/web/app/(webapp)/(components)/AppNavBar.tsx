'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { getElementAndBelow } from '@/utils/getElementAndBelow';
import Link from 'next/link';
import { ToggleSwitch } from '../../../components/forms';
import { NOTIFICATIONS_DATA } from '@/data/notificationData';
import { Button, OutsideClicker } from '../../../components/globalComponents';
import { AppCenterModal, AvatarMenu, NotificationBox } from '.';
import { toast } from 'react-toastify';
import { getJsCookies, removeJsCookies, setJsCookies } from '@/config/jsCookie';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';

const AppNavBar = ({ bannerExist }: { bannerExist: boolean }) => {
  const [openModal, setOpenModal] = useState(false);
  const [isLive, setToggleMode] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSwitch, setLoadingSwitch] = useState(false);
  const router = useRouter();
  const { get } = useSearchParams();
  const slug = get('slug');
  const [profile, setProfile] = useState<any>(null);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  // const getUserProfile = getJsCookies('aperta-user-profile');
  // const userProfile = getUserProfile ? JSON.parse(getUserProfile) : null;

  useEffect(() => {
    const enviromentMode = getJsCookies('environment');
    setToggleMode(enviromentMode == 'production' ? true : false)
  }, []);

  const fetchProfile = async() => {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getProfile(),
      method: 'GET',
      data: null,
      noToast: true
    });

    setProfile(result?.data);
  }

  const fetchDetails = async () => {
    const result : any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyDetails(),
      method: 'GET',
      data: null,
      noToast: true
    });

    setBusinessDetails(result?.data);
  }

  useEffect(() => {
    fetchProfile();
    fetchDetails();
  }, []);

  let firstName = profile?.firstName;
  let lastName = profile?.lastName;
  let avatarAlt = `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`

  const unReadNotifications = NOTIFICATIONS_DATA;
  const notifications = NOTIFICATIONS_DATA?.slice(0, 5);

  const pathname = usePathname();
  const paths = pathname?.split('/');
  const sanitizedPaths = paths?.filter(path => path);
  const lastPath = sanitizedPaths[sanitizedPaths?.length - 1];

  const generatePath = (path: string): string => {
    const result = getElementAndBelow(sanitizedPaths, path)
    const elementsBelow = result?.elementsBelow;
    const url = `${elementsBelow?.length >= 1 ? '/' : ''}${elementsBelow?.toString()?.replace(/,/g, '/')}`;

    return url;
  };

  const handleLogout = () => {
    setLoadingLogout(true);
    removeJsCookies('aperta-user-accessToken');
    router.refresh();
  }

  const handleToggle = (value: boolean) => {
    setOpenModal(true);
  }

  const handleCloseModal = () => {
    setOpenModal(false);
  }

  const handleSwitch = (mode: string) => {
    setLoadingSwitch(true);
    // setToggleMode(prev => !prev);
    setJsCookies(
      'environment', 
      isLive ? 
        'development' : 
        'production'
      );
    handleCloseModal();
    window?.location?.reload();
    setLoadingSwitch(false);
    toast.success(`You’ve successfully switched to ${mode} Mode`);
  }

  return (
    <>
      {
        openModal && 
          <AppCenterModal
            title={isLive ? 'Switch to Test Mode?' : 'Switch to Live Mode?'}
            effect={handleCloseModal}
          >
            <div className='flex flex-col gap-[24px] w-full'>
              <div className='text-o-text-medium text-f14'>
                {
                  isLive  ?
                    `You\'re about to switch to Test Mode. 
                    This will disable all live transactions. 
                    Are you sure you want to proceed?`
                    :
                    `You are about to switch to Live Mode, 
                    enabling all transactional features. 
                    Are you certain you want to proceed?`
                }
              </div>

              <div className='flex items-center justify-between gap-5'>
                <Button 
                  title='Cancel'
                  effect={handleCloseModal}
                  outlined
                  small
                  containerStyle='!w-fit'
                />
                
                <Button 
                  title={isLive ? 'Switch to Test Mode' : 'Switch to Live Mode'}
                  effect={() => handleSwitch(isLive ? 'Test' : 'Live')}
                  loading={loading}
                  small
                  containerStyle='!w-[165px]'
                />
              </div>
            </div>
          </AppCenterModal>
      }
      <nav className={`bg-white z-[101] fixed ${bannerExist ? 'top-[56px]' : 'top-0'} left-[280px] right-0 px-[32px] py-[20px] flex items-center justify-between gap-[24px] border-b border-o-border`}>
        <section className='w-full gap-[4px] flex items-center'>
          {
            sanitizedPaths?.map((path, index) => (
              path == 'app' ? null :
              <div 
                key={index}
                className='flex items-center gap-[4px] whitespace-nowrap'
              >
                <Link
                  href={generatePath(path)}
                  className={`${(path == lastPath) ? 'text-o-text-dark' : 'text-o-text-muted2 hover:text-o-text-dark3 hover:bg-[#F3F6FB]'} 
                  rounded-[4px] py-[2px] px-[6px] text-f14 capitalize cursor-pointer whitespace-nowrap`}
                >
                  {
                    (slug && path == lastPath) ?
                     decodeURI(slug) :
                     decodeURI(path)?.replace('api', 'API')?.replace(/-/g, ' ')
                  }
                </Link>

                {
                  (path !== lastPath) &&
                  <div className='w-fit text-o-text-muted2 text-f14'>
                    /
                  </div>
                }
              </div>
            ))
          }
        </section>

        <section className='w-full items-center flex gap-[12px] justify-end'>
          {/* TOGGLE SWITCH */}
          <div className='flex items-center w-fit gap-[8px]'>
            <ToggleSwitch 
              toggle={isLive ? true : false}
              loading={loadingSwitch}
              disabled={!(businessDetails?.isVerified)}
              setToggle={(value) => handleToggle(value)}
            />

            <div className={`w-fit ${!(businessDetails?.isVerified) && 'opacity-50'} ${isLive ? 'text-o-green2' : 'text-o-red'} whitespace-nowrap text-f14 font-[500]`}>
              {
                loadingSwitch ?
                  'Loading...' :
                    isLive ? 'Live Mode' :
                    'Test Mode'
              }
            </div>
          </div>

          {/* NOTIFICATIONS */}
          {/* <div className='relative w-fit h-fit'>
            <div
              onClick={() => setOpenNotification(prev => !prev)}
              className='w-fit h-fit hidden md:block cursor-pointer relative'
            >
              {
                unReadNotifications?.length >= 1 &&
                <div className='w-[8px] h-[8px] absolute rounded-full top-[0px] left-[11px] bg-o-status-green' />
              }

              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M7.79496 17.5001C8.38257 18.0187 9.15444 18.3334 9.99981 18.3334C10.8452 18.3334 11.6171 18.0187 12.2047 17.5001M14.9998 6.66675C14.9998 5.34067 14.473 4.0689 13.5353 3.13121C12.5977 2.19353 11.3259 1.66675 9.99981 1.66675C8.67373 1.66675 7.40196 2.19353 6.46428 3.13121C5.5266 4.0689 4.99981 5.34067 4.99981 6.66675C4.99981 9.2419 4.3502 11.005 3.62453 12.1713C3.01242 13.155 2.70636 13.6468 2.71758 13.784C2.73001 13.936 2.7622 13.9939 2.88463 14.0847C2.99519 14.1667 3.49364 14.1667 4.49052 14.1667H15.5091C16.506 14.1667 17.0044 14.1667 17.115 14.0847C17.2374 13.9939 17.2696 13.936 17.282 13.784C17.2933 13.6468 16.9872 13.155 16.3751 12.1713C15.6494 11.005 14.9998 9.2419 14.9998 6.66675Z" 
                  stroke="#666D80" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill='transparent'
                />
              </svg>
            </div>

            {
              openNotification &&
              <div className='absolute w-fit h-fit -right-[80px] top-10'>
                <OutsideClicker func={() => setOpenNotification(false)}>
                  <NotificationBox
                    notifications={notifications}
                    close={() => setOpenNotification(false)}
                  />
                </OutsideClicker>
              </div>
            }
          </div> */}

          <div className='relative py-1 group'>
            <div className='group px-[8px] cursor-pointer flex items-center gap-[8px]'>
              <div className='uppercase w-[32px] h-[32px] rounded-full text-f14 font-[500] text-white flex items-center justify-center bg-[#459572]'>
                {avatarAlt}
              </div>

              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 18 18" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className='group-hover:rotate-[180deg] transition-all'
              >
                <path 
                  d="M4.5 6.75L9 11.25L13.5 6.75" 
                  stroke="#666D80" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill='transparent'
                />
              </svg>
            </div>

            <AvatarMenu
              loadingLogout={loadingLogout}
              handleLogout={handleLogout}
            />
          </div>
        </section>
      </nav>
    </>
  )
}

export default AppNavBar