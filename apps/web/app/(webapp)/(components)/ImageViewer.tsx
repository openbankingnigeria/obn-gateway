'use client'

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageViewerProps } from '@/types/webappTypes/componentsTypes';
import Image from 'next/image';
import { ImFilePicture } from "react-icons/im";
import { base64toBlob } from '@/utils/base64toBlob';

function ImageViewer({
  effect,
  title,
  file,
  fileType,
  backgroundStyles,
  modalStyles
}: ImageViewerProps) {

  // const blob = base64toBlob(file);
  // const url = URL.createObjectURL(blob);
  // console.log(url);

  const dataUrl = `data:application/pdf;base64,${file}`;

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
        <div className='fixed bg-transparent w-full top-0 right-0 left-0 flex items-center justify-between py-[16px] px-[16px]'>
          <h3 className='text-white font-[500] flex items-center gap-2 text-f16'>
            <ImFilePicture 
              size={20}
              className='text-white'
            />
            {title}
          </h3>

          <div 
            className='cursor-pointer w-fit h-fit flex items-center gap-2 text-f16 font-[700] text-white'
            onClick={effect}
          >
            Close
            <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M15.5 5L5.5 15M5.5 5L15.5 15" 
                stroke="#FFFFFF" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill='transparent'
              />
            </svg>
          </div>
        </div>

        <motion.div
          layout
          initial={{ scale: 0 }}
          animate={{ scale: 1, transition: { duration: 0.2, type: 'spring', stiffness: 700, damping: 30 } }}
          exit={{ scale: 0, transition: { delay: 0.2 } }}
          className={`flex h-[90vh] relative w-full sm:w-[650px] z-[75] overflow-x-hidden  overflow-y-visible
           rounded-[12px] bg-transparent justify-center ${title && 'pt-[56px]'} ${modalStyles}`}
          onClick={(e) => e.stopPropagation()}
        >
          {
            fileType?.includes('application') ?
              <iframe src={dataUrl} width="650px%" height="650px"></iframe>
              :
              <Image 
                src={`data:${fileType};base64,${file}`} 
                className='object-contain' 
                alt='example' 
                width={650}
                height={650}
              />
          }
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ImageViewer;