'use client'

import { DownloadButton } from '@/app/(webapp)/(components)';
import React from 'react'

const Report = () => {
  const data: any[] = [];

  return (
    <section className='w-full relative  h-[calc(100vh-190px)] p-[20px] flex flex-col justify-center items-center rounded-[8px] border border-o-border bg-o-bg2'>
      <div className='w-fit text-black text-f16 font-[500]'>
        Report here
      </div>

      <div className='absolute bottom-[20px] right-[20px]'>
        <DownloadButton data={data} />
      </div>
    </section>
  )
}

export default Report