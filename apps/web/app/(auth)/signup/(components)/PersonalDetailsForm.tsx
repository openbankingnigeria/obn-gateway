'use client'

import { InputElement, SelectElement } from '@/components/forms';
import { Button, LinkButton } from '@/components/globalComponents';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { postPersonalDetails } from '@/actions/authActions';
import { COUNTRIES_DATA } from '@/data/countriesData';

const PersonalDetailsForm = () => {
  const [first_name, setFirstName] = useState(''); 
  const [last_name, setLastName] = useState(''); 
  const [country, setCountry] = useState(''); 
  const [phone_number, setPhoneNumber] = useState(''); 

  const incorrect = (
    !first_name ||
    !last_name ||
    !country ||
    !phone_number
  );

  const initialState = {
    message: null,
  }

  const countries_list = COUNTRIES_DATA?.map(country => {
    return ({
      label: country?.name || '',
      value: country?.name || ''
    });
  })

  const [state, formAction] = useFormState(postPersonalDetails, initialState);
  state?.message && toast.error(state?.message);

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <div className='flex flex-col mx:flex-row mx:items-end gap-[16px]'>
          <InputElement 
            name='first_name'
            placeholder='First name'
            label='What is your name?'
            value={first_name}
            changeValue={setFirstName}
            required
          />

          <InputElement 
            name='last_name'
            placeholder='Last name'
            value={last_name}
            changeValue={setLastName}
            required
          />
        </div>

        <>
          <input 
            name='country'
            value={country}
            readOnly
            className='hidden opacity-0'
          />
          
          <SelectElement 
            name='country'
            options={countries_list}
            label='Country'
            placeholder='Select'
            required
            optionStyle='top-[70px]'
            clickerStyle='!w-full'
            value={country}
            changeValue={setCountry}
          />
        </>

        <InputElement 
          name='phone_number'
          type='tel'
          value={phone_number}
          changeValue={setPhoneNumber}
          label='Phone Number'
          required
        />
      </div>

      <div className='w-full flex-col flex gap-[12px]'>
        <Button 
          type='submit'
          title='Next'
          disabled={incorrect}
        />

        <LinkButton
          path='/signup'
          title='Previous'
          outlined
        />
      </div>
    </form>
  )
}

export default PersonalDetailsForm;