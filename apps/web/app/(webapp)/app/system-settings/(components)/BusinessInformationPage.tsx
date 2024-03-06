'use client'

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
// import { postAddBusinessInfo } from '@/actions/profileActions'
import { DragAndUploadElement, InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
// import { useServerAction } from '@/hooks'
import { BUSINESS_INFORMATION_DATA } from '@/data/systemSettingsData'
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';
import { StatusBox } from '@/app/(webapp)/(components)'
import { useRouter } from 'next/navigation'

const BusinessInformationPage = () => {
  const [loading, setLoading] = useState(false);
  const [businessDetails, setBusinessDetails] = useState<any>(null);
  const [cac, setCac] = useState('');
  const router = useRouter();
  const [regulator_license, setRegulatorLicense] = useState('');
  const [regulator_license_file, setRegulatorLicenseFile] = useState('');
  const [certificate_of_incorporation, setCertificationOfIncorporation] = useState('');
  const [certificate_of_incorporation_file, setCertificationOfIncorporationFile] = useState('');
  const [tin, setTin] = useState('');
  const [company_status_report, setCompanyStatusReport] = useState('');
  const [company_status_report_file, setCompanyStatusReportFile] = useState('');

  const incorrect = (
    cac?.length < 6 || 
    cac?.length > 16 ||
    !regulator_license ||
    !certificate_of_incorporation ||
    tin?.length < 6 ||
    tin?.length > 16 ||
    !company_status_report
  );

  const fetchDetails = async () => {
    const result : any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyDetails(),
      method: 'GET',
      data: null,
      noToast: true
    });

    setBusinessDetails(result?.data);
  }

  const allowEdit = (
    cac != (businessDetails?.rcNumber) ||
    tin != businessDetails?.kybData?.taxIdentificationNumber ||
    regulator_license != businessDetails?.kybData?.registryLicense?.fileName ||
    certificate_of_incorporation != businessDetails?.kybData?.certificateOfIncorporation?.fileName ||
    company_status_report != businessDetails?.kybData?.companyStatusReport?.fileName
  );

  useEffect(() => {
    fetchDetails();
  }, []);

  useEffect(() => {
    setCac(businessDetails?.kybData?.rcNumber || businessDetails?.rcNumber || '');
    setCertificationOfIncorporation(businessDetails?.kybData?.certificateOfIncorporation?.fileName || '');
    setCertificationOfIncorporationFile(businessDetails?.kybData?.certificateOfIncorporation?.file || '')
    setCompanyStatusReport(businessDetails?.kybData?.companyStatusReport?.fileName || '');
    setCompanyStatusReportFile(businessDetails?.kybData?.companyStatusReport?.file || '');
    setRegulatorLicense(businessDetails?.kybData?.registryLicense?.fileName || '');
    setRegulatorLicenseFile(businessDetails?.kybData?.registryLicense?.file || '');
    setTin(businessDetails?.kybData?.taxIdentificationNumber || '');
  }, [businessDetails]);

  const businessInformation = BUSINESS_INFORMATION_DATA({
    cac: cac,
    tin: tin,
    regulator_license: regulator_license,
    regulator_license_file,
    certificate_of_incorporation: certificate_of_incorporation,
    certificate_of_incorporation_file,
    company_status_report: company_status_report,
    company_status_report_file
  });

  const handleCac = (value: string) => {
    if (value?.length <= 16) {
      setCac(value?.toString()?.replace(/[^0-9a-zA-Z]/g, ''));
    }
  }

  const handleTin = (value: string) => {
    if (value?.length <= 16){
      setTin(value?.toString()?.replace(/[^0-9-]/g, ''));
    }
  }

  // const initialState = {}
  // const [state, formAction] = useServerAction(postAddBusinessInfo, initialState);
  // if(state?.response?.status == 200 || state?.response?.status == 201) {
  //   router.refresh();
  // }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();

    formData.append('registryLicense', regulator_license);
    formData.append('certificateOfIncorporation', certificate_of_incorporation);
    formData.append('companyStatusReport', company_status_report);
    formData.append('taxIdentificationNumber', tin);
    formData.append('rcNumber', cac);

    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.updateCompanyDetails(),
      method: 'PATCH',
      data: formData
    })

    // console.log(result?.status == 200)
    setLoading(false);
    if (result?.status == 200) {
      router?.refresh();
    }
  }

  // console.log(businessDetails);

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className='gap-[20px] flex flex-col w-full pb-[24px]'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            Business information
          </h3>
          <div className='text-f14 text-o-text-medium3'>
            Information submitted for verification
          </div>
        </div>

        {
          (!businessDetails?.isVerified) &&
            <div className='w-fit flex gap-5 items-end'>
              {
                businessDetails?.kybStatus == 'pending' &&
                <StatusBox status='submitted' />
              }
              <Button 
                title={
                  (businessDetails?.kybStatus == 'pending' || 
                  businessDetails?.kybStatus == 'denied') ? 
                  'Update' : 
                  'Submit'
                }
                type='submit'
                loading={loading}
                containerStyle='!w-[120px]'
                disabled={
                  (businessDetails?.kybStatus == 'pending' || 
                  businessDetails?.kybStatus == 'denied') ?
                  (incorrect || loading || !allowEdit) :
                  (incorrect || loading)
                }
                small
              />
            </div>
        }
      </div>

      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        {
          businessInformation?.map((data) => (
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

              <div className='w-[60%]'>
                {
                  data?.type == 'file' ?
                    <DragAndUploadElement 
                      required={true}
                      name={data?.name}
                      disabled={businessDetails?.kybStatus == 'approved'}
                      changeValue={
                        data?.name == 'regulator_license' ? 
                          setRegulatorLicense :
                          data?.name == 'certificate_of_incorporation' ? 
                            setCertificationOfIncorporation :
                            data?.name == 'company_status_report' ? 
                              setCompanyStatusReport :
                              null
                      }
                      value={data?.value}
                      file={data?.file}
                    />
                    :
                    <InputElement 
                      name={data?.name}
                      type={data?.type}
                      placeholder={data?.placeholder}
                      value={data?.value}
                      invalid={
                        data?.name == 'cac' ?
                        Boolean(cac && (cac?.length < 6)) :
                          data?.name == 'tin' ?
                            Boolean(tin && (tin?.length < 6)) : 
                            false
                      }
                      disabled={businessDetails?.kybStatus == 'approved'}
                      changeEvent={(e: ChangeEvent<HTMLInputElement>) => {
                        data?.name == 'cac' ? 
                          handleCac(e.target.value) :
                          handleTin(e.target.value)
                      }}
                      required
                      rightIcon={
                        <span className='text-f14 whitespace-nowrap text-o-text-muted2'>
                          {data?.rightLabel}
                        </span>
                      }
                    />
                }
              </div>
            </div>
          ))
        }
      </div>
    </form>
  )
}

export default BusinessInformationPage