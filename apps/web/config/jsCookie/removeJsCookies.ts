import Cookies from 'js-cookie';

export const removeJsCookies = (
  key: string, 
  options: any = {}
) => {
  Cookies.remove(key)
}