import Cookies from 'js-cookie';

export const setJsCookies = (
  key: string, 
  value: any,
  options: any = {}
) => {
  Cookies.set(key, value)
}