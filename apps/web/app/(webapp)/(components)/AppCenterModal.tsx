'use client'

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppModalProps } from '@/types/webappTypes/componentsTypes';

function AppModal({
  children,
  effect,
  title,
  backgroundStyles,
  modalStyles
}: AppModalProps) {

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`modal-bg z-[500] w-full py-[24px] px-[16px] h-screen
        top-0 left-0 bottom-0 right-0 fixed flex justify-center items-center 
        ${backgroundStyles}`}
        onClick={effect}
        transition={{ duration: 0.2 }}
        exit={{ opacity: 0, transition: { delay: 0.2 } }}
      >
        <motion.div
          layout
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { duration: 0.2, type: 'spring', stiffness: 700, damping: 30 } }}
          exit={{ scale: 0, transition: { delay: 0.2 } }}
          className={`block max-h-[552px] relative w-full sm:w-[571px] z-[75] overflow-x-hidden  overflow-y-visible
           rounded-[12px] bg-white ${title && 'pt-[52px]'} ${modalStyles}`}
          onClick={(e) => e.stopPropagation()}
        >
          {
            title &&
            <div className='w-full flex absolute bg-white top-0 items-start justify-between pt-[20px] pb-[5px] px-[20px] gap-[8px] md:gap-[12px]'>
              <h3 className='text-o-text-dark font-[500] text-f20'>
                {title}
              </h3>

              <div 
                className='cursor-pointer w-fit h-fit'
                onClick={effect}
              >
                <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M15.5 5L5.5 15M5.5 5L15.5 15" 
                    stroke="#36394A" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill='transparent'
                  />
                </svg>
              </div>
            </div>
          }

          <div className='px-[20px] py-[20px] w-full'>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AppModal;