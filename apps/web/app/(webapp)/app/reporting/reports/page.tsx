import React from 'react'
import { ReportingSection } from '@/app/(webapp)/(components)'

const ReportsPage = () => {
  return (
    <div className='w-full flex flex-col gap-[20px]'>
      <h3 className='text-o-text-dark text-f18 font-[500]'>
        Reports
      </h3>

      <div className='w-full flex flex-col items-start gap-[20px]'>
        <ReportingSection />
      </div>
    </div>
  )
}

export default ReportsPage