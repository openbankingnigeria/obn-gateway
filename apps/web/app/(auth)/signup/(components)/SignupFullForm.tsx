'use client'

import { InputElement, SelectElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import React, { useEffect, useState } from 'react';
import { greaterThan8, validateEmail, validateLowercase, validateName, validateNumber, validateSymbol, validateUppercase } from '@/utils/globalValidations';
import { COMPANY_TYPES } from '@/data/authData';
import { useServerAction } from '@/hooks';
import { postSignup } from '@/actions/authActions';
import { setStorage } from '@/config/webStorage';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';

const SignupFullForm = () => {
  const [email, setEmail] = useState(''); 
  const [companyTypes, setCompanyTypes] = useState([]);
  const [password, setPassword] = useState(''); 
  const [confirm_password, setConfirmPassword] = useState(''); 
  const [first_name, setFirstName] = useState(''); 
  const [last_name, setLastName] = useState(''); 
  const [phone_number, setPhoneNumber] = useState('');
  const [company_name, setCompanyName] = useState(''); 
  const [company_type, setCompanyType] = useState(''); 
  const [role, setRole] = useState(''); 

  const fetchTypes = async () => {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyTypes(),
      method: 'GET',
      data: null,
      noToast: true
    })

    setCompanyTypes(result?.data);
  }

  useEffect(() => {
    fetchTypes();
  }, []);

  const upperAndLowerCase = validateUppercase(password) && validateLowercase(password);
  const number = validateNumber(password);
  const symbol = validateSymbol(password);
  const passwordLength = greaterThan8(password);

  const correctPassword = (upperAndLowerCase && number && symbol && passwordLength);
  const passwordMatch = password === confirm_password
  const correctFirstName = validateName(first_name);
  const correctLastName = validateName(last_name);

  const incorrect = (
    !validateEmail(email) ||
    !correctPassword ||
    !passwordMatch ||
    !correctFirstName ||
    !correctLastName ||
    phone_number?.length !== 11 ||
    !company_name ||
    !company_type ||
    !role
  );

  const company_type_list = companyTypes?.map(type => {
    return ({
      label: type || '',
      value: type || ''
    });
  })

  const handleFirstName = (value: string) => {
    const inputValue = value;
    const capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setFirstName(capitalizedValue?.replace(/[^a-zA-Z-]/g, ''));
  };

  const handlePhoneNumber = (value: string) => {
    if (value?.length <= 11){
      setPhoneNumber(value?.toString()?.replace(/[^0-9.]/g, ''));
    }
  }

  const handleLastName = (value: string) => {
    const inputValue = value;
    const capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setLastName(capitalizedValue?.replace(/[^a-zA-Z-]/g, ''));
  };

  const initialState = {}
  const [state, formAction] = useServerAction(postSignup, initialState);

  const handleClientSubmit = () => {
    setStorage('el', email, 'session');
  }

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

        <InputElement 
          name='email'
          type='email'
          placeholder='Email address'
          label='Company Email Address'
          value={email}
          changeValue={setEmail}
          required
        />

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

        <InputElement 
          name='phone_number'
          placeholder='Phone number'
          type='tel'
          value={phone_number}
          changeValue={(value: string) => handlePhoneNumber(value)}
          label='Phone Number'
          required
        />

        <InputElement 
          name='password'
          type='password'
          value={password}
          changeValue={setPassword}
          showGuide
          placeholder='Password'
          label='Password'
          required
        />

        <InputElement 
          name='confirm_password'
          type='password'
          value={confirm_password}
          changeValue={setConfirmPassword}
          placeholder='Confirm password'
          label='Confirm Password'
          hint={!passwordMatch ? 'Password does not match' : ''}
          invalid={!passwordMatch && !!confirm_password}
          required
        />
      </div>

      <Button 
        type='submit'
        title='Create account'
        effect={handleClientSubmit}
        disabled={incorrect}
      />
    </form>
  )
}

export default SignupFullForm;