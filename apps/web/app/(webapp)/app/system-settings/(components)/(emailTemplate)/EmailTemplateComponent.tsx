'use client'

import { CodeEditor, CodeSnippet } from '@/app/(webapp)/(components)'
import { InputElement, SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'
import * as API from '@/config/endpoints';

const EmailTemplateComponent = ({ rawData }: APIConfigurationProps) => {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(rawData?.title);
  const [body, setBody] = useState(rawData?.body);

  const incorrect = (
    !title ||
    !body
  );

  const isChanged = (
    title != rawData?.title ||
    body != rawData?.body
  )

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.updateSettings({
          type: 'email_templates',
        }),
        method: 'PUT',
        data: {
          title,
          body,
          temmplateId: rawData?.id
        }
      });

    if (result?.message) {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='gap-[20px] flex flex-col w-full pb-[24px] border-b border-o-border'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            {rawData?.title}
          </h3>

          {/* <div className='text-o-text-medium3 text-f14'>
            Modify the email sent when a user is invited to the system.
          </div> */}
        </div>

        <div className='w-fit flex items-center gap-[8px]'>
          <Button 
            title='Preview'
            type='button'
            containerStyle='!w-fit'
            outlined
            small
          />

          <Button 
            title='Save changes'
            type='submit'
            loading={loading}
            containerStyle='!w-[120px]'
            disabled={incorrect || !isChanged}
            small
          />
        </div>
      </div>

      <section className='w-full flex items-start gap-[20px]'>
        <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
          <InputElement 
            name='title'
            label='Title'
            placeholder='Email title'
            value={title}
            changeValue={setTitle}
            required
          />
        </div>

        <div className='w-full'>
          <CodeEditor 
            code={body}
            setCode={setBody}
          />
        </div>
      </section>
    </form>
  )
}

export default EmailTemplateComponent