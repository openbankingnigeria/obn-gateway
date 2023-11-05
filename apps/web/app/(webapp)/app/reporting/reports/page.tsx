import React from 'react'
import { Report, ReportForms } from './(components)'

const ReportsPage = () => {
  return (
    <div className='w-full flex items-start gap-[20px]'>
      <ReportForms />
      <Report />
    </div>
  )
}

export default ReportsPage