import { Loader } from '@/components/globalComponents';
import React, { ReactNode } from 'react'

interface ViewDataProps {
  label: string;
  value: ReactNode | string
  loading?: boolean;
}

const ViewData = ({
  label,
  value,
  loading
}: ViewDataProps) => {
  return (
    <section className='w-full flex flex-col gap-[4px]'>
      <h4 className='capitalize text-f12 font-[500] text-o-text-muted'>
        {label}
      </h4>

      <div className='text-f14 font-[500] text-o-text-dark3'>
        {
          loading ?
            <Loader />
            :
            value
        }
      </div>
    </section>
  )
}

export default ViewData