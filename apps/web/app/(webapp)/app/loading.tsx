import { Loader } from '@/components/globalComponents'
import React from 'react'

function loading() {
  return (
    <section className='w-full h-[calc(100vh-81px)] flex items-center justify-center'>
      <Loader medium />
    </section>
  )
}

export default loading