'use client'

import { updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { formatDateLabel, formatDateRangeLabel } from '@/utils/dateUtils'
import Datepicker, { DateType, DateValueType } from 'react-tailwindcss-datepicker';
import { DatePickerProps } from '@/types/webappTypes/componentsTypes';

const DatePicker = ({
  containerStyle,
  fieldStyle,
  showShortcuts,
  name,
  innerLabel,
  dateFilter,
  changeValue,
  toggleStyle,
  clearField,
  labelStyle,
  label,
  popoverDirection,
  rightIcon,
  placeholder,
  asSingle
}: DatePickerProps) => {

  const date_filter = dateFilter ? JSON.parse(dateFilter) : null;

  const router = useRouter();
  const [start_date, setStartDate] = useState<DateType | undefined>(undefined);
  const [end_date, setEndDate] = useState<DateType | undefined>(undefined);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    setStartDate( 
      clearField ? '' :
        asSingle ? date_filter : 
          date_filter?.start_date
    );
    setEndDate( 
      clearField ? undefined :
        asSingle ? undefined : 
          date_filter?.end_date
    );
  }, [date_filter, asSingle, clearField]);

  const handleUpdateParams = (value: DateValueType) => {
    setOpen(prev => !prev)
    let stringifiedValue = asSingle ? 
      JSON.stringify(value?.startDate)
      :
      JSON.stringify({
        start_date: value?.startDate,
        end_date: value?.endDate
      });

    setStartDate(value?.startDate);
    setEndDate(asSingle ? undefined : value?.endDate);

    const newPathName = updateSearchParams((name || 'date_filter'), stringifiedValue);
    router.push(newPathName);
  };

  const handleChangeValaue = (value: DateValueType) => {
    // @ts-ignore
    value?.startDate && changeValue(value?.startDate)
    setStartDate(value?.startDate);
  }

  let date_value = {
    startDate: start_date,
    endDate: end_date
  };

  return (
    <section className={`flex flex-col relative w-fit gap-2 ${containerStyle}`}>
      <div className='w-full flex flex-col'>
        {
          label &&
          <label className={`text-o-text-medium2 mb-[4px] text-f14 font-[500] ${labelStyle}`}>
            {label}
          </label>
        }
        
        <div className={`flex gap-[8px] items-center w-fit pr-[12px] pl-[8px] py-[6px] rounded-[6px] border border-o-border bg-white ${fieldStyle}`}>
          <div className='text-o-text-dark2 flex items-center text-f14 w-fit'>
            {
              innerLabel &&
              <div className='text-[#B3B7C2] text-f14'>
                {innerLabel}&#160;
              </div>
            }

            {
              (changeValue && start_date) ?
                `${start_date}` :
                  (start_date && end_date) ?
                    formatDateRangeLabel(start_date, end_date) :
                    start_date ? 
                      formatDateLabel(start_date) :
                      end_date ? 
                        formatDateLabel(end_date) :
                        placeholder ?
                          <div className='text-f14 text-o-text-muted'>
                            {placeholder}
                          </div> :
                          asSingle ? 
                            'All' :
                            'Date filter'
            }
          </div>

          {
            rightIcon ||
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
          }
        </div>
      </div>

      <div className='w-full h-full cursor-pointer right-0 absolute'>
        <Datepicker 
          inputClassName='cursor-pointer w-[calc(100%-35px)] h-full opacity-0'
          containerClassName='w-full overflow-hidden h-full'
          toggleClassName={`cursor-pointer mt-[7px] opacity-0 ${toggleStyle}`}
          primaryColor={'green'} 
          useRange={false} 
          separator={'to'}
          asSingle={asSingle} 
          placeholder={'YYYY-MM-DD to YYYY-MM-DD'}
          //@ts-ignore
          value={date_value}
          popoverDirection={popoverDirection || 'down'}
          showShortcuts={showShortcuts || false}
          onChange={
            changeValue ?
              handleChangeValaue :
              handleUpdateParams
          }
        />
      </div>
    </section>
  )
}

export default DatePicker