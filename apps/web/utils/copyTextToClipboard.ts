// export const copyTextToClipboard = async (text: string) => {
//   if ('clipboard' in navigator) {
//     return await navigator.clipboard.writeText(text);
//   } else {
//     return document.execCommand('copy', true, text);
//   }
// };
  

export const copyTextToClipboard = async (text: string) => {
  try {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    return true; 
  } catch (error) {
    console.error('Error copying text to clipboard:', error);
    return false; 
  }
};