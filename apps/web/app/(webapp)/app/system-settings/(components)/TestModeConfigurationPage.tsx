'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import { TEST_MODE_CONFIGURATION_DATA } from '@/data/systemSettingsData';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { APIConfigurationProps } from '@/types/webappTypes/appTypes';
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import React, { ChangeEvent, useState } from 'react'
import { toast } from 'react-toastify';
import * as API from '@/config/endpoints';
import { AppCenterModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { findPermissionSlug } from '@/utils/findPermissionSlug';

const TestModeConfigurationPage = ({ rawData, profileData }: APIConfigurationProps) => {
  /* API CONSUMERS */
  const [loadingReset, setLoadingReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [buttonName, setButtonName] = useState(rawData?.key ? 'Reset keys' : 'Generate keys');
  const environment = 'development';
  let userPermissions = profileData?.user?.role?.permissions;
  let updateSettings = findPermissionSlug(userPermissions, 'update-system-setting')
  let viewAPIKey = findPermissionSlug(userPermissions, 'view-api-key')
  let resetAPIKey = findPermissionSlug(userPermissions, 'reset-api-key')
  let viewRestriction = findPermissionSlug(userPermissions, 'view-api-restrictions')
  let setRestrictions = findPermissionSlug(userPermissions, 'set-api-restrictions')

  const [form, setForm] = useState({
    // test_secret_key: 'pspk_test_f8q9u9kg5ocosk1kqlgolgxuzu0wmk6coo6smceg',
    // name: 'Test API',
    // description: 'User can push changes on test mode',
    test_api_key: rawData?.key || '',
    // webhook_url: 'https://webhook.com/url',
    // callback_url: 'https://callback.com/url',
    ip_whitelist: rawData?.ips?.join(',') || '',
    clientId: rawData?.clientId
    // timeout: ''
  });

  const testModeConfig = TEST_MODE_CONFIGURATION_DATA({
    // test_secret_key: '•••••••••••••••••••••••••••••••••••••••••••••',
    // name: form?.name,
    // description: form?.description,
    test_api_key: form?.test_api_key,
    // webhook_url: form?.webhook_url,
    // callback_url: form?.callback_url,
    ip_whitelist: form?.ip_whitelist,
    clientId: form?.clientId
    // timeout: form?.timeout
  });

  // const incorrect = (
  //   // !form?.name ||
  //   // !form?.description ||
  //   !form?.test_api_key ||
  //   // !form?.webhook_url ||
  //   // !form?.callback_url ||
  //   !form?.ip_whitelist
  //   // !form?.timeout
  // )

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  };

  // const handleCopy = (value: string) => {
  //   copyTextToClipboard(value)
  //     .then(() => {
  //       console.log('Copied.');
  //       toast.success('Test key copied');
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       toast.error('Error copying Test key');
  //     });
  // };

  const handleCopy = (value: string) => {
    copyTextToClipboard(value)
      .then((success) => {
        if (success) {
          console.log('Copied.');
          toast.success('Test key copied');
        } else {
          console.log('Copy failed.');
          toast.error('Error copying Test key');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error copying Test key');
      });
  };

  const isChanged = (
    // form?.name != 'Test API' ||
    // form?.description != 'User can push changes on test mode'||
    // form?.test_api_key != rawData?.key ||
    // form?.webhook_url != 'https://webhook.com/url' ||
    // form?.callback_url != 'https://callback.com/url' ||
    form?.ip_whitelist != (rawData?.ips?.join(',') || '') ||
    form?.clientId != rawData?.clientId
    // form?.timeout != ''
  );

  const close2FAModal = () => {
    setOpen2FA(false);
  }

  const handleReset = async (e: any, code: string) => {
    e && e.preventDefault();
    if (profileData?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoadingReset(true);
      const result: any = await clientAxiosRequest({
        headers: code ? { 'X-TwoFA-Code' : code, } : {},
        apiEndpoint: API.updateAPIKey({
          environment,
        }),
        method: 'PUT',
        data: {}
      });

      setLoadingReset(false);
      if (result?.status == '200') {
        setForm({
          ...form,
          test_api_key: result?.data?.key 
        })
        setButtonName('Reset keys');
        close2FAModal();
      }
    }
  }

  const handle2FA = (value: string) => {
    handleReset('', value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result: any = form?.ip_whitelist && await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.updateIPWhitelist({
        environment,
      }),
      method: 'PUT',
      data: {
        ips: form?.ip_whitelist?.split(',')?.map((ip: string) => ip?.trim())
      }
    });

    const result2: any = form?.clientId && await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.putClientId({
        environment
      }),
      method: 'PUT',
      data: { 
        clientId: form?.clientId
      }
    })

    setLoading(false);
    if (result?.status == '200') { }
    if (result2?.status == 200) { }
  }

  return (
    <>
      {
        open2FA &&
          <AppCenterModal
            title={'Two-Factor Authentication'}
            effect={close2FAModal}
          >
            <TwoFactorAuthModal
              close={close2FAModal}
              loading={loading}
              next={(value: string) => handle2FA(value)}
            />
          </AppCenterModal>
      }

      <form
        onSubmit={handleSubmit}
        className='gap-[20px] flex flex-col w-full pb-[24px]'
      >
        <div className='w-full justify-between flex items-start gap-5'>
          <div className='w-full flex flex-col gap-[4px]'>
            <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
              Test Mode Configuration
            </h3>
          </div>

          <div className='w-fit flex items-center gap-[8px]'>
            {
              (resetAPIKey) &&
              <Button 
              title={ buttonName }
              type='button'
              outlined
              loading={loadingReset}
              effect={(e) => handleReset(e, '')}
              containerStyle='!w-fit'
              small
            />
            }

            {
              // (resetAPIKey || setRestrictions) && updateSettings &&
              // updateSettings &&
                <Button 
                title='Save changes'
                type='submit'
                containerStyle='!w-[120px]'
                // disabled={incorrect || !isChanged}
                disabled={!isChanged}
                small
              />
            }
          </div>
        </div>

        <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
          {
            testModeConfig?.map((data) => (
              findPermissionSlug(userPermissions, data?.permit) &&
              <div 
                key={data?.id}
                className='w-full last-of-type:border-0 last-of-type:pb-0 flex items-start justify-between gap-[40px] pb-[20px] border-b border-o-border'
              >
                <div className='w-[40%] flex flex-col gap-[8px]'>
                  <label 
                    className='text-f14 font-[500] text-o-text-dark'
                    htmlFor={data?.name}
                  >
                    {data?.label}
                  </label>

                  <div className='text-f14 text-o-text-medium3'>
                    {data?.description}
                  </div>
                </div>

                <div className='w-[60%]'>
                  <InputElement 
                    name={data?.name}
                    type={data?.type}
                    placeholder=''
                    disabled={data?.name?.includes('key')}
                    value={data?.value}
                    changeEvent={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
                    // required={!(data?.name == 'ip_whitelist')}
                    rightIcon={
                      data?.rightLabel == 'copy' ?
                        <div 
                          className='w-fit h-fit cursor-pointer'
                          onClick={() => handleCopy(
                            // data?.name == 'test_secret_key' ? 
                            //   form?.test_secret_key : 
                              data?.value || ''
                          )}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_875_9886)">
                              <path d="M6.66669 6.66699V4.33366C6.66669 3.40024 6.66669 2.93353 6.84834 2.57701C7.00813 2.2634 7.2631 2.00844 7.5767 1.84865C7.93322 1.66699 8.39993 1.66699 9.33335 1.66699H15.6667C16.6001 1.66699 17.0668 1.66699 17.4233 1.84865C17.7369 2.00844 17.9919 2.2634 18.1517 2.57701C18.3334 2.93353 18.3334 3.40024 18.3334 4.33366V10.667C18.3334 11.6004 18.3334 12.0671 18.1517 12.4236C17.9919 12.7372 17.7369 12.9922 17.4233 13.152C17.0668 13.3337 16.6001 13.3337 15.6667 13.3337H13.3334M4.33335 18.3337H10.6667C11.6001 18.3337 12.0668 18.3337 12.4233 18.152C12.7369 17.9922 12.9919 17.7372 13.1517 17.4236C13.3334 17.0671 13.3334 16.6004 13.3334 15.667V9.33366C13.3334 8.40024 13.3334 7.93353 13.1517 7.57701C12.9919 7.2634 12.7369 7.00844 12.4233 6.84865C12.0668 6.66699 11.6001 6.66699 10.6667 6.66699H4.33335C3.39993 6.66699 2.93322 6.66699 2.5767 6.84865C2.2631 7.00844 2.00813 7.2634 1.84834 7.57701C1.66669 7.93353 1.66669 8.40024 1.66669 9.33366V15.667C1.66669 16.6004 1.66669 17.0671 1.84834 17.4236C2.00813 17.7372 2.2631 17.9922 2.5767 18.152C2.93322 18.3337 3.39993 18.3337 4.33335 18.3337Z" 
                                stroke="#666D80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill='transparent' 
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_875_9886">
                                <rect width="20" height="20" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                        :
                        <span className='text-f14 whitespace-nowrap text-o-text-muted2'>
                          {data?.rightLabel}
                        </span>
                    }
                  />
                </div>
              </div>
            ))
          }
        </div>
      </form>
    </>
  )
}

export default TestModeConfigurationPage