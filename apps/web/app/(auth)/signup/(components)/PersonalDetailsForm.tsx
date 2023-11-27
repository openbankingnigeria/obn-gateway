'use client'

import { InputElement, SelectElement } from '@/components/forms';
import { Button, LinkButton } from '@/components/globalComponents';
import React, { MouseEvent, useEffect, useState } from 'react';
import { COUNTRIES_DATA } from '@/data/countriesData';
import { useRouter } from 'next/navigation';
import { getStorage, setStorage } from '@/config/webStorage';
import { validateName } from '@/utils/globalValidations';

const PersonalDetailsForm = () => {
  const [first_name, setFirstName] = useState(''); 
  const [last_name, setLastName] = useState(''); 
  const [country, setCountry] = useState(''); 
  const [phone_number, setPhoneNumber] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const getData = getStorage('pd', true, 'session');

  useEffect(() => {
    setFirstName(getData?.first_name);
    setLastName(getData?.last_name);
    setCountry(getData?.country);
    setPhoneNumber(getData?.phone_number);
  }, []);

  const correctFirstName = validateName(first_name);
  const correctLastName = validateName(last_name);

  const incorrect = (
    !correctFirstName ||
    !correctLastName ||
    !country ||
    phone_number?.length !== 11
  );

  const countries_list = COUNTRIES_DATA?.map(country => {
    return ({
      label: country?.name || '',
      value: country?.name || ''
    });
  })

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setStorage(
      'pd', 
      { first_name, last_name, country, phone_number }, 
      'session'
    );
    router.push('/signup/company-details');
    // setLoading(false);
  };

  const handlePhoneNumber = (value: string) => {
    if (value?.length <= 11){
      setPhoneNumber(value?.toString()?.replace(/[^0-9.]/g, ''));
    }
  }

  const handleFirstName = (value: string) => {
    const inputValue = value;
    const capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setFirstName(capitalizedValue?.replace(/[^a-zA-Z]/g, ''));
  };

  const handleLastName = (value: string) => {
    const inputValue = value;
    const capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setLastName(capitalizedValue?.replace(/[^a-zA-Z]/g, ''));
  };

  return (
    <form
      action={''}
      className='gap-[32px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <div className='flex flex-col mx:flex-row mx:items-end gap-[16px]'>
          <InputElement 
            name='first_name'
            placeholder='First name'
            label='What is your name?'
            value={first_name}
            changeValue={(value: string) => handleFirstName(value)}
            required
          />

          <InputElement 
            name='last_name'
            placeholder='Last name'
            value={last_name}
            changeValue={(value: string) => handleLastName(value)}
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
          changeValue={(value: string) => handlePhoneNumber(value)}
          label='Phone Number'
          required
        />
      </div>

      <div className='w-full flex-col flex gap-[12px]'>
        <Button 
          type='button'
          effect={(e) => handleSubmit(e)}
          title='Next'
          loading={loading}
          disabled={loading || incorrect}
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