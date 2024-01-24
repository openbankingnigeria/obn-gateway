'use client'

import React from 'react';
import dynamic from 'next/dynamic';
// import MonacoEditor from 'react-monaco-editor';
import { CodeEditorProps } from '@/types/webappTypes/componentsTypes';
const MonacoEditor = dynamic(import('react-monaco-editor'), { ssr: false });

const CodeEditor = ({
  code, 
  setCode
}: CodeEditorProps) => {

  const handleEditorChange = (newCode: string, event: any) => {
    setCode(newCode);
  };

  const options = {
    autoIndent: 'full',
    contextmenu: true,
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: 'always',
    minimap: {
      enabled: true,
    },
    scrollbar: {
      horizontalSliderSize: 4,
      verticalSliderSize: 18,
    },
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
  }; 

  return (
    <div className='w-full rounded-[6px] overflow-hidden'>
      <MonacoEditor
        width="800"
        height="400"
        language="javascript"
        theme="vs-dark"
        value={code}
        defaultValue={code}
        // options={options}
        onChange={handleEditorChange}
      />
    </div>
  )
}

export default CodeEditor