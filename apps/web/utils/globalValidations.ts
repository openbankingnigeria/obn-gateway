export const validateUppercase = (value: string) => 
  value?.toString()?.match(/^(?=.*[A-Z])/);

export const validateLowercase = (value: string) => 
  value?.toString()?.match(/^(?=.*[a-z])/);

export const validateNumber = (value: string) => 
  value?.toString()?.match(/^(?=.*[0-9])/);

export const validateSymbol = (value: string) => 
  value?.toString()?.match(/^(?=.*\W)/);

export const greaterThan8 = (value: string) => 
  value?.toString()?.match(/^(?=.{8,}$)/);

export const validateEmail = (value: string) => 
  value?.toString()?.match(/^[A-Za-z0-9._%-+]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/);

export const validateName = (value: string) => 
  value?.toString()?.match(/^[a-zA-Z-]+$/) && value.length >= 2