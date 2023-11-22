'use client'

export const getStorage = (
  key: string,
  parse: boolean = false,
  type: 'local' | 'session' = 'local',
) => {
  if (typeof window !== 'undefined') {
    try {
      const storage = type === 'session' ? sessionStorage : localStorage;
      const storedData = storage.getItem(key);

      if (parse) {
        return storedData ? JSON.parse(storedData) : null;
      } else {
        return storedData || '';
      }
    } catch (error) {
      console.error(`Error retrieving data from ${type}Storage:`, error);
      return parse ? null : '';
    }
  } else {
    return parse ? null : '';
  }
};