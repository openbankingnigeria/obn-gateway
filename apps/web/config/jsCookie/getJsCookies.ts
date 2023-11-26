import Cookies from 'js-cookie';

export const getJsCookies = (key: string) => {
  return Cookies.get(key);
}