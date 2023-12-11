'use client'

import { postGenerateReport } from '@/actions/reportActions';
import { DatePicker } from '@/app/(webapp)/(components)';
import { SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents';
import { CONSUMERS_TABLE_DATA, CONSUMERS_TABLE_FULLDATA } from '@/data/consumerData';
import { OptionsProps } from '@/types/componentsTypes/forms';
import React, { useState } from 'react';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'

const ReportForms = () => {
  const [report_type, setReportType] = useState('');
  const [from, setFrom] = useState<string | undefined>('');
  const [to, setTo] = useState<string | undefined>('');
  const [consumers, setConsumers] = useState<OptionsProps[]>([]);

  const consumers_list = CONSUMERS_TABLE_FULLDATA?.map((consumer) => {
    return({
      label: consumer?.name,
      value: consumer?.id?.toString()
    });
  })

  const incorrect = (
    !report_type ||
    !from ||
    !to ||
    consumers.length === 0
  );

  const initialState = {
    message: null,
  }

  const report_type_list = [
    {
      label: 'API Performance Levels',
      value: 'api_performance_levels'
    }
  ];

  const handleClearAll = () => {
    setReportType('')
    setFrom(undefined)
    setTo(undefined)
    setConsumers([])
  };

  const sanitizedConsumers = consumers?.map(consumer => {
    return consumer?.value;
  })

  const [state, formAction] = useFormState(postGenerateReport, initialState);
  state?.message

  return (
    <section className='min-w-[430px] flex flex-col gap-[20px]'>
      <form 
        action={incorrect ? '' : formAction}
        className='p-[20px] flex flex-col gap-[24px] rounded-[8px] border border-o-border bg-white'
      >
        <div className='w-full flex flex-col gap-[16px]'>
          <div className='w-full'>
            <input 
              name='report_type'
              value={report_type}
              readOnly
              className='hidden opacity-0'
            />

            <SelectElement 
              name='report_type'
              options={report_type_list}
              label='Report Type'
              placeholder='Select'
              required
              optionStyle='top-[70px]'
              clickerStyle='!w-full'
              value={report_type}
              changeValue={setReportType}
            />
          </div>

          <div className='w-full flex items-center gap-[16px]'>
            <div className='w-full'>
              <input 
                name='from'
                value={from}
                readOnly
                className='hidden opacity-0'
              />

              <DatePicker 
                containerStyle={'!w-full'}
                name={'from'}
                changeValue={setFrom}
                label='From'
                fieldStyle='!px-[14px] !w-full justify-between !py-[12px]'
                popoverDirection='down'
                placeholder='YYYY-MM-DD'
                toggleStyle='!mt-[35px]'
                clearField={from === undefined}
                asSingle
                rightIcon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M17.5 8.33268H2.5M13.3333 1.66602V4.99935M6.66667 1.66602V4.99935M6.5 18.3327H13.5C14.9001 18.3327 15.6002 18.3327 16.135 18.0602C16.6054 17.8205 16.9878 17.4381 17.2275 16.9677C17.5 16.4329 17.5 15.7328 17.5 14.3327V7.33268C17.5 5.93255 17.5 5.23249 17.2275 4.69771C16.9878 4.2273 16.6054 3.84485 16.135 3.60517C15.6002 3.33268 14.9001 3.33268 13.5 3.33268H6.5C5.09987 3.33268 4.3998 3.33268 3.86502 3.60517C3.39462 3.84485 3.01217 4.2273 2.77248 4.69771C2.5 5.23249 2.5 5.93255 2.5 7.33268V14.3327C2.5 15.7328 2.5 16.4329 2.77248 16.9677C3.01217 17.4381 3.39462 17.8205 3.86502 18.0602C4.3998 18.3327 5.09987 18.3327 6.5 18.3327Z" 
                      stroke="#818898" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      fill='transparent' 
                    />
                  </svg>
                }
              /> 
            </div>

            <div className='w-full'>
              <input 
                name='to'
                value={to}
                readOnly
                className='hidden opacity-0'
              />

              <DatePicker 
                containerStyle={'!w-full'}
                name={'to'}
                changeValue={setTo}
                label='To'
                fieldStyle='!px-[14px] !w-full justify-between !py-[12px]'
                popoverDirection='down'
                placeholder='YYYY-MM-DD'
                toggleStyle='!mt-[35px]'
                clearField={to === undefined}
                asSingle
                rightIcon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M17.5 8.33268H2.5M13.3333 1.66602V4.99935M6.66667 1.66602V4.99935M6.5 18.3327H13.5C14.9001 18.3327 15.6002 18.3327 16.135 18.0602C16.6054 17.8205 16.9878 17.4381 17.2275 16.9677C17.5 16.4329 17.5 15.7328 17.5 14.3327V7.33268C17.5 5.93255 17.5 5.23249 17.2275 4.69771C16.9878 4.2273 16.6054 3.84485 16.135 3.60517C15.6002 3.33268 14.9001 3.33268 13.5 3.33268H6.5C5.09987 3.33268 4.3998 3.33268 3.86502 3.60517C3.39462 3.84485 3.01217 4.2273 2.77248 4.69771C2.5 5.23249 2.5 5.93255 2.5 7.33268V14.3327C2.5 15.7328 2.5 16.4329 2.77248 16.9677C3.01217 17.4381 3.39462 17.8205 3.86502 18.0602C4.3998 18.3327 5.09987 18.3327 6.5 18.3327Z" 
                      stroke="#818898" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      fill='transparent' 
                    />
                  </svg>
                }
              /> 
            </div>
          </div>

          <div className='w-full'>
            <input 
              name='consumers'
              value={sanitizedConsumers}
              readOnly
              className='hidden opacity-0'
            />

            <SelectElement 
              name='consumers'
              options={consumers_list}
              label='Select Consumer(s)'
              placeholder='Select'
              multiple
              required
              optionStyle='top-[70px]'
              clickerStyle='!w-full'
              value={consumers}
              changeValue={setConsumers}
            />
          </div>
        </div>

        <div className='w-full bg-white flex items-center gap-[24px] justify-between'>
          <Button 
            title='Clear all'
            effect={handleClearAll}
            small
            outlined
          />

          <Button 
            type='submit'
            title='Generate'
            containerStyle='!w-[90px]'
            disabled={incorrect}
            small
          />
        </div>
      </form>
    </section>
  )
}

export default ReportForms