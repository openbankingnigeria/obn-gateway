export function truncateString(str: string, maxLength: number) {
  if (str?.length <= maxLength) {
    return str;
  } else {
    return str?.slice(0, maxLength) + '...';
  }
}