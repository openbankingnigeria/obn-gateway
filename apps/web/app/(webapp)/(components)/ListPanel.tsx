'use client'

import { ListPanelContainerProps } from '@/types/webappTypes/componentsTypes'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getObjectsNotInArrayB } from '@/utils/getObjectNotInArray';
import { FaRegTimesCircle } from "react-icons/fa";

const ListPanel = ({
  panel,
  currentValue,
  setCurrentValue,
  containerStyle
}: ListPanelContainerProps) => {

  const [panelOut, setPanelOut] = useState<any[]>([]);
  const panelRemaining = getObjectsNotInArrayB(panel, panelOut);

  useEffect(() => {
    setPanelOut([panel[0]]);
  }, [panel]);

  const handlePanelList = (data: any) => {
    if (panelOut?.find((item: any) => item?.id == data?.id)) {
      const filteredItem = panelOut?.filter(item => item?.id != data?.id);
      setPanelOut(filteredItem);
      setCurrentValue(panelOut[0]?.value);
    } else {
      setPanelOut((prev: any) => [...prev, data]);
    }
  }

  return (
    <div className={`bg-white border-b border-o-border 
      flex items-center gap-[16px] h-[40px] w-full ${containerStyle}`}
    >
      {
        panelOut?.map((data) => (
          <div 
            key={data?.id} 
            className='relative whitespace-nowrap w-fit flex flex-col px-[4px] pt-[9px] pb-[11px]'
          >
            <div 
              className={`${currentValue == data?.value ? 'text-o-blue font-[500]' : 'text-o-text-medium3'} 
              capitalize text-f14 flex items-center gap-3 hover:text-o-blue`}
            >
              <div 
                onClick={() => setCurrentValue(data?.value)}
                className='w-fit cursor-pointer'
              >
                {data?.label}
              </div>

              <FaRegTimesCircle 
                size={17}
                className='cursor-pointer'
                onClick={() => handlePanelList(data)}
              />
            </div>

            {
              currentValue == data?.value &&
              <motion.div
                className='pane-underline'
                layoutId='top-pane-underline'
              ></motion.div>
            }
          </div>
        ))
      }

      <div className='flex flex-col relative'>
        <button type='button' className='peer' onClick={(e) => e.stopPropagation()}>
          <svg width="28" height="30" viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="30" rx="4" fill="#F6F8FA"/>
            <path d="M13.9998 8.16602V19.8327M8.1665 13.9993H19.8332" stroke="#666D80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="4" y="28" width="20" height="2" fill="#DCE3E8" fillOpacity="0.01"/>
          </svg>
        </button>

        <div className='hidden peer-focus:flex hover:flex absolute bg-white rounded-lg flex-col z-10 border border-o-border right-0 top-[30px] py-[4px] w-[158px] items-start justify-start tablemenu-boxshadow'>
          {
            panelRemaining?.map((data) => (
              <button
                key={data.id}
                className='whitespace-nowrap cursor-pointer hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                onClick={() => handlePanelList(data)}
              >
                <span className='whitespace-nowrap'>
                  {data.label}
                </span>
              </button>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default ListPanel