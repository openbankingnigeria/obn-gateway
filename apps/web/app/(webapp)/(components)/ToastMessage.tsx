'use client'

import { useEffect } from 'react';
import { toast } from 'react-toastify';

const ToastMessage = ({ message }: { message: string }) => {
  useEffect(() => {
    (message?.toLowerCase()?.includes('invalid credentials')) ?
      null :
      toast.error(message);
  }, []);

  return null
}

export default ToastMessage