import React from 'react'

interface StatusBoxProps {
  status: string
}

const StatusBox = ({ status }: StatusBoxProps) => {
  const sanitizedStatus = status.toLowerCase();

  return (
    sanitizedStatus == 'active' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 font-[500] w-fit rounded-full text-white bg-o-status-green'>
        Active
      </span>
    ) 
    : sanitizedStatus === 'pending' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 font-[500] w-fit rounded-full text-o-text-dark bg-o-status-yellow'>
        Pending
      </span>
    )
    : sanitizedStatus === 'inactive' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 font-[500] w-fit rounded-full text-white bg-o-status-gray'>
        Inactive
      </span>
    )
    : sanitizedStatus === 'rejected' ? (
      <span className='whitespace-nowrap px-[8px] py-[3px] text-f12 font-[500] w-fit rounded-full text-white bg-o-status-red'>
        Rejected
      </span>
    )
    : null
  )
}

export default StatusBox