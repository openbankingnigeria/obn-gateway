'use client'

import { AppCenterModal, CodeEditor, ListPanel, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { Button } from '@/components/globalComponents';
import { API_CONFIGURATION_PANEL } from '@/data/collectionDatas';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { APIConfigurationProps } from '@/types/webappTypes/appTypes';
import React, { useEffect, useState } from 'react';
import * as API from '@/config/endpoints';
import { getJsCookies } from '@/config/jsCookie';
import { EnableTwoFactorAuth } from '../../../profile/(components)';
import TwoFactoAuthEnabled from '../../../profile/(components)/TwoFactoAuthEnabled';

const TransformationForm = ({
  rawData,
  profileData,
  preview
}: APIConfigurationProps) => {
  const paths = API_CONFIGURATION_PANEL;
  const [request_body, setRequestBody] = useState('');
  const [response_body, setResponseBody] = useState('');
  const [request_header, setRequestHeader] = useState('');
  const [response_header, setResponseHeader] = useState('');

  const [openModal, setOpenModal] = useState('');
  const [qrcode_key, setQRCodeKey] = useState('');
  const [qrcode_image, setQRCodeImage] = useState('');
  const [code, setCode] = useState('');
  const [backup_codes, setBackupCodes] = useState([]);

  const userType = profileData?.user?.role?.parent?.slug;

  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const environment = getJsCookies('environment');
  const [path, setPath] = useState('request_body');
  const previewPage = preview == 'true';

  async function fetchAPITransformation() {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPITransformation({
        environment: environment || 'development',
        id: rawData?.id
      }),
      method: 'GET',
      data: null,
      noToast: true
    });

    setResponseBody(result?.data?.downstream);
    setRequestBody(result?.data?.upstream)
  }

  useEffect(() => {
    fetchAPITransformation();
  }, []);

  const incorrect = (
    !request_body ||
    !response_body
  )

  const close2FAModal = () => {
    setOpen2FA(false);
  }

  const handleSubmit = async (e: any, code: string,) => {
    e && e.preventDefault();
    if (profileData?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      const result: any = await clientAxiosRequest({
          headers: code ? { 'X-TwoFA-Code' : code, } : {},
          apiEndpoint: API.updateAPITransformation({ 
            environment: environment || 'development', 
            id: rawData?.id
          }),
          method: 'PUT',
          data: {
            "downstream": response_body,
            "upstream": request_body,
          }
        });

      if (result?.message) {
        /* IF 2FA IS NOT ENABLED, PLEASE ENABLE */
        if(result?.message?.toLowerCase()?.includes('2fa')) {
          const result: any = await clientAxiosRequest({
            headers: {},
            apiEndpoint: API.postSetup2FA(),
            method: 'POST',
            data: null
          });
    
          if (result?.status == 201) {
            setQRCodeKey(result?.data?.otpAuthURL?.split('secret=')[1]);
            setQRCodeImage(result?.data?.qrCodeImage)
            setOpenModal('enable2fa');
          }
        }
        close2FAModal();
        setLoading(false);
        // router.refresh();
      }
    }
  }

  // console.log(
  //   `request_body >>>> ${request_body}, `, 
  //   `response_body >>>> ${response_body}, `, 
  //   `request_header >>>> ${request_header}, `, 
  //   `response_header >>>> ${response_header}, `,
  //   `path >>>> ${path}`)

  const handle2FA = (value: string) => {
    handleSubmit('', value); 
  };

  const handleCloseModal = () => {
    setOpenModal('')
    window.location.reload();
  }

  const handleEnable2fa = async () => {
    setLoading(true);
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.verify2FA(),
      method: 'PATCH',
      data: { code }
    });

    if (result?.status == 200) {
      setLoading(false);
      setBackupCodes(result?.data);
      setOpenModal('backupcode');
    } else {
      setLoading(false);
    }
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

      {
        (openModal == 'enable2fa' || openModal == 'backupcode') &&
        <AppCenterModal
          title={
            openModal == 'enable2fa' ? 
              'Enable Two-Factor Authentication' :
              'Two-Factor Authentication Enabled'
          }
          effect={handleCloseModal}
        >
          {
            openModal == 'enable2fa' ? 
              <EnableTwoFactorAuth 
                close={handleCloseModal}
                next={handleEnable2fa}
                qrcode_key={qrcode_key}
                qrcode_image={qrcode_image}
                loading={loading}
                setCode={setCode}
              /> 
              :
              <TwoFactoAuthEnabled 
                backup_codes={backup_codes}
                close={handleCloseModal}
              />
          }
        </AppCenterModal>
      }

      <form onSubmit={(e) => handleSubmit(e, '')} className='w-full'>
        <div className='flex items-start w-full justify-between gap-[40px] pb-[20px]'>
          <div className='w-[40%] text-f14 font-[500] text-o-text-dark'>
            Transformation
          </div>

          <div className='flex bg-white rounded-[12px] border border-o-border gap-[16px] flex-col px-[24px] pt-[10px] pb-[24px] w-[60%]'>
            <div className='w-full'>
              <ListPanel 
                panel={paths}
                currentValue={path}
                setCurrentValue={setPath}
              />
            </div>

            {
              path == 'request_body' &&
              <div className='w-full'>
                <CodeEditor 
                  code={request_body}
                  setCode={
                    userType == 'api-consumer' ? 
                      ()=> null : 
                      setRequestBody
                  }
                />
              </div>
            }

            {
              path == 'request_header' &&
              <div className='w-full'>
                <CodeEditor 
                  code={request_header}
                  setCode={
                    userType == 'api-consumer' ? 
                      ()=> null : 
                      setRequestHeader
                  }
                />
              </div>
            }

            {
              path == 'response_body' &&
              <div className='w-full'>
                <CodeEditor 
                  code={response_body}
                  setCode={
                    userType == 'api-consumer' ? 
                      ()=> null : 
                      setResponseBody
                  }
                />
              </div>
            }

            {
              path == 'response_header' &&
              <div className='w-full'>
                <CodeEditor 
                  code={response_header}
                  setCode={
                    userType == 'api-consumer' ? 
                      ()=> null : 
                      setResponseHeader
                  }
                />
              </div>
            }

            {
              !previewPage &&
              <div className='w-full flex justify-end'>
                <Button 
                  title='Save changes'
                  type='submit'
                  containerStyle='!w-[120px]'
                  disabled={incorrect}
                  small
                />
              </div>
            }
          </div>
        </div>
      </form>
    </>
  )
}

export default TransformationForm