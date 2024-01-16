'use client'

import { InputElement, SelectElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import React, { useEffect, useState } from 'react';
import { greaterThan8, validateEmail, validateLowercase, validateName, validateNumber, validateSymbol, validateUppercase } from '@/utils/globalValidations';
// import { COMPANY_TYPES } from '@/data/authData';
import { useServerAction } from '@/hooks';
import { postSignup } from '@/actions/authActions';
import { setStorage } from '@/config/webStorage';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';
import { COUNTRIES_DATA } from '@/data/countriesData';
import { CONSUMER_ROLES } from '@/data/authData';
// import { USER_TYPE_DATA } from '@/data/userTypeData';

const SignupFullForm = () => {
  const [email, setEmail] = useState(''); 
  const [bvn, setBvn] = useState(''); 
  const [account_number, setAccountNumber] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [country, setCountry] = useState(''); 
  const [user_type, setUserType] = useState('');
  const [confirm_password, setConfirmPassword] = useState(''); 
  const [first_name, setFirstName] = useState(''); 
  const [terms_agreed, setTermsAgreed] = useState(false);
  const [last_name, setLastName] = useState(''); 
  const [phone_number, setPhoneNumber] = useState('');
  const [business_name, setBusinessName] = useState(''); 
  const [business_type, setBusinessType] = useState(''); 
  const [cac, setCac] = useState(''); 
  const [role, setRole] = useState(''); 

  const [companyTypes, setCompanyTypes] = useState<any>(null);

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
    !country ||
    phone_number?.length !== 11 ||
    !user_type ||
    (user_type == 'individual' && (!bvn || !account_number)) ||
    (user_type == 'business' && (!business_name || !business_type || !cac || !account_number)) ||
    (user_type == 'licensed-entity' && (!business_name || !business_type || !role)) ||
    !terms_agreed
  );

  const countries_list = COUNTRIES_DATA?.map(country => {
    return ({
      label: country?.name || '',
      value: country?.name || ''
    });
  })

  const subTypes = companyTypes?.companySubtypes;
  const business_type_list = (
    user_type == 'individual' ? 
      subTypes?.individual :
      user_type == 'business' ? 
        subTypes?.business :
        user_type == 'licensed-entity' ? 
          subTypes?.licensedEntity :
          []
  )?.map((type?: string[]) => {
    return ({
      label: type || '',
      value: type || ''
    });
  })

  const role_list = CONSUMER_ROLES?.map(role => {
    return ({
      label: role?.label || '',
      value: role?.value || ''
    });
  })

  const user_type_list = companyTypes?.companyTypes?.map((type?: string[]) => {
    return ({
      label: type?.toString()?.replace(/-/g, ' ') || '',
      value: type || ''
    })
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

  const handleCAC = (value: string) => {
    if (value?.length <= 15) {
      setCac(value?.toString()?.replace(/[^0-9a-zA-Z]/g, ''));
    }
  }

  const handleAccountNumber = (value: string) => {
    if (value?.length <= 10) {
      setAccountNumber(value?.toString()?.replace(/[^0-9a-zA-Z]/g, ''));
    }
  }

  const handleBVN = (value: string) => {
    if (value?.length <= 11){
      setBvn(value?.toString()?.replace(/[^0-9.]/g, ''));
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
          label='Email Address'
          value={email}
          changeValue={setEmail}
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

        <>
          <input 
            name='user_type'
            value={user_type}
            readOnly
            className='hidden opacity-0'
          />
          
          <SelectElement 
            name='user_type'
            options={user_type_list}
            label='User type'
            placeholder='Select'
            required
            optionStyle='top-[70px]'
            clickerStyle='!w-full'
            value={user_type}
            changeValue={setUserType}
          />
        </>

        
        {
          (user_type == 'individual') && (
            <InputElement 
              name='bvn'
              placeholder='Enter your BVN'
              label='BVN'
              value={bvn}
              changeValue={(value: string) => handleBVN(value)}
              required
            />
        )}

        {
          (user_type == 'business' || user_type == 'licensed-entity') && (
            <InputElement 
              name='business_name'
              placeholder='Enter business corporate name'
              label='Business Name'
              value={business_name}
              changeValue={setBusinessName}
              required
            />
        )}

        {
          (user_type == 'business' || user_type == 'licensed-entity') && (
            <>
              <input 
                name='business_type'
                value={business_type}
                readOnly
                className='hidden opacity-0'
              />
              
              <SelectElement 
                name='business_type'
                options={business_type_list}
                label='Business type'
                placeholder='Select type'
                required
                optionStyle='top-[70px]'
                clickerStyle='!w-full'
                value={business_type}
                changeValue={setBusinessType}
              />
            </>
        )}

        {
          (user_type == 'business') && (
            <InputElement 
              name='cac'
              placeholder='Enter company’s CAC number'
              label='CAC number'
              value={cac}
              changeValue={(value: string) => handleCAC(value)}
              required
            />
        )}

        {
          (user_type == 'licensed-entity') && (
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
                label='Role'
                placeholder='Select role'
                required
                optionStyle='top-[70px]'
                clickerStyle='!w-full'
                value={role}
                changeValue={setRole}
              />
            </>
        )}

        {
          (user_type == 'individual' || user_type == 'business') && (
            <InputElement 
              name='account_number'
              placeholder='Enter your account number'
              label='Account Number'
              value={account_number}
              changeValue={(value: string) => handleAccountNumber(value)}
              required
            />
        )}

        {/* <InputElement 
          name='company_name'
          placeholder='Your company name goes here'
          label='What is the name of your company?'
          value={company_name}
          changeValue={setCompanyName}
          required
        /> */}

        {/* <>
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
        </> */}

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

        <div className='w-full flex items-center gap-[8px]'>
          {
            terms_agreed ?
              <svg 
                width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"
                onClick={() => setTermsAgreed(false)}
                className='cursor-pointer'
              >
                <path d="M0.5 4.71289C0.5 2.50375 2.29086 0.712891 4.5 0.712891H12.5C14.7091 0.712891 16.5 2.50375 16.5 4.71289V12.7129C16.5 14.922 14.7091 16.7129 12.5 16.7129H4.5C2.29086 16.7129 0.5 14.922 0.5 12.7129V4.71289Z" fill="#5277C7"/>
                <path d="M12.5 5.71289L7 11.2129L4.5 8.71289" stroke="white" fill='transparent' strokeWidth="1.6666" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              :
              <svg 
                width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"
                onClick={() => setTermsAgreed(true)}
                className='cursor-pointer'
              >
                <path fill='transparent' d="M1 4.71289C1 2.77989 2.567 1.21289 4.5 1.21289H12.5C14.433 1.21289 16 2.77989 16 4.71289V12.7129C16 14.6459 14.433 16.2129 12.5 16.2129H4.5C2.567 16.2129 1 14.6459 1 12.7129V4.71289Z" stroke="#D0D5DD"/>
              </svg>
          }

          <div className='text-f14 text-[#344054]'>
            I agree to the <span className='cursor-pointer font-[600] text-o-light-blue'>
              Terms of Use</span> and&#160; 
            <span className='cursor-pointer font-[600] text-o-light-blue'>
              Privacy Policy</span>.
          </div>
        </div>
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