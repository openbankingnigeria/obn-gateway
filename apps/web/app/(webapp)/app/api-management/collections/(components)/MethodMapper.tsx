'use client'

import { SelectElement } from '@/components/forms'
import { IoSwapHorizontal } from 'react-icons/io5'

interface MethodMapperProps {
  downstreamMethod: string
  upstreamMethod: string
  onDownstreamChange: (value: string) => void
  onUpstreamChange: (value: string) => void
  disabled?: boolean
  showLabel?: boolean
}

export const MethodMapper = ({
  downstreamMethod,
  upstreamMethod,
  onDownstreamChange,
  onUpstreamChange,
  disabled = false,
  showLabel = true,
}: MethodMapperProps) => {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']

  return (
    <div className='flex flex-col gap-[12px]'>
      {showLabel && (
        <div className='flex flex-col gap-[6px]'>
          <label className='text-f14 font-[600] text-o-text-dark'>
            HTTP Method Mapping
          </label>
          <p className='text-f12 text-o-text-medium3'>
            Configure different HTTP methods for gateway (downstream) and backend API (upstream).
            This allows method transformation like POST → PUT or GET → POST.
          </p>
        </div>
      )}

      <div className='flex items-center gap-[12px] p-[20px] bg-o-bg-disabled rounded-[8px] border border-o-border'>
        <div className='flex-1'>
          <SelectElement
            name='downstreamMethod'
            label='Gateway Method (Client-Facing)'
            value={downstreamMethod}
            changeValue={onDownstreamChange}
            options={methods.map((m) => ({ value: m, label: m }))}
            disabled={disabled}
          />
        </div>

        <IoSwapHorizontal size={24} className='text-o-text-medium3 mt-[20px]' />

        <div className='flex-1'>
          <SelectElement
            name='upstreamMethod'
            label='Backend Method (Upstream API)'
            value={upstreamMethod}
            changeValue={onUpstreamChange}
            options={methods.map((m) => ({ value: m, label: m }))}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
