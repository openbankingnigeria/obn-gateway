'use client'

import { CodeSnippetProps } from '@/types/webappTypes/componentsTypes'
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import React from 'react'
import { toast } from 'react-toastify';

const CodeSnippet = ({
  rawCode,
  codeElement,
  containerStyle
}: CodeSnippetProps) => {

  const handleCopy = () => {
    copyTextToClipboard(rawCode)
      .then(() => {
        console.log('Copied.');
        toast.success('Code snippet copied');
      })
      .catch((err) => {
        console.log(err);
        toast.error('Error copying Code snippet');
      });
  };

  return (
    <section className={`w-full max-h-[345px] font-robotoMono flex flex-col overflow-hidden rounded-[12px] bg-[#0E171F] border border-[#3E5463] ${containerStyle}`}>
      <header className='w-full border-b border-[#2A3F4D] flex justify-end py-[8px] px-[16px]'>
        <button 
          className='cursor-pointer w-fit flex gap-[8px] items-center text-f12 font-[500] text-[#F2F5F7]'
          onClick={handleCopy}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_828_6432)">
              <path d="M10.6668 5.33398V3.46732C10.6668 2.72058 10.6668 2.34721 10.5215 2.062C10.3937 1.81111 10.1897 1.60714 9.93882 1.47931C9.6536 1.33398 9.28023 1.33398 8.5335 1.33398H3.46683C2.72009 1.33398 2.34672 1.33398 2.06151 1.47931C1.81063 1.60714 1.60665 1.81111 1.47882 2.062C1.3335 2.34721 1.3335 2.72058 1.3335 3.46732V8.53398C1.3335 9.28072 1.3335 9.65409 1.47882 9.93931C1.60665 10.1902 1.81063 10.3942 2.06151 10.522C2.34672 10.6673 2.72009 10.6673 3.46683 10.6673H5.3335M7.46683 14.6673H12.5335C13.2802 14.6673 13.6536 14.6673 13.9388 14.522C14.1897 14.3942 14.3937 14.1902 14.5215 13.9393C14.6668 13.6541 14.6668 13.2807 14.6668 12.534V7.46732C14.6668 6.72058 14.6668 6.34721 14.5215 6.062C14.3937 5.81111 14.1897 5.60714 13.9388 5.47931C13.6536 5.33398 13.2802 5.33398 12.5335 5.33398H7.46683C6.72009 5.33398 6.34672 5.33398 6.06151 5.47931C5.81063 5.60714 5.60665 5.81111 5.47882 6.062C5.3335 6.34721 5.3335 6.72058 5.3335 7.46732V12.534C5.3335 13.2807 5.3335 13.6541 5.47882 13.9393C5.60665 14.1902 5.81063 14.3942 6.06151 14.522C6.34672 14.6673 6.72009 14.6673 7.46683 14.6673Z" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill='transparent'
              />
            </g>
            <defs>
              <clipPath id="clip0_828_6432">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>

          Copy
        </button>
      </header>

      <div className='p-[24px] max-h-[305px] overflow-auto text-white w-full'>
        {
          codeElement ?
            <pre dangerouslySetInnerHTML={{
              __html: codeElement
            }} />
            :
            <pre className='w-full h-fit'>
              {rawCode}
            </pre>
        }
      </div>
    </section>
  )
}

export default CodeSnippet