'use client'

import { InputElement, SelectElement } from '@/components/forms';
import { Button, LinkButton } from '@/components/globalComponents';
import React, { useState } from 'react';
import { postSignup } from '@/actions/authActions';
import { COMPANY_TYPES, CONSUMER_ROLES } from '@/data/authData';
import { useServerAction } from '@/hooks';
import { getStorage } from '@/config/webStorage';

const CompanyDetailsForm = () => {
  const [company_name, setCompanyName] = useState(''); 
  const [company_type, setCompanyType] = useState(''); 
  const [role, setRole] = useState(''); 

  const signupDetails = getStorage('sd', true, 'session');
  const personalDetails = getStorage('pd', true, 'session');

  const incorrect = (
    !company_name ||
    !company_type ||
    !role
  );

  const company_type_list = COMPANY_TYPES?.map(type => {
    return ({
      label: type?.label || '',
      value: type?.value || ''
    });
  })

  const role_list = CONSUMER_ROLES?.map(role => {
    return ({
      label: role?.label || '',
      value: role?.value || ''
    });
  })

  const initialState = {}
  const [state, formAction] = useServerAction(postSignup, initialState);

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col w-full'
    >
      <>
        <input name='email' value={signupDetails?.email} readOnly className='hidden opacity-0' />
        <input name='password' value={signupDetails?.password} readOnly className='hidden opacity-0' />
        <input name='confirm_password' value={signupDetails?.confirm_password} readOnly className='hidden opacity-0' />
        <input name='first_name' value={personalDetails?.first_name} readOnly className='hidden opacity-0' />
        <input name='last_name' value={personalDetails?.last_name} readOnly className='hidden opacity-0' />
        {/* <input name='country' value={personalDetails?.country} readOnly className='hidden opacity-0' /> */}
        <input name='phone_number' value={personalDetails?.phone_number} readOnly className='hidden opacity-0' />
      </>
      
      <div className='w-full flex flex-col gap-[16px]'>
        <InputElement 
          name='company_name'
          placeholder='Your company name goes here'
          label='What is the name of your company?'
          value={company_name}
          changeValue={setCompanyName}
          required
        />

        {/* <InputElement 
          name='company_type'
          placeholder='Your company type'
          label='Select company type'
          value={company_type}
          changeValue={setCompanyType}
          required
        /> */}

        <>
          <input 
            name='company_type'
            value={company_type}
            readOnly
            className='hidden opacity-0'
          />
          
          <SelectElement 
            name='company_type'
            options={company_type_list}
            label='Select company type'
            placeholder='Select type'
            required
            optionStyle='top-[70px]'
            clickerStyle='!w-full'
            value={company_type}
            changeValue={setCompanyType}
          />
        </>

        <InputElement 
          name='role'
          placeholder='Your role'
          label='What is your role?'
          value={role}
          changeValue={setRole}
          required
        />

        {/* <>
          <input 
            name='role'
            value={role}
            readOnly
            className='hidden opacity-0'
          />
          
          <SelectElement 
            name='role'
            options={role_list}
            label='What is your role?'
            placeholder='Select'
            required
            optionStyle='bottom-[50px]'
            clickerStyle='!w-full'
            value={role}
            changeValue={setRole}
          />
        </> */}
      </div>

      <div className='w-full flex-col flex gap-[12px]'>
        <Button 
          type='submit'
          title='Finish'
          disabled={incorrect}
        />

        <LinkButton
          path='/signup/personal-details'
          title='Previous'
          outlined
        />
      </div>
    </form>
  )
}

export default CompanyDetailsForm;