import React from 'react'
import { Report, ReportForms } from './(components)'

const ReportsPage = () => {
  return (
    <div className='w-full flex flex-col gap-[20px]'>
      <h3 className='text-o-text-dark text-f18 font-[500]'>
        Reports
      </h3>

      <div className='w-full flex items-start gap-[20px]'>
        <ReportForms />
        <Report />
      </div>
    </div>
  )
}

export default ReportsPage