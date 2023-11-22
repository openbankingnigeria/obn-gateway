'use client'

export const setStorage = (
  key: string,
  value: any,
  type: 'local' | 'session' = 'local',
) => {
  if (typeof window !== 'undefined') {
    try {
      const storage = type === 'session' ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${type}Storage:`, error);
    }
  } else {
    return;
  }
};