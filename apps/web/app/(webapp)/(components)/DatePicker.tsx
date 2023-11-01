'use client'

import { updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import moment from 'moment';
import Datepicker, { DateType, DateValueType } from 'react-tailwindcss-datepicker';
import { DatePickerProps } from '@/types/webappTypes/componentsTypes';

const DatePicker = ({
  containerStyle,
  fieldStyle,
  showShortcuts,
  name,
  innerLabel,
  popoverDirection,
  asSingle
}: DatePickerProps) => {

  const router = useRouter();
  const [start_date, setStartDate] = useState<DateType | undefined>('');
  const [end_date, setEndDate] = useState<DateType | undefined>('');
  const [isOpen, setOpen] = useState(false);

  let value = {
    startDate: start_date,
    endDate: end_date
  };

  const handleUpdateParams = (value: DateValueType) => {
    setOpen(prev => !prev)
    let stringifiedValue = asSingle ? 
      JSON.stringify(value?.startDate)
      :
      JSON.stringify({
        startdate: value?.startDate,
        enddate: value?.endDate
      });

    setStartDate(value?.startDate);
    setEndDate(asSingle ? '' : value?.endDate);

    const newPathName = updateSearchParams((name || 'datefilter'), stringifiedValue);
    router.push(newPathName);
  };

  return (
    <section className={`flex flex-col relative w-fit gap-2 ${containerStyle}`}>
      <div className={`flex gap-[8px] items-center w-fit pr-[12px] pl-[8px] py-[6px] rounded-[6px] border border-o-border bg-white ${fieldStyle}`}>
        <div className='text-o-text-dark2 flex items-center text-f14 w-fit'>
          {
            innerLabel &&
            <div className='text-[#B3B7C2] text-f14'>
              {innerLabel}&#160;
            </div>
          }

          {
            (start_date && end_date) ?
              `${moment(start_date).format('ll')} - ${moment(end_date).format('ll')}` :
              start_date ? 
                moment(start_date).format('ll') :
                end_date ? 
                  moment(end_date).format('ll') :
                  asSingle ? 
                    'All' :
                    'Date filter'
          }
        </div>

        <svg 
          className={`${isOpen && 'rotate-[180]'} transition-all`}
          width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M5 7.5L10 12.5L15 7.5" 
            stroke="#818898" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill='transparent'
          />
        </svg>
      </div>

      <div className='w-full h-full cursor-pointer right-0 absolute'>
        <Datepicker 
          inputClassName='cursor-pointer w-[80%] h-full opacity-0'
          containerClassName='w-full h-full'
          toggleClassName='cursor-pointer opacity-0'
          primaryColor={'green'} 
          useRange={false} 
          separator={'to'}
          asSingle={asSingle} 
          placeholder={'YYYY-MM-DD to YYYY-MM-DD'}
          //@ts-ignore
          value={value}
          popoverDirection={popoverDirection || 'down'}
          showShortcuts={showShortcuts || false}
          onChange={handleUpdateParams}
        />
      </div>
    </section>
  )
}

export default DatePicker