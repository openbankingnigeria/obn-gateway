import { ConfigurationBoxProps } from '@/types/webappTypes/componentsTypes'
import React from 'react'

const ConfigurationBox = ({
  value,
  noOfApis
}: ConfigurationBoxProps) => {
  const isGreen = Boolean(!noOfApis || Number(value) == Number(noOfApis));

  return (
    <div className={`w-fit 
      ${isGreen ? 'text-white bg-[#459572]' : 'bg-[#F6C344] text-o-text-dark'}
      text-f12 font-[500] px-[8px] rounded-full`}
    >
      {`${value}${noOfApis ? `/${noOfApis}` : ''}`}
    </div>
  )
}

export default ConfigurationBox