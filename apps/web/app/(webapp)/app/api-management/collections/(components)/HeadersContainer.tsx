import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { APIConfigurationContainerProps } from '@/types/webappTypes/appTypes'
import Image from 'next/image'
import React from 'react'

const HeadersContainer = ({
  data,
  handleInputChange,
  handleRemove,
  handleAdd
}: APIConfigurationContainerProps) => {
  return (
    <>
      {
        (data && data?.length >= 1) ?
          data?.map((header, index) => (
            <div 
              key={header?.id}
              className='flex w-full items-center gap-[12px]'
            >
              <div className='w-full items-end flex gap-[12px]'>
                <InputElement 
                  name={`header_${header?.id}`}
                  placeholder='Enter a header name'
                  label={index == 0 ? 'Headers' : ''}
                  autoFocus
                  value={header?.name}
                  changeValue={(value: string) => handleInputChange(value, header, 'name', 'headers')}
                  required
                />

                <InputElement 
                  name={`header_${header?.id}`}
                  placeholder='Enter a header value'
                  value={header?.value}
                  changeValue={(value: string) => handleInputChange(value, header, 'value', 'headers')}
                  required
                />
              </div>

              <div className={`flex items-center min-w-[56px] gap-[8px] ${index == 0 && 'mt-6'}`}>
                <div 
                  onClick={() => handleRemove('headers', header?.id)}
                  className='min-w-[24px] h-[24px] cursor-pointer'
                >
                  <Image 
                    src={'/icons/trash.svg'}
                    alt='remove'
                    width={24}
                    height={24}
                  />
                </div>

                {
                  index == (data?.length - 1) &&
                  <div 
                    onClick={() => handleAdd('headers')}
                    className='min-w-[24px] h-[24px] cursor-pointer'
                  >
                    <Image 
                      src={'/icons/plus.svg'}
                      alt='add'
                      width={24}
                      height={24}
                    />
                  </div>
                }
              </div>
          </div>
          ))
          :
          <Button 
            title='Add Headers'
            effect={() => handleAdd('headers')}
            type='button'
            outlined
            containerStyle='!w-fit'
            small
            leftIcon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.99984 4.16699V15.8337M4.1665 10.0003H15.8332" stroke="#666D80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill='transparent' />
              </svg>
            }
          />
      }
    </>
  )
}

export default HeadersContainer