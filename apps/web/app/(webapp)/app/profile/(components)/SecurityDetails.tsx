'use client'

import { AppCenterModal, AppRightModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { ToggleSwitch } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import React, { useState } from 'react'
import { ChangePasswordForm, EnableTwoFactorAuth, PasswordChangedSuccessfully } from '.'
import { useRouter } from 'next/navigation'
import TwoFactoAuthEnabled from './TwoFactoAuthEnabled'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import * as API from '@/config/endpoints';

const SecurityDetails = ({
  successful,
  profile
}: {
  successful: boolean,
  profile: any
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState('');
  const [enable2FA, setToggle2FA] = useState(profile?.user?.twofaEnabled);
  const [qrcode_key, setQRCodeKey] = useState('');
  const [qrcode_image, setQRCodeImage] = useState('');
  const [code, setCode] = useState('');
  const [backup_codes, setBackupCodes] = useState([]);

  const handleOpenModal = (type: string) => {
    setOpenModal(type)
  }

  const handleCloseModal = () => {
    setOpenModal('')
  }

  const handleToggle2FA = async (code: string) => {
    if (enable2FA) {
      // DISABLE 2FA
      if (!code) {
        handleOpenModal('disable2fa');
      } else {
        setLoading(true);
        const result: any = await clientAxiosRequest({
          headers: {},
          apiEndpoint: API.disable2FA(),
          method: 'PATCH',
          data: {
            code: code,
          }
        });

        setLoading(false);
        if (result?.status == 200) {
          setToggle2FA((prev: boolean) => !prev);
          handleCloseModal();
        }
      }
    } else {
      // ENABLE 2FA
      const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.postSetup2FA(),
        method: 'POST',
        data: null
      });

      if (result?.status == 201) {
        setQRCodeKey(result?.data?.otpAuthURL?.split('secret=')[1]);
        setQRCodeImage(result?.data?.qrCodeImage)
        handleOpenModal('enable2fa');
      }
    }
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
      setToggle2FA(true);
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
        (openModal == 'password') &&
        <AppRightModal
          title={'Change Password'}
          effect={handleCloseModal}
          childrenStyle='!px-0'
        >
          <ChangePasswordForm 
            profile={profile}
            close={() => handleCloseModal()}
          />
        </AppRightModal>
      }

      {
        successful &&
        <AppCenterModal
          effect={() => router.push('/app/profile')}
          modalStyles='!w-[400px] !h-fit'
        >
          <PasswordChangedSuccessfully />
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

      {
        openModal == 'disable2fa' &&
          <AppCenterModal
            title={'Two-Factor Authentication'}
            effect={handleCloseModal}
          >
            <TwoFactorAuthModal
              close={handleCloseModal}
              loading={loading}
              next={handleToggle2FA}
            />
          </AppCenterModal>
      }

      <section className='gap-[20px] flex flex-col w-full'>
        <div className='w-full justify-between flex items-start gap-5'>
          <div className='w-full flex flex-col gap-[4px]'>
            <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
              Security
            </h3>

            <div className='text-f14 text-o-text-medium3'>
              Manage your password and 2FA
            </div>
          </div>

          {/* <Button 
            title='Save changes'
            disabled
            small
          /> */}
        </div>

        <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
          <div className='w-full flex items-start justify-between gap-[7px] pb-[20px] border-b border-o-border'>
            <div className='w-full flex flex-col gap-[8px]'>
              <div className='text-f14 font-[500] text-o-text-dark'>
                Password
              </div>

              <div className='text-f14 text-o-text-medium3'>
                Change your current password
              </div>
            </div>

            <div className='w-full flex items-start justify-end'>
              <Button 
                title='Change Password'
                effect={() => handleOpenModal('password')}
                outlined
                small
              />
            </div>
          </div>

          <div className='w-full flex items-start justify-between gap-[7px]'>
            <div className='w-full flex flex-col gap-[8px]'>
              <label 
                className='text-f14 font-[500] text-o-text-dark'
                htmlFor='role'
              >
                Enable Two-Factor Authentication
              </label>

              <div className='text-f14 text-o-text-medium3'>
                Two-Factor authentication adds another layer of 
                security to your account.
              </div>
            </div>

            <div className='w-full flex items-start justify-end'>
              <ToggleSwitch 
                setToggle={() => handleToggle2FA('')}
                toggle={enable2FA}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default SecurityDetails