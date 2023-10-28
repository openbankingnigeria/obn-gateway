export const getElementAndBelow = (arr: string[], element: string | never) => {
  const index: any = arr.indexOf(element);

  if (index !== -1) {
    const selectedElement = arr[index];
    const elementsBelow = arr.slice(0, index + 1);
    return { 
      selectedElement, 
      elementsBelow 
    };
  } else {
    return { 
      selectedElement: '', 
      elementsBelow: []
    };;
  }
}