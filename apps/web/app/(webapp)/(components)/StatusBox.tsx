import React from 'react'

interface StatusBoxProps {
  status: string
}

const StatusBox = ({ status }: StatusBoxProps) => {
  const sanitizedStatus = status?.toLowerCase();

  return (
    sanitizedStatus == 'active' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Active
      </span>
    ) 
    : sanitizedStatus == 'success' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Success
      </span>
    ) 
    : sanitizedStatus == 'approved' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Approved
      </span>
    ) 
    : sanitizedStatus === 'read' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-green'>
        Read
      </span>
    )
    : sanitizedStatus === 'pending' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Pending
      </span>
    )
    : sanitizedStatus === 'write' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Write
      </span>
    )
    : sanitizedStatus === 'submitted' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-dark bg-o-status-yellow'>
        Submitted for verification
      </span>
    )
    : sanitizedStatus === 'inactive' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-gray'>
        Inactive
      </span>
    )
    : sanitizedStatus === 'auth' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-gray'>
        Auth
      </span>
    )
    : sanitizedStatus === 'payments' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-blue'>
        Payments
      </span>
    )
    : sanitizedStatus === 'invited' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-blue'>
        Invited
      </span>
    )
    : sanitizedStatus === 'revoked' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-orange'>
        Revoked
      </span>
    )
    : sanitizedStatus === 'rejected' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Rejected
      </span>
    )
    : sanitizedStatus === 'denied' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Denied
      </span>
    )
    : sanitizedStatus === 'declined' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Declined
      </span>
    )
    : sanitizedStatus === 'business' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Business
      </span>
    )
    : sanitizedStatus === 'licensed-entity' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Licensed Entity
      </span>
    )
    : sanitizedStatus === 'individual' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Individual
      </span>
    )
    : sanitizedStatus === 'status' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        Status
      </span>
    )
    : sanitizedStatus === 'failed' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-white bg-o-status-red'>
        Failed
      </span>
    )
    : <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 text-center font-[500] w-fit capitalize rounded-full text-o-text-medium3 bg-[#E6E7EB]'>
        {status}
      </span>
  )
}

export default StatusBox