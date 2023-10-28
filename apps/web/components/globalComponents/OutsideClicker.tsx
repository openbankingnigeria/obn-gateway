'use client'

import { useRef, useEffect, MutableRefObject, ReactNode } from 'react';

function useOutsideClicker(
  ref: MutableRefObject<null>, 
  func: () => void
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
  children, func
}: { children: ReactNode, func: () => void }){
  const wrapperRef = useRef(null);
  useOutsideClicker(wrapperRef, func);

  return <div className='w-full' ref={wrapperRef}>{children}</div>;
}