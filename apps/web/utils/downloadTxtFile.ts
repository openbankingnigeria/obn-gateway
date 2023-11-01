export const downloadTxtFile = (value: string, name: string) => {
  const text = value;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = name + '.txt';

  a.click();
  URL.revokeObjectURL(url);
}