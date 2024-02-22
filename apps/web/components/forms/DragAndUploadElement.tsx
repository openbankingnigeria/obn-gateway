'use client'

import { DragAndUploadFile } from '@/app/(webapp)/(components)'
import { DragAndUploadElementProps } from '@/types/componentsTypes/forms'
import React from 'react'

const DragAndUploadElement = ({
  required,
  label,
  disabled,
  name,
  changeValue,
  file,
  value,
  containerStyle,
  labelStyle,
}: DragAndUploadElementProps) => {
  return (
    <section className={`w-full flex flex-col ${containerStyle}`}>
      {
        label &&
        <label className={`text-o-text-medium2 mb-[4px] text-f14 font-[500] ${labelStyle}`}>
          {label}
          {
            !required &&
            <span>{' (optional)'}</span>
          }
        </label>
      }
      
      <DragAndUploadFile 
        name={name}
        selectedFile={value}
        file={file}
        disabled={disabled}
        setSelectedFile={changeValue}
      />
    </section>
  )
}

export default DragAndUploadElement