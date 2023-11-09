'use client'

import { InputElement, SelectElement } from '@/components/forms';
import { Button, LinkButton } from '@/components/globalComponents';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { postCompanyDetails } from '@/actions/authActions';
import { COMPANY_TYPES, CONSUMER_ROLES } from '@/data/authData';

const CompanyDetailsForm = () => {
  const [company_name, setCompanyName] = useState(''); 
  const [company_type, setCompanyType] = useState(''); 
  const [role, setRole] = useState(''); 

  const incorrect = (
    !company_name ||
    !company_type ||
    !role
  );

  const initialState = {
    message: null,
  }

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

  const [state, formAction] = useFormState(postCompanyDetails, initialState);
  state?.message && toast.error(state?.message);

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <InputElement 
          name='company_name'
          placeholder='Your company name goes here'
          label='What is the name of your company?'
          value={company_name}
          changeValue={setCompanyName}
          required
        />

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
            label='What type of company is it?'
            placeholder='Your company name goes here'
            required
            optionStyle='top-[70px]'
            clickerStyle='!w-full'
            value={company_type}
            changeValue={setCompanyType}
          />
        </>

        <>
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
            optionStyle='top-[70px]'
            clickerStyle='!w-full'
            value={role}
            changeValue={setRole}
          />
        </>
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