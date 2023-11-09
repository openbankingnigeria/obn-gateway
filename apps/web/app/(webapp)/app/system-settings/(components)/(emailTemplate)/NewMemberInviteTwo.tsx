'use client'

import { updateNewMemberInvite } from '@/actions/systemSettingActions'
import { CodeSnippet } from '@/app/(webapp)/(components)'
import { InputElement, SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import React, { useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify'

const NewMemberInviteTwo = () => {
  const [subject, setSubject] = useState('Your Open Banking Portal Access');
  const [group, setGroup] = useState('no');

  const incorrect = (
    !subject ||
    !group
  );

  const initialState = {
    message: null,
    location: 'new_member_invite2'
  }

  const isChanged = (
    subject != 'Your Open Banking Portal Access' ||
    group != 'no'
  )

  const group_list = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' }
  ];

  const [state, formAction] = useFormState(updateNewMemberInvite, initialState);
    state?.message && toast.success(state?.message);

  const codeElement = 
`<span style='color: #6CE9A6'>// Imports</span>
<span style='color: #FAA7E0'>import</span> <span style='color: #84CAFF'>mongoose</span>, { <span style='color: #84CAFF'>Schema</span> } <span style='color: #FAA7E0'>from</span> 'untitled'

<span style='color: #6CE9A6'>// Collection name</span>
<span style='color: #FAA7E0'>export const</span> <span style='color: #84CAFF'>collection</span> = 'Design'|

<span style='color: #6CE9A6'>// Schema</span>
<span style='color: #FAA7E0'>const</span> <span style='color: #84CAFF'>schema</span> = <span style='color: #FAA7E0'>new</span> Schema({
  <span style='color: #84CAFF'>name</span>: {
    <span style='color: #84CAFF'>type</span>: String,
    <span style='color: #84CAFF'>required</span>: true
  },

  <span style='color: #84CAFF'>description</span>: {
    <span style='color: #84CAFF'>type</span>: String
  }
}, {<span style='color: #84CAFF'>timestamps</span>: true})`

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[20px] flex flex-col w-full pb-[24px] border-b border-o-border'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            New Member Invite
          </h3>

          <div className='text-o-text-medium3 text-f14'>
            Modify the email sent when a user is invited to the system.
          </div>
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
            containerStyle='!w-[120px]'
            disabled={incorrect || !isChanged}
            small
          />
        </div>
      </div>

      <section className='w-full flex items-start gap-[20px]'>
        <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
          <InputElement 
            name='subject'
            label='Subject'
            placeholder='Email subject'
            value={subject}
            changeValue={setSubject}
            required
          />

          <>
            <input 
              name='group'
              value={group}
              readOnly
              className='hidden opacity-0'
            />

            <SelectElement 
              name='group'
              label='Group'
              options={group_list}
              required
              optionStyle='top-[70px]'
              clickerStyle='!w-full'
              value={group}
              changeValue={setGroup}
            />
          </>
        </div>

        <CodeSnippet 
          rawCode=''
          noCopy
          codeContainerStyle='!max-h-[365px]'
          containerStyle='!max-h-[380px]'
          codeElement={codeElement}
        />
      </section>
    </form>
  )
}

export default NewMemberInviteTwo