'use client'

import { Button } from '@/components/globalComponents'
import { confirmCancelProps } from '@/types/webappTypes/appTypes'
import { AnimatePresence, motion} from 'framer-motion'
import React from 'react'

const ConfirmCancel = ({
  close,
  next
}: confirmCancelProps) => {
  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        exit={{ opacity: 0, transition: { delay: 0.2 } }}
        className='z-[80] absolute h-[calc(100%-20px)] w-full flex flex-col justify-end transparent-white'
      >
        <motion.div
          layout
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          onAnimationStart={() => scrollTo(0, 0)}
          transition={{ duration: 0.3, type: 'spring', stiffness: 700, damping: 30 }} 
          className='w-full relative flex flex-col bg-white border-t border-o-border p-[20px]'
        >
          <div className='flex flex-col mb-[74px] h-fit gap-[24px] w-full'>
            <h3 className='font-[500] text-f20 text-o-text-dark'>
              Are you sure you want to leave?
            </h3>

            <div className='text-f14 text-o-text-medium3'>
              You seem to still be working on this. 
              You may lose all the information 
              you’ve entered so far if you leave now.
            </div>
          </div>

          <div className='w-full py-[20px] h-[70px] pr-[40px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
            <Button 
              title='Cancel'
              effect={() => close()}
              small
              outlined
            />

            <Button 
              type='button'
              title='Leave'
              effect={() => next()}
              containerStyle='!w-[70px]'
              danger
              small
            />
          </div>
        </motion.div>
      </motion.section>
    </AnimatePresence>
  )
}

export default ConfirmCancel