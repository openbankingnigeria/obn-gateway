'use client'

import { Button } from '@/components/globalComponents'
import { TwoFactorAuthModalProps } from '@/types/webappTypes/componentsTypes'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import TwoFactorAuthForm from './TwoFactorAuthForm'

const TwoFactorAuthBottomModal = ({
  close,
  title,
  loading,
  next,
}: TwoFactorAuthModalProps) => {
  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        exit={{ opacity: 0, transition: { delay: 0.2 } }}
        className='z-[80] absolute h-[calc(100%-90px)] w-full flex flex-col justify-end transparent-white'
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
              {title}
            </h3>

            <div className='text-f14 text-o-text-medium3'>
              You have two-factor authentication set up on your account for added security. 
              <br /><br />
              Enter the six-digit code from your authenticator app on your registered mobile device.
            </div>
          </div>

          <TwoFactorAuthForm 
            close={close}
            loading={loading}
            next={next}
          />
        </motion.div>
      </motion.section>
    </AnimatePresence>
  )
}

export default TwoFactorAuthBottomModal