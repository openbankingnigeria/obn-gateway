'use client'

import { OustsideClickerProps } from '@/types/componentsTypes/globalComponents';
import { useRef, useEffect, MutableRefObject, ReactNode } from 'react';


function useOutsideClicker(
  ref: MutableRefObject<null>, 
  func: () => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // @ts-ignore
      if (ref.current && !ref.current.contains(event.target)) {
        func();
      }
    }
    
    document.addEventListener('mousedown', (event) => {
      handleClickOutside(event)
    });
    return () => {
      document.removeEventListener('mousedown', (event) => {
        handleClickOutside(event)
      });
    };
  }, [ref, func]);
}


export default function OutsideClicker({ 
  children, func, clickerStyle
}: OustsideClickerProps){
  
  const wrapperRef = useRef(null);
  useOutsideClicker(wrapperRef, func);

  return <div className={`w-full ${clickerStyle}`} ref={wrapperRef}>{children}</div>;
}