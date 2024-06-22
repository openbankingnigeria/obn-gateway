'use client'

import React, { useState, useEffect } from 'react';
import { removeJsCookies } from '@/config/jsCookie';

interface LogoutTimerProps {
  timeout: number;
}

const LogoutTimer: React.FC<LogoutTimerProps> = ({ timeout }) => {
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsActive(false);
        console.log('<<< inactivity logout >>>')
        removeJsCookies('aperta-user-accessToken');
        window.location.href = '/';
      }, Math.min(timeout, 2 ** 31 - 1));
    };

    const handleActivity = (event: any) => {
      if (!isActive) {
        setIsActive(true);
        resetTimer();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => handleActivity(event));
    });

    resetTimer();
    
    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, () => handleActivity(event));
      });
    };
  }, [timeout, isActive]);

  return null;
};

export default LogoutTimer;
