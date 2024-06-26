'use client'

import React from 'react';
// import dynamic from 'next/dynamic';
// import MonacoEditor from 'react-monaco-editor';
import { CodeEditorProps } from '@/types/webappTypes/componentsTypes';
// const MonacoEditor = dynamic(import('react-monaco-editor'), { ssr: false });
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/mode-lua';

const CodeEditor = ({
  code, 
  setCode,
  mode = 'javascript'
}: CodeEditorProps) => {

  const handleEditorChange = (newCode: string) => {
    setCode(newCode);
  };

  return (
    <div className='w-full rounded-[6px] overflow-hidden'>
      <AceEditor
        mode={mode}
        theme="twilight"
        onChange={handleEditorChange}
        name="code-editor"
        value={code}
        editorProps={{ $blockScrolling: true }}
      />
    </div>
  )
}

export default CodeEditor