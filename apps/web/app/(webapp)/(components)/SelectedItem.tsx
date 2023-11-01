import React from 'react'

interface SelectedItemProps {
  effect: () => void;
  containerStyle?: string;
  labelStyle?: string;
  label: string;
}

const SelectedItem = ({
  effect,
  containerStyle,
  labelStyle,
  label
}: SelectedItemProps) => {

  return (
    <div 
      className={`cursor-pointer w-fit flex items-center gap-[6px] ${containerStyle}`}
      onClick={effect}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" 
          fill="#459572"
        />
        <path 
          d="M8.28033 11.7751C7.98744 11.4822 7.51256 11.4822 7.21967 11.7751C6.92678 12.068 6.92678 12.5429 7.21967 12.8358L9.94202 15.5581C10.2349 15.851 10.7098 15.851 11.0027 15.5581L17.447 9.11383C17.7399 8.82093 17.7399 8.34606 17.447 8.05317C17.1541 7.76027 16.6792 7.76027 16.3863 8.05317L10.4724 13.9672L8.28033 11.7751Z" 
          fill="white"
        />
      </svg>

      <span className={`text-o-text-dark text-f14 ${labelStyle}`}>
        {label}
      </span>
    </div>
  )
}

export default SelectedItem