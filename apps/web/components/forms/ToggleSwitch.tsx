'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ToogleSwitchProps } from '@/types/componentsTypes/forms';

function ToggleSwitch({
  toggle,
  loading, 
  disabled,
  setToggle
}: ToogleSwitchProps) {
  
  const toggleSwitch = () => setToggle(!toggle);
  const spring = {
    type: 'spring',
    stiffness: 700,
    damping: 30
  };

  return (
    <div 
      className={`flex ${toggle ? 'justify-end bg-o-green3' : 'justify-start bg-o-border'}
      w-[36px] h-[20px] p-[2px] cursor-pointer items-center rounded-[12px] ${disabled && '!cursor-not-allowed opacity-60'}
      `}
      onClick={
        disabled ? () => null : 
        toggleSwitch
      }
    >
      <motion.div 
        className="min-w-[16px] rounded-full min-h-[16px] bg-white toggle-boxshadow" 
        layout 
        transition={spring} 
      />
    </div>
  );
}

export default ToggleSwitch;