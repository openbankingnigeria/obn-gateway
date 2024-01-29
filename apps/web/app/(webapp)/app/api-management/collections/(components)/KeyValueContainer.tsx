import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { APIConfigurationContainerProps } from '@/types/webappTypes/appTypes'
import Image from 'next/image'
import React from 'react'

const KeyValueContainer = ({
  data,
  handleInputChange,
  handleRemove,
  handleAdd,
  keyPlaceholder,
  preview,
  valuePlaceholder,
  type,
  label
}: APIConfigurationContainerProps) => {
  let containerType = type || '';

  return (
    <>
      {
        (data && data?.length >= 1) ?
          data?.map((keyvalue, index) => (
            <div 
              key={keyvalue?.id}
              className='flex w-full items-center gap-[12px]'
            >
              <div className='w-full items-end flex gap-[12px]'>
                <InputElement 
                  name={`keyvalue${keyvalue?.id}`}
                  placeholder={keyPlaceholder}
                  label={index == 0 ? label : ''}
                  autoFocus
                  disabled={preview}
                  value={keyvalue?.name}
                  changeValue={(value: string) => handleInputChange(value, keyvalue, 'key', containerType)}
                  required
                />

                <InputElement 
                  name={`keyvalue${keyvalue?.id}`}
                  placeholder={valuePlaceholder}
                  value={keyvalue?.value}
                  disabled={preview}
                  changeValue={(value: string) => handleInputChange(value, keyvalue, 'value', containerType)}
                  required
                />
              </div>

              {
                !preview &&
                <div className={`flex items-center min-w-[56px] gap-[8px] ${index == 0 && 'mt-6'}`}>
                  <div 
                    onClick={() => handleRemove(containerType, keyvalue?.id)}
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
                      onClick={() => handleAdd(containerType)}
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
              }
          </div>
          ))
          :
          preview ?
          null :
          <Button 
            title={`Add ${label}`}
            effect={() => handleAdd(containerType)}
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

export default KeyValueContainer