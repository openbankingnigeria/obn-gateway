'use client'

import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import React, { ChangeEvent, useState } from 'react'
import * as API from '@/config/endpoints';
import { useRouter } from 'next/navigation';

const PersonalDetails = ({
  profile
}: { profile: any }) => {

  const [firstName, setFirstName] = useState(profile?.firstName);
  const [lastName, setLastName] = useState(profile?.lastName);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.updateProfile(),
        method: 'PATCH',
        data: {
          "firstName": firstName,
          "lastName": lastName
        }
      });

    if (result?.message) {
      setLoading(false);
      window.location.reload();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className='gap-[20px] flex flex-col w-full pb-[24px] border-b border-o-border'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            Personal Details
          </h3>

          <div className='text-f14 text-o-text-medium3'>
            Update your personal details.
          </div>
        </div>

        <Button 
          title='Save changes'
          type='submit'
          loading={loading}
          containerStyle='!w-[120px]'
          disabled={loading || !firstName || !lastName}
          small
        />
      </div>

      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        <div className='w-full flex items-start justify-between gap-[7px] pb-[20px] border-b border-o-border'>
          <div className='w-full'>
            <label 
              className='text-f14 font-[500] text-o-text-dark'
              htmlFor='first_name'
            >
              Name
            </label>
          </div>

          <div className='w-full flex items-center gap-[16px]'>
            <div className='w-full'>
              <InputElement 
                name='first_name'
                placeholder='First name'
                value={firstName}
                changeValue={setFirstName}
                // disabled
                required
              />
            </div>

            <div className='w-full'>
              <InputElement 
                name='last_name'
                placeholder='Last name'
                value={lastName}
                changeValue={setLastName}
                // disabled
                required
              />
            </div>
          </div>
        </div>

        <div className='w-full flex items-start justify-between gap-[7px] pb-[20px] border-o-border'>
          <div className='w-full flex flex-col gap-[8px]'>
            <label 
              className='text-f14 font-[500] text-o-text-dark'
              htmlFor='email'
            >
              Email Address
            </label>

            <div className='text-f14 text-o-text-medium3'>
              Your associated email address
            </div>
          </div>

          <div className='w-full'>
            <InputElement 
              name='email'
              type='email'
              placeholder='Email address'
              value={profile?.user?.email}
              disabled
              required
            />
          </div>
        </div>

        {/* <div className='w-full flex items-start justify-between gap-[7px]'>
          <div className='w-full flex flex-col gap-[8px]'>
            <label 
              className='text-f14 font-[500] text-o-text-dark'
              htmlFor='role'
            >
              Role
            </label>

            <div className='text-f14 text-o-text-medium3'>
              Your associated role and permissions level
            </div>
          </div>

          <div className='w-full'>
            <InputElement
              name='role'
              placeholder='Role'
              value={profile?.companyRole?.replace(/_/g, ' ')}
              disabled
              required
            />
          </div>
        </div> */}
      </div>
    </form>
  )
}

export default PersonalDetails