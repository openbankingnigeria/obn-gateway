import React from 'react'
import { BVN, BillsPayments, Cards, Consents, CoreBanking, DirectDebit, ExternalRegistry, Transfers } from './(externalServices)'

const ExternalServicesPage = () => {
  return (
    <div className='w-full flex-col flex gap-[24px]'>
      <ExternalRegistry />
      <CoreBanking />
      <Consents />
      <Transfers />
      <BillsPayments />
      <BVN />
      <Cards />
      <DirectDebit />
    </div>
  )
}

export default ExternalServicesPage