'use client'

import { AppCenterModal, AppRightModal } from '@/app/(webapp)/(components)'
import { ToggleSwitch } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import React, { useState } from 'react'
import { ChangePasswordForm, EnableTwoFactorAuth, PasswordChangedSuccessfully } from '.'
import { useRouter } from 'next/navigation'
import TwoFactoAuthEnabled from './TwoFactoAuthEnabled'

const SecurityDetails = ({
  successful
}: {successful: boolean }) => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState('');
  const [enable2FA, setToggle2FA] = useState(false);

  const QRCODE_KEY = '3489323SHJ90A';
  const BACKUP_CODES = [
    '58tip84yj0p',
    '58tip84zj0p',
    '58tip94yj0p',
    '58top84yj0p',
    '58tpp84yj0p',
    '58ti784yj0p',
    '58tip84y50p',
    '5tip84yj0p',
    '58tip84y90p',
  ]

  const handleOpenModal = (type: string) => {
    setOpenModal(type)
  }

  const handleCloseModal = () => {
    setOpenModal('')
  }

  const handleToggle2FA = () => {
    if (enable2FA) {
      setToggle2FA(prev => !prev);
    } else {
      handleOpenModal('enable2fa')
    }
  }

  const handleEnable2fa = () => {
    setToggle2FA(true);
    setOpenModal('2fa')
  }

  return (
    <>
      {
        (openModal == 'password') &&
        <AppRightModal
          title={'Change Password'}
          effect={handleCloseModal}
        >
          <ChangePasswordForm 
            close={handleCloseModal}
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
        (openModal == 'enable2fa' || openModal == '2fa') &&
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
                qrcode_key={QRCODE_KEY}
              /> 
              :
              <TwoFactoAuthEnabled 
                backup_codes={BACKUP_CODES}
                close={handleCloseModal}
              />
          }
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

          <Button 
            title='Saves changes'
            disabled
            small
          />
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
                setToggle={handleToggle2FA}
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