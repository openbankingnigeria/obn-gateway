// @ts-nocheck
'use client'

import { logOutAction } from '@/actions/authActions';
import React, { useRef, useEffect } from 'react';
import { experimental_useFormState as useFormState } from 'react-dom'

const Logout = () => {
  const myButtonRef = useRef(null);

  useEffect(() => {
    if (myButtonRef.current) {
      myButtonRef.current.click();
      console.log('logged out')
    }
  }, []);

  const [state, formAction] = useFormState(logOutAction, {});
  return (
    <form action={formAction}>
      <button 
        ref={myButtonRef} 
        type='submit' 
      />
    </form>
  )
}

export default Logout