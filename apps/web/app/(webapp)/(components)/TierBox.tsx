import { TierBoxProps } from '@/types/webappTypes/componentsTypes'
import React from 'react'

const TierBox = ({
  value
}: TierBoxProps) => {
  return (
    <div className='w-fit'>
      {
        value == 'T1' ? 
          <div className='text-f14 flex gap-[6px] items-center text-o-text-medium3'>
            T1 
            <div className='w-fit flex items-center gap-[2px]'>
              <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
              <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
              <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
              <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
            </div>
          </div>
          :
          value == 'T2' ? 
            <div className='text-f14 gap-[6px] flex items-center text-o-text-medium3'>
              T2 
              <div className='w-fit flex items-center gap-[2px]'>
                <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
                <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
                <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
                <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
              </div>
            </div>
            :
            value == 'T3' ? 
              <div className='text-f14 gap-[6px] flex items-center text-o-text-medium3'>
                T3 
                <div className='w-fit flex items-center gap-[2px]'>
                  <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
                  <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
                  <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                  <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                </div>
              </div>
              :
              value == 'T4' ? 
                <div className='text-f14 gap-[6px] flex items-center text-o-text-medium3'>
                  T4 
                  <div className='w-fit flex items-center gap-[2px]'>
                    <span className='w-[8px] h-[8px] rounded-full bg-[#459572]'/>
                    <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                    <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                    <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                  </div>
                </div>
                : value == 'T5' ? 
                  <div className='text-f14 gap-[6px] flex items-center text-o-text-medium3'>
                    T5 
                    <div className='w-fit flex items-center gap-[2px]'>
                      <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                      <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                      <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                      <span className='w-[8px] h-[8px] rounded-full bg-o-border'/>
                    </div>
                  </div>
                  : null
      }
    </div>
  )
}

export default TierBox