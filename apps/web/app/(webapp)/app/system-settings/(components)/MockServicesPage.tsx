import React from 'react'
import { BVN, BillsPayments, Cards, Consents, DirectDebit, MockRegistry, Transfers } from './(mockServices)'

const MockServicesPage = () => {
  return (
    <div className='w-full flex-col flex gap-[24px]'>
      <MockRegistry />
      <Consents />
      <Transfers />
      <BillsPayments />
      <BVN />
      <Cards />
      <DirectDebit />
    </div>
  )
}

export default MockServicesPage