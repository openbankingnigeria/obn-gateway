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
// import { COUNTRIES_DATA } from '@/data/countriesData';
// import { CONSUMER_ROLES } from '@/data/authData';
// import { USER_TYPE_DATA } from '@/data/userTypeData';

const SignupFullForm = () => {
  const [email, setEmail] = useState(''); 
  const [bvn, setBvn] = useState(''); 
  // const [accountNumber, setAccountNumber] = useState(''); 
  const [password, setPassword] = useState(''); 
  // const [country, setCountry] = useState(''); 
  const [userType, setUserType] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [firstName, setFirstName] = useState(''); 
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [lastName, setLastName] = useState(''); 
  const [phone, setPhone] = useState('');
  // const [companyName, setCompanyName] = useState(''); 
  const [companySubtype, setCompanySubtype] = useState(''); 
  // const [cac, setCac] = useState('');
  const [requiredFields, setRequiredFields] = useState({}); 
  // const [role, setRole] = useState(''); 

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

  const fetchRequiredFields = async () => {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyRequiredFields({
        type: userType
      }),
      method: 'GET',
      data: null,
      noToast: true
    })
    setRequiredFields(result?.data);
  }

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    userType && fetchRequiredFields();
  }, [userType]);

  const upperAndLowerCase = validateUppercase(password) && validateLowercase(password);
  const number = validateNumber(password);
  const symbol = validateSymbol(password);
  const passwordLength = greaterThan8(password);

  const correctPassword = (upperAndLowerCase && number && symbol && passwordLength);
  const passwordMatch = password === confirmPassword
  const correctFirstName = validateName(firstName);
  const correctLastName = validateName(lastName);

  const incorrect = (
    !validateEmail(email) ||
    !correctPassword ||
    !passwordMatch ||
    !correctFirstName ||
    !correctLastName ||
    // !country ||
    phone?.length !== 11 ||
    !userType ||
    // (userType == 'individual' && (!bvn || !accountNumber)) ||
    // (userType == 'business' && (!companyName || !companySubtype || !cac || !accountNumber)) ||
    // (userType == 'licensed-entity' && (!companyName || !companySubtype /*|| !role */)) ||
    !termsAgreed
  );

  // const countries_list = COUNTRIES_DATA?.map(country => {
  //   return ({
  //     label: country?.name || '',
  //     value: country?.name || ''
  //   });
  // })

  const subTypes = companyTypes?.companySubtypes;
  const business_type_list = (
    userType == 'individual' ? 
      subTypes?.individual :
      userType == 'business' ? 
        subTypes?.business :
        userType == 'licensed-entity' ? 
          subTypes?.['licensed-entity'] :
          []
  )?.map((type?: string[]) => {
    return ({
      label: type || '',
      value: type || ''
    });
  })

  // const role_list = CONSUMER_ROLES?.map(role => {
  //   return ({
  //     label: role?.label || '',
  //     value: role?.value || ''
  //   });
  // })

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
      setPhone(value?.toString()?.replace(/[^0-9.]/g, ''));
    }
  }

  // const handleCAC = (value: string) => {
  //   if (value?.length <= 15) {
  //     setCac(value?.toString()?.replace(/[^0-9a-zA-Z]/g, ''));
  //   }
  // }

  // const handleAccountNumber = (value: string) => {
  //   if (value?.length <= 10) {
  //     setAccountNumber(value?.toString()?.replace(/[^0-9]/g, ''));
  //   }
  // }

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

  const handleFieldsInput = (value: string, name: string) => {
    if(name == 'email') {
      setEmail(value);
    } else if(name == 'phone') {
      handlePhoneNumber(value)
    } else if(name == 'bvn') {
      handleBVN(value)
    } else if(name == 'password') {
      setPassword(value)
    } else if(name == 'confirmPassword') {
      setConfirmPassword(value)
    } 
  }

  const initialState = {}
  const [state, formAction] = useServerAction(postSignup, initialState);

  const handleClientSubmit = () => {
    setStorage('el', email, 'session');
  }

  const sanitizedFields = Object.keys(requiredFields).map(key => ({
    name: key,
    // @ts-ignore
    label: requiredFields[key].label,
    // @ts-ignore
    type: requiredFields[key].type
  }));

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <div className='flex flex-col mx:flex-row mx:items-end gap-[16px]'>
          <InputElement 
            name='firstName'
            placeholder='First name'
            label='What is your name?'
            value={firstName}
            changeValue={(value: string) => handleFirstName(value)}
            required
          />

          <InputElement 
            name='lastName'
            placeholder='Last name'
            value={lastName}
            changeValue={(value: string) => handleLastName(value)}
            required
          />
        </div>

        <>
          <input 
            name='userType'
            value={userType}
            readOnly
            className='hidden opacity-0'
          />
          
          <SelectElement 
            name='userType'
            emptyState='No User Type at the moment'
            options={user_type_list}
            label='User type'
            placeholder='Select'
            required
            optionStyle='top-[70px]'
            clickerStyle='!w-full'
            value={userType}
            changeValue={setUserType}
          />
        </>

        {
          sanitizedFields?.map((field: any) => (
            field?.type == 'dropdown' ?
              <div
                key={field?.label}
                className='w-full'
              >
                <input 
                  name='companySubtype'
                  value={companySubtype}
                  readOnly
                  className='hidden opacity-0'
                />

                <SelectElement 
                  name={field?.name}
                  options={business_type_list}
                  label={field?.label}
                  placeholder='Select'
                  required
                  optionStyle='top-[70px]'
                  clickerStyle='!w-full'
                  value={companySubtype}
                  changeValue={setCompanySubtype}
                />
              </div>
              :
              (
                (field?.name == 'email') || (field?.name == 'phone') || 
                (field?.name == 'bvn') || (field?.name == 'password') ||
                (field?.name == 'confirmPassword')
              ) 
                ?
                <InputElement 
                  key={field?.label}
                  name={field?.name}
                  placeholder={`Enter your ${field?.label}`}
                  type={
                    field?.name == 'phone' ? 'tel':
                    field?.type
                  }
                  label={field?.label}
                  value={
                    (field?.name == 'email') ? email : 
                    (field?.name == 'phone') ? phone :
                    (field?.name == 'bvn') ? bvn :
                    (field?.name == 'password') ? password :
                    (field?.name == 'confirmPassword') ? confirmPassword : ''
                  }
                  changeValue={(value: string) => handleFieldsInput(value, field?.name)}
                  showGuide={field?.name == 'password'}
                  hint={(field?.name == 'confirmPassword') && !passwordMatch ? 'Password does not match' : ''}
                  invalid={(field?.name == 'confirmPassword') && !passwordMatch && !!confirmPassword}
                  required
                />
                :
                <InputElement 
                  key={field?.label}
                  name={field?.name}
                  placeholder={`Enter your ${field?.label}`}
                  type={field?.type}
                  label={field?.label}
                  required
                />
          ))
        }

        {/* <InputElement 
          name='email'
          type='email'
          placeholder='Email address'
          label='Email Address'
          value={email}
          changeValue={setEmail}
          required
        /> */}

        {/* <InputElement 
          name='phone'
          placeholder='Phone number'
          type='tel'
          value={phone}
          changeValue={(value: string) => handlePhoneNumber(value)}
          label='Phone Number'
          required
        /> */}

        {/* <>
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
        </> */}

        {/* {
          (userType == 'individual') && (
            <InputElement 
              name='bvn'
              placeholder='Enter your BVN'
              label='BVN'
              value={bvn}
              changeValue={(value: string) => handleBVN(value)}
              required
            />
        )} */}

        {/* {
          (userType == 'business' || userType == 'licensed-entity') && (
            <InputElement 
              name='companyName'
              placeholder='Enter business corporate name'
              label='Business Name'
              value={companyName}
              changeValue={setCompanyName}
              required
            />
        )} */}

        {/* {
          (userType == 'business' || userType == 'licensed-entity') && (
            <>
              <input 
                name='companySubtype'
                value={companySubtype}
                readOnly
                className='hidden opacity-0'
              />
              
              <SelectElement 
                name='companySubtype'
                options={business_type_list}
                label='Business type'
                placeholder='Select type'
                required
                optionStyle='top-[70px]'
                clickerStyle='!w-full'
                value={companySubtype}
                changeValue={setCompanySubtype}
              />
            </>
        )} */}

        {/* {
          (userType == 'business') && (
            <InputElement 
              name='cac'
              placeholder='Enter company’s CAC number'
              label='CAC number'
              value={cac}
              changeValue={(value: string) => handleCAC(value)}
              required
            />
        )} */}

        {/* {
          (userType == 'licensed-entity') && (
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
        )} */}

        {/* {
          (userType == 'individual' || userType == 'business') && (
            <InputElement 
              name='accountNumber'
              placeholder='Enter your account number'
              label='Account Number'
              value={accountNumber}
              changeValue={(value: string) => handleAccountNumber(value)}
              required
            />
        )} */}

        {/* <InputElement 
          name='password'
          type='password'
          value={password}
          changeValue={setPassword}
          showGuide
          placeholder='Password'
          label='Password'
          required
        /> */}

        {/* <InputElement 
          name='confirmPassword'
          type='password'
          value={confirmPassword}
          changeValue={setConfirmPassword}
          placeholder='Confirm password'
          label='Confirm Password'
          hint={!passwordMatch ? 'Password does not match' : ''}
          invalid={!passwordMatch && !!confirmPassword}
          required
        /> */}

        <div className='w-full flex items-center gap-[8px]'>
          {
            termsAgreed ?
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
            I agree to the <a 
            target='_blank' 
            rel='noreferrer noopener'
            href='https://openbanking.ng/terms-conditions/' 
            className='cursor-pointer font-[600] text-o-light-blue'
            >
              Terms of Use</a> and&#160; 
            <a 
              target='_blank' 
              rel='noreferrer noopener'
              href='https://openbanking.ng/privacy-notice/' 
              className='cursor-pointer font-[600] text-o-light-blue'
            >
              Privacy Policy</a>.
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