'use client'

import { Button } from '@/components/globalComponents'
import { copyTextToClipboard } from '@/utils/copyTextToClipboard'
import { downloadTxtFile } from '@/utils/downloadTxtFile'
import React, { MouseEventHandler } from 'react'
import { toast } from 'react-toastify'

const TwoFactoAuthEnabled = ({
  close,
  backup_codes
}: { 
    close: MouseEventHandler<HTMLButtonElement>,
    backup_codes: string[]
  }) => {

    const stringifyBackupCodes = backup_codes?.toString()?.replace(/,/g, ' ')

  // const handleCopy = () => {
  //   copyTextToClipboard(stringifyBackupCodes)
  //     .then(() => {
  //       console.log('Copied.');
  //       toast.success('Backup codes copied');
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       toast.error('Error copying Backup codes');
  //     });
  // };

  const handleCopy = () => {
    copyTextToClipboard(stringifyBackupCodes)
      .then((success) => {
        if (success) {
          console.log('Copied.');
          toast.success('Backup codes copied');
        } else {
          console.log('Copy failed.');
          toast.error('Error copying Backup codes');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error copying Backup codes');
      });
  };

  const handleDownloadTXT = () => {
    downloadTxtFile(stringifyBackupCodes, 'aperta_backup_codes');
  };

  return (
    <section className='w-full flex gap-[32px] flex-col'>
      <div className='text-o-text-medium3 text-f14'>
        Now you can use your authenticator app to get 
        authentication codes when you want to sign in.
        <br /><br />
        Download and store these backup codes somewhere safe. 
        If you lose your authentication device you can use 
        any of these codes to securely login to your account
      </div>

      <div className='w-full flex flex-col items-center'>
        <section className='flex flex-col py-[20px] px-[32px] gap-[32px] rounded-[6px] border-o-border bg-o-bg2'>
          <div className='w-full grid grid-cols-3 gap-[16px]'>
            {
              backup_codes?.map((data) => (
                <div
                  key={data}
                  className='text-f14 text-black'
                >
                  {data}
                </div>
              ))
            }
          </div>

          <div className='w-full flex items-center gap-[8px]'>
            <Button
              title='Copy'
              effect={handleCopy}
              small
              containerStyle='!w-[60px]'
              outlined
            />

            <Button 
              title='Download as .txt file'
              effect={handleDownloadTXT}
              containerStyle='!w-full'
              small
              outlined
            />
          </div>
        </section>
      </div>

      <div className='text-o-text-medium3 text-f14'>
        Once you use a backup code to sign in, 
        that code becomes inactive.
      </div>
    </section>
  )
}

export default TwoFactoAuthEnabled