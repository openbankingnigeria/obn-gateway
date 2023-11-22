'use client'

export const removeStorage = (
  key: string,
  type: 'local' | 'session' = 'local',
) => {
  if (typeof window !== 'undefined') {
    try {
      const storage = type === 'session' ? sessionStorage : localStorage;
      storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from ${type}Storage:`, error);
    }
  } else {
    return;
  }
};