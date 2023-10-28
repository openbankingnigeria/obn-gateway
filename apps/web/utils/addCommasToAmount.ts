export const addCommasToAmount = (amount: number = 0): string => {
  const parts = amount?.toString()?.split('.');
  const integerPart = parts[0]?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  return integerPart + decimalPart;
};