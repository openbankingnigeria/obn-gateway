'use client'

import { ViewData } from '@/app/(webapp)/(components)'
import ImageViewer from '@/app/(webapp)/(components)/ImageViewer'
import { ConsumerBusinessDetailsProps } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'

const ConsumerBusinessDetails = ({
  rawData
}: ConsumerBusinessDetailsProps) => {
  // console.log(rawData);
  const [openModal, setOpenModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState('');

  const closeModal = () => {
    setOpenModal(false);
  }
  
  return (
    <>
      {
        openModal && (
          <ImageViewer 
            title={fileName}
            file={file}
            effect={closeModal}
          />
        )
      }
    
      <section className='w-full'>
        <div className='w-full overflow-hidden bg-white border border-o-border rounded-[10px] h-fit'>
            <h3 className='px-[20px] py-[16px] w-full border-b border-o-border bg-o-bg2'>
              <div className='text-f16 font-[600] text-o-text-dark'>
                Business information
              </div>
            </h3>
            <div className='w-full p-[20px] grid grid-cols-2 ms:grid-cols-3 lgg:grid-cols-4 gap-[16px] bg-white'>
              <ViewData 
                label='CAC Number'
                value={rawData?.kybData?.rcNumber || rawData?.rcNumber}
              />

              <ViewData 
                label='Regulatory License'
                value={
                  <span 
                    className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'
                    onClick={() => {
                      setFile(`data:image/png;base64,${rawData?.kybData?.registryLicense?.file}`);
                      setFileName(rawData?.kybData?.registryLicense?.fileName);
                      setOpenModal(true);
                    }}
                  >
                    {rawData?.kybData?.registryLicense?.fileName}
                  </span>
                }
              />

              <ViewData 
                label='Certificate of Incorporation'
                value={
                  <span 
                    className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'
                    onClick={() => {
                      setFile(`data:image/png;base64,${rawData?.kybData?.certificateOfIncorporation?.file}`);
                      setFileName(rawData?.kybData?.certificateOfIncorporation?.fileName);
                      setOpenModal(true);
                    }}
                  >
                    {rawData?.kybData?.certificateOfIncorporation?.fileName}
                  </span>
                }
              />

              <ViewData 
                label='Tax Identification Number (TIN)'
                value={rawData?.kybData?.taxIdentificationNumber}
              />

              <ViewData 
                label='Company Status Report'
                value={
                  <span 
                    className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'
                    onClick={() => {
                      setFile(`data:image/png;base64,${rawData?.kybData?.companyStatusReport?.file}`);
                      setFileName(rawData?.kybData?.companyStatusReport?.fileName);
                      setOpenModal(true);
                    }}
                  >
                    {rawData?.kybData?.companyStatusReport?.fileName}
                  </span>
                }
              />
            </div>
          </div>
      </section>
    </>
  )
}

export default ConsumerBusinessDetails