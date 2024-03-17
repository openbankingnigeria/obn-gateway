'use client'

import { ONBOARDING_SETTINGS_DATA } from "@/data/systemSettingsData";
import clientAxiosRequest from "@/hooks/clientAxiosRequest";
import { APIConfigurationProps } from "@/types/webappTypes/appTypes"
import { findPermissionSlug } from "@/utils/findPermissionSlug";
import { ChangeEvent, useState } from "react";
import * as API from '@/config/endpoints';
import { Button } from "@/components/globalComponents";
import Image from "next/image";
import { FaCheck } from "react-icons/fa6";
import { InputElement } from "@/components/forms";

const OnboardingSettingsPage = ({ rawData, profileData }: APIConfigurationProps) => {
  const [loading, setLoading] = useState(false);
  let userPermissions = profileData?.user?.role?.permissions;
  let updateKYBSettings = findPermissionSlug(userPermissions, 'update-kyb-requirement-setting')
  let updateKYB = findPermissionSlug(userPermissions, 'update-kyb-requirements')

  const [individual, setIndividual] = useState([...rawData?.individual]);
  const [business, setBusiness] = useState([...rawData?.business]);
  const [licensedEntity, setLicensedEntity] = useState([...rawData?.['licensed-entity']]);

  const [individualText, setIndividualText] = useState('');
  const [businessText, setBusinessText] = useState('');
  const [licensedEntityText, setLicensedEntityText] = useState('');

  // console.log(rawData)
  const onboardingSettings = ONBOARDING_SETTINGS_DATA({ 
    individual, business, licensedEntity
   });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.updateCompanyTypes(),
        method: 'PUT',
        data: {
          "business": business?.map((item: any) => item?.value),
          "licensed-entity": licensedEntity?.map((item: any) => item?.value),
          "individual": individual?.map((item: any) => item?.value)
        }
      });

    if (result?.message) {
      setLoading(false);
    }
  };

  const handleDelete = (value: any, name: string) => {
    const types = onboardingSettings?.find((type: any) => type?.name == name)?.values;
     if (name == 'individual') {
      setIndividual(types?.filter((type: any) => type?.value != value?.value))
     } 
     if (name == 'business') {
      setBusiness(types?.filter((type: any) => type?.value != value?.value))
     }
     if (name == 'licensedEntity') {
      setLicensedEntity(types?.filter((type: any) => type?.value != value?.value))
     }
  }

  const handleAdd = (name: string, value: string) => {
    if (name == 'individual') {
      setIndividual(prev => [...prev, { value, default: false }]);
      setIndividualText('');
     } 
     if (name == 'business') {
      setBusiness(prev => [...prev, { value, default: false }]);
      setBusinessText('');
     }
     if (name == 'licensedEntity') {
      setLicensedEntity(prev => [...prev, { value, default: false }]);
      setLicensedEntityText('');
     }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='gap-[20px] flex flex-col w-full pb-[24px]'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            Company Sub Types
          </h3>
        </div>

        {
          (updateKYBSettings || updateKYB) &&
          <Button 
          title='Save changes'
          type='submit'
          loading={loading}
          containerStyle='!w-[120px]'
          disabled={loading}
          small
        />
        } 
      </div>
    
      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        {
          onboardingSettings?.map((data) => (
            <div 
              key={data?.id}
              className='w-full last-of-type:border-0 last-of-type:pb-0 flex items-start justify-between gap-[40px] pb-[20px] border-b border-o-border'
            >
              <div className='w-[40%] flex flex-col gap-[8px]'>
                <label 
                  className='text-f14 font-[500] text-o-text-dark'
                  htmlFor={data?.name}
                >
                  {data?.label}
                </label>

                <div className='text-f14 text-o-text-medium3'>
                  {data?.description}
                </div>
              </div>

              <div className="w-[60%] flex flex-row flex-wrap gap-[12px]">
                {
                  data?.values?.map((value: any) => (
                    <div 
                      onClick={() => !(value?.default) && handleDelete(value, data?.name)}
                      className="type-shadow text-f14 font-[600] flex items-center gap-3 text-[#36394A] py-[6px] px-[12px] rounded-[6px]"
                      key={value}
                    >
                      {value?.value}

                      {
                        !(value?.default) &&
                        <Image 
                          src={'/icons/trash.svg'}
                          alt='remove'
                          width={15}
                          height={15}
                        />
                      }
                    </div>
                  ))
                }

                <div className="w-[50%] flex items-center">
                  <InputElement 
                    name='type_input'
                    type={'text'}
                    placeholder='Enter type'
                    containerStyle="w-[100%]"
                    fieldStyle='py-[6px]'
                    value={
                      (data?.name == 'licensedEntity') ?
                      licensedEntityText :
                      (data?.name == 'business') ?
                      businessText :
                      individualText
                    }
                    changeValue={
                      (data?.name == 'licensedEntity') ?
                      setLicensedEntityText :
                      (data?.name == 'business') ?
                      setBusinessText :
                      setIndividualText
                    }
                    // required
                  />
                  <div 
                    className="h-full text-o-green2 flex items-center justify-center w-[15%] rounded-tr-[6px] rounded-br-[6px] bg-o-blue"
                    onClick={() => handleAdd(
                      data?.name, (
                        (data?.name == 'licensedEntity') ?
                          licensedEntityText :
                          (data?.name == 'business') ?
                          businessText :
                          individualText)
                    )}
                  >
                    <FaCheck size={16} />  
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </form>
  )
}

export default OnboardingSettingsPage