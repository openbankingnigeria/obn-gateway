import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { APIConfigurationContainerProps } from '@/types/webappTypes/appTypes'
import Image from 'next/image'
import React from 'react'

const SnisContainer = ({
  data,
  handleInputChange,
  handleRemove,
  handleAdd
}: APIConfigurationContainerProps) => {
  return (
    <>
      {
        (data && data?.length >= 1) ?
          data?.map((sni, index) => (
            <div 
              key={sni?.id}
              className='flex w-full items-center gap-[12px]'
            >
              <InputElement 
                name={`sni_${sni?.id}`}
                placeholder='Enter a SNI'
                label={index == 0 ? 'SNIs' : ''}
                value={sni?.value}
                autoFocus
                changeValue={(value: string) => handleInputChange(value, sni, 'value', 'snis')}
                required
              />

              <div className={`flex items-center min-w-[56px] gap-[8px] ${index == 0 && 'mt-6'}`}>
                <div 
                  onClick={() => handleRemove('snis', sni?.id)}
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
                    onClick={() => handleAdd('snis')}
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
            title='Add SNIs'
            effect={() => handleAdd('snis')}
            type='button'
            containerStyle='!w-fit'
            outlined
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

export default SnisContainer