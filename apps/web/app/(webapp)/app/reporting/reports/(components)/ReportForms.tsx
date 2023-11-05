'use client'

import { SelectElement } from '@/components/forms'
import React, { useState } from 'react'

const ReportForms = () => {
  const [report_type, setReportType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [consumers, setConsumers] = useState([]);

  const report_type_list = [
    {
      label: 'API Performance Levels',
      value: 'api_performance_levels'
    }
  ];

  return (
    <section className='max-w-[430px] flex flex-col gap-[20px]'>
      <h3 className='text-o-text-dark text-f18 font-[500]'>
        Reports
      </h3>

      <form 
        action={''}
        className='p-[20px] flex flex-col gap-[24px] rounded-[8px] border border-o-border bg-white'
      >
        <div className='w-full flex flex-col gap-[16px]'>
          <>
            <input 
              name='report_type'
              value={report_type}
              readOnly
              className='hidden opacity-0'
            />

            <SelectElement 
              name='report_type'
              options={report_type_list}
              required
              optionStyle='top-[45px]'
              clickerStyle='!w-full'
              value={report_type}
              changeValue={setReportType}
            />
          </>
        </div>
      </form>
    </section>
  )
}

export default ReportForms